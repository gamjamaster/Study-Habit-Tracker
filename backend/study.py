from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from database import get_db
from models import Subject, StudySession
import schemas
from auth import get_current_user  # import authentication function
from cache import cache_manager

router = APIRouter()

# 1. Get all subjects
@router.get("/subjects", response_model=List[schemas.Subject])
def read_subjects(
    user_id: str = Depends(get_current_user),  # add JWT authentication
    db: Session = Depends(get_db)
):
    """Reads all subjects for current user only"""
    # Generate cache key
    cache_key = cache_manager.get_cache_key(user_id, "subjects")

    # Check cache for data
    cached_subjects = cache_manager.get(cache_key)
    if cached_subjects:
        print(f"📋 Subjects cache hit for user {user_id}")
        return cached_subjects

    subjects = db.query(Subject).filter(Subject.user_id == user_id).all()

    # Store result in cache (15 minutes)
    cache_manager.set(cache_key, subjects, expire_seconds=900)
    print(f"💾 Subjects cached for user {user_id}")

    return subjects

# 2. Create new subject
@router.post("/subjects", response_model=schemas.Subject)
def create_subject(
    subject: schemas.SubjectCreate, 
    user_id: str = Depends(get_current_user),  # add JWT authentication
    db: Session = Depends(get_db)
):
    """Creates a new subject for current user"""
    db_subject = Subject(
        name=subject.name,
        color=subject.color,
        user_id=user_id  # connect user ID to the subject
    )
    db.add(db_subject)
    db.commit()
    db.refresh(db_subject)
    return db_subject

# 3. Get all study sessions
@router.get("/study-sessions", response_model=List[schemas.StudySessionResponse])
def read_study_sessions(
    user_id: str = Depends(get_current_user),  # add JWT authentication
    db: Session = Depends(get_db)
):
    """Reads all study sessions for current user only"""
    # Generate cache key
    cache_key = cache_manager.get_cache_key(user_id, "study_sessions")

    # Check cache for data
    cached_sessions = cache_manager.get(cache_key)
    if cached_sessions:
        print(f"📋 Study sessions cache hit for user {user_id}")
        return cached_sessions

    study_sessions = db.query(StudySession).filter(StudySession.user_id == user_id).all()

    # Store result in cache (10 minutes)
    cache_manager.set(cache_key, study_sessions, expire_seconds=600)
    print(f"💾 Study sessions cached for user {user_id}")

    return study_sessions

# 4. Create new study session
@router.post("/study-sessions", response_model=schemas.StudySessionResponse)
def create_study_session(
    study_session: schemas.StudySessionCreate, 
    user_id: str = Depends(get_current_user),  # add JWT authentication
    db: Session = Depends(get_db)
):
    """Creates a new study session for current user"""
    # Check if subject belongs to current user
    subject = db.query(Subject).filter(
        Subject.id == study_session.subject_id,
        Subject.user_id == user_id
    ).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found or access denied")
    
    db_study_session = StudySession(
        subject_id=study_session.subject_id,
        duration_minutes=study_session.duration_minutes,
        notes=study_session.notes,
        user_id=user_id  # connect user ID to the study session
    )
    db.add(db_study_session)
    db.commit()
    db.refresh(db_study_session)

    # Invalidate cache when data changes (also invalidate dashboard summary)
    dashboard_cache_key = cache_manager.get_cache_key(user_id, "dashboard_summary")
    cache_manager.delete(dashboard_cache_key)
    print(f"🗑️ Dashboard summary cache invalidated for user {user_id}")

    return db_study_session

# 5. Delete subject
@router.delete("/subjects/{subject_id}")
def delete_subject(
    subject_id: int, 
    user_id: str = Depends(get_current_user),  # add JWT authentication
    db: Session = Depends(get_db)
):
    """Deletes a subject for current user only"""
    subject = db.query(Subject).filter(
        Subject.id == subject_id,
        Subject.user_id == user_id  # ensure user owns this subject
    ).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found or access denied")

    db.delete(subject)
    db.commit()
    return {"message": "Subject deleted successfully"}

# 6. Update subject
@router.put("/subjects/{subject_id}", response_model=schemas.Subject)
def update_subject(
    subject_id: int, 
    subject_update: schemas.SubjectUpdate, 
    user_id: str = Depends(get_current_user),  # add JWT authentication
    db: Session = Depends(get_db)
):
    """Updates a subject for current user only"""
    subject = db.query(Subject).filter(
        Subject.id == subject_id,
        Subject.user_id == user_id  # ensure user owns this subject
    ).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found or access denied")

    # Update only the fields that are provided
    if subject_update.name is not None:
        subject.name = subject_update.name
    if subject_update.color is not None:
        subject.color = subject_update.color

    db.commit()
    db.refresh(subject)
    return subject
# 7. Delete study session
@router.delete("/study-sessions/{session_id}") # session id parameter on the URL path
def delete_study_session(
    session_id: int, 
    user_id: str = Depends(get_current_user),  # add JWT authentication
    db: Session = Depends(get_db)
):
    """Deletes a study session for current user only"""
    study_session = db.query(StudySession).filter(
        StudySession.id == session_id,
        StudySession.user_id == user_id  # ensure user owns this study session
    ).first() # find the session with its id
    if not study_session:
        raise HTTPException(status_code = 404, detail = "Study session not found or access denied") # 404 error if the session does not exist
    
    db.delete(study_session) # delete from the database
    db.commit() # keep the change
    return {"message": "Study session deleted successfully"} # return the success message
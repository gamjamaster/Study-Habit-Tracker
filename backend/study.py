from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from database import get_db
from models import Subject, StudySession
import schemas

router = APIRouter()

# 1. Get all subjects
@router.get("/subjects", response_model=List[schemas.Subject])
def read_subjects(db: Session = Depends(get_db)):
    """Reads all subjects"""
    subjects = db.query(Subject).all()
    return subjects

# 2. Create new subject
@router.post("/subjects", response_model=schemas.Subject)
def create_subject(subject: schemas.SubjectCreate, db: Session = Depends(get_db)):
    """Creates a new subject"""
    db_subject = Subject(
        name=subject.name,
        color=subject.color
    )
    db.add(db_subject)
    db.commit()
    db.refresh(db_subject)
    return db_subject

# 3. Get all study sessions
@router.get("/study-sessions", response_model=List[schemas.StudySessionResponse])
def read_study_sessions(db: Session = Depends(get_db)):
    """Reads all study sessions"""
    study_sessions = db.query(StudySession).all()
    return study_sessions

# 4. Create new study session
@router.post("/study-sessions", response_model=schemas.StudySessionResponse)
def create_study_session(study_session: schemas.StudySessionCreate, db: Session = Depends(get_db)):
    """Creates a new study session"""
    db_study_session = StudySession(
        subject_id=study_session.subject_id,
        duration_minutes=study_session.duration_minutes,
        notes=study_session.notes
    )
    db.add(db_study_session)
    db.commit()
    db.refresh(db_study_session)
    return db_study_session

# 5. Delete subject
@router.delete("/subjects/{subject_id}")
def delete_subject(subject_id: int, db: Session = Depends(get_db)):
    """Deletes a subject"""
    subject = db.query(Subject).filter(Subject.id == subject_id).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")

    db.delete(subject)
    db.commit()
    return {"message": "Subject deleted successfully"}

# 6. Update subject
@router.put("/subjects/{subject_id}", response_model=schemas.Subject)
def update_subject(subject_id: int, subject_update: schemas.SubjectUpdate, db: Session = Depends(get_db)):
    """Updates a subject"""
    subject = db.query(Subject).filter(Subject.id == subject_id).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")

    # Update only the fields that are provided
    if subject_update.name is not None:
        subject.name = subject_update.name
    if subject_update.color is not None:
        subject.color = subject_update.color

    db.commit()
    db.refresh(subject)
    return subject
@router.delete("/study-sessions/{session_id}") # session id parameter on the URL path
def delete_study_session(session_id: int, db: Session = Depends(get_db)):
    """Deletes a study session"""
    study_session = db.query(StudySession). filter(StudySession.id == session_id).first() # find the session with its id
    if not study_session:
        raise HTTPException(status_code = 404, detail = "Study session not found") # 404 error if the session does not exist
    
    db.delete(study_session) # delete from the database
    db.commit() # keep the change
    return {"message": "Study session deleted successfully"} # return the success message
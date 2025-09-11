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

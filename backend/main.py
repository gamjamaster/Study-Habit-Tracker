from fastapi import FastAPI, Depends, HTTPException # brings the main class FastAPI
from fastapi.middleware.cors import CORSMiddleware # tool that gives the web access to this api
from sqlalchemy.orm import Session
from typing import List # list type

# import from database.py, main.py, schemas.py
from database import get_db, create_tables
from models import Subject, StudySession, Habit, HabitLog
import schemas

#main object of the web api server
app = FastAPI(
    title = "Study Habit Tracker",
    description = "API that Tracks and analyzes study habits",
    version = "1.0.0"
) 

app.add_middleware(
    CORSMiddleware, # CORS => web browser security protocol
    allow_origins = ["http://localhost:3000"], # allow access to the api at this URL.
    allow_credentials = True, # allows request for credentials (cookies, authorization header and ...)
    allow_methods = ["*"], # allows every http methods (GET, POST, PUT, DELETE)
    allow_headers = ["*"], # allows every header
)

# creates the table when the server starts
@app.on_event("startup")
def startup_event():
    create_tables()
    print("Database table has been created.")

@app.get("/") # if the root directory(backend) receives get request,
def read_root(): # execute this function
    return{
        "message": "Welcome to Study Habit Tracker API!",
        "version": "1.0.0",
        "docs": "/docs"
    } # welcome message in JSON format

@app.get("/health")
def health_check():
    return{
        "status": "The server is operating normally. "
    }

@app.get("/test")
def test_api():
    return{
        "message": "Test successful."
    }

# db connection test
@app.get("/db-test")
def test_database(db: Session = Depends(get_db)):
    #getting every data from the subject table
    subjects = db.query(Subject).all()
    return{
        "message": "Database connection has been successful.",
        "subjects_count": len(subjects),
        "note": "0 if no subject has been created."
    }

if __name__ == "__main__": # run the code below only when this file is ran
    import uvicorn # server program that excutes FastAPI
    uvicorn.run(app, host = "0.0.0.0", port = 8000, reload = True) # server starts at port num 8000, reload = True means the server automatically reloads when code has been modified.

# ======== subject management API ===========
# 1. checking every subject
@app.get("/subjects", response_model = List[schemas.Subject])
def get_subjects(db: Session = Depends(get_db)):
    """Brings the list of every subjcet"""
    subjects = db.query(Subject).all() # brings the list of every subject
    return subjects

# 2. create new subject
@app.post("/subjects", response_model = schemas.Subject)
def create_subject(subject: schemas.SubjectCreate, db:Session = Depends(get_db)):
    """Create new subject"""
    # creating new subject object
    db_subject = Subject(
        name = subject.name,
        color = subject.color
    )

    # save it in db
    db.add(db_subject)
    db.commit()
    db.refresh(db_subject) # load saved data
    return db_subject

#. 3. load specific subject
@app.get("/subjects/{subject_id}", response_model = schemas.Subject)
def get_subject(subject_id: int, db: Session = Depends(get_db)):
    """Load information of specific subject"""
    subject = db.query(Subject).filter(Subject.id == subject_id).first()
    if not subject:
        raise HTTPException(status_code = 404, detail = "Cannot find the subject")
    return subject

# 4. update subject
@app.put("/subjects/{subject_id}", response_model = schemas.Subject)
def update_subject(subject_id: int, subject_update: schemas.SubjectUpdate, db: Session = Depends(get_db)):
    """Update existing subjects' details"""
    subject = db.query(Subject).filter(Subject.id == subject_id).first()
    if not subject:
        raise HTTPException(status_code = 404, detail = "Cannot find the subject")
    
    # update only the values to be modified
    if subject_update.name is not None:
        subject.name = subject_update.name
    if subject_update.color is not None:
        subject.color = subject_update.color

    db.commit()
    db.refresh(subject)
    return subject

# 5. delete subject
@app.delete("/subjects/{subject_id}")
def delete_subject(subject_id: int, db: Session = Depends(get_db)):
    """Delete subject"""
    subject = db.query(Subject).filter(Subject.id == subject_id).first()
    if not subject:
        raise HTTPException(status_code = 404, detail = "Cannot find the subject")
    
    db.delete(subject)
    db.commit()
    return{"message": f"'{subject.name}' has been deleted"}

# ======== study session management API ===========

# 1. check every study session
@app.get("/study-sessions", response_model = List[schemas.StudySession])
def get_study_sessions(db: Session = Depends(get_db)):
    """Load every study session"""
    sessions = db.query(StudySession).all()
    return sessions
from fastapi import FastAPI, Depends, HTTPException # brings the main class FastAPI
from fastapi.middleware.cors import CORSMiddleware # tool that gives the web access to this api
from sqlalchemy.orm import Session
from typing import List # list type

# import from database.py, main.py, schemas.py
from database import get_db, create_tables
from models import Subject, StudySession, Habit, HabitLog
import schemas

from habit import router as habit_router

#main object of the web api server
app = FastAPI(
    title = "Study Habit Tracker",
    description = "API that Tracks and analyzes study habits",
    version = "1.0.0"
) 

app.include_router(habit_router)

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
    """Creates new subject"""
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
    """Loads information of specific subject"""
    subject = db.query(Subject).filter(Subject.id == subject_id).first()
    if not subject:
        raise HTTPException(status_code = 404, detail = "Cannot find the subject")
    return subject

# 4. update subject
@app.put("/subjects/{subject_id}", response_model = schemas.Subject)
def update_subject(subject_id: int, subject_update: schemas.SubjectUpdate, db: Session = Depends(get_db)):
    """Updates existing subjects' details"""
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
    """Deletes a subject"""
    subject = db.query(Subject).filter(Subject.id == subject_id).first()
    if not subject:
        raise HTTPException(status_code = 404, detail = "Cannot find the subject")
    
    db.delete(subject)
    db.commit()
    return{"message": f"'{subject.name}' has been deleted"}

# ======== study session management API ===========

# 1. check every study session
@app.get("/study-sessions", response_model = List[schemas.StudySession]) # use the GET method API
def get_study_sessions(db: Session = Depends(get_db)): # the return value is the lis tfrom StudySession schema
                                                       # the db session is received by dependeny insertion
    """Loads every study session"""
    sessions = db.query(StudySession).all() # check every table of StudySession
    return sessions # return the study sessions

# 2. create new study session
@app.post("/study-sessions", response_model = schemas.StudySession) # use the POST method API
def create_study_session(session: schemas.StudySessionCreate, db: Session = Depends(get_db)):
    # session: schemas.StudySessionCreate: parse the data that has been requested(study sessions)
    """Creates a new study session"""
    # check if the subject exists
    subject = db.query(Subject).filter(Subject.id == session.subject_id).first()
    # 404 error if it doesnt
    if not subject:
        raise HTTPException(status_code = 404, detail = "Cannot find the subject")
    
    # creating new study session object
    db_session = StudySession(
        subject_id = session.subject_id,
        duration_minutes = session.duration_minutes,
        notes = session.notes
    )

    # save the object in the db
    db.add(db_session) # add the study session object in the db
    db.commit() # save
    db.refresh(db_session) # refresh the object
    return db_session # return the study session

# 3. check a specific study session
@app.get("/study-sessions/{session_id}", response_model = schemas.StudySession) # use a specific id to search for the session
def get_study_session(session_id: int, db: Session = Depends(get_db)): # session_id: int: get the session id from the URL
    """Loads the details of a specific study session"""
    session = db.query(StudySession).filter(StudySession.id == session_id).first() # search for the session with the id provided
    if not session:
        raise HTTPException(status_code = 404, detail = "Cannot find the study session") # 404 error if it doesnt exist
    return session # return the session

# 4. update study session
@app.put("/study-sessions/{session_id}", response_model = schemas.StudySession) # use the PUT method to modify the session details
def update_study_session(session_id: int, session_update: schemas.StudySessionUpdate, db: Session = Depends(get_db)): # session_update: schemas.StudySessionUpdate parse the detaisl to be updated
    """Updates the details of existing study sessions"""
    session = db.query(StudySession).filter(StudySession.id == session_id).first() # search for the study session
    if not session: # 404 error if the session does not exist
        raise HTTPException(status_code = 404, detail = "Cannot find the study session")
    
    # change only the fields to be updated
    if session_update.subject_id is not None:
        # if the new subject exists
        subject = db.query(Subject).filter(Subject.id == session_update.subject_id).first()
        if not subject: # 404 error if the subject does not exist
            raise HTTPException(status_code = 404, detail = "Cannot find the subject")
        session.subject_id = session_update.subject_id

        if session_update.duration_minutes is not None: # update the study time
            session.duration_minutes = session_update.duration_minutes

        if session_update.notes is not None: # update the notes
            session.notes = session_update.notes

        db.commit() # save the updated details
        db.refresh(session) # refresh the session
        return session # return the session
    
# 5. delete study session
@app.delete("/study-sessions/{session_id}") # use the DELETE method to remove a specific session
def delete_study_session(session_id: int, db: Session = Depends(get_db)):
    """Deletes a study session"""
    session = db.query(StudySession).filter(StudySession.id == session_id).first() # search for the session
    if not session: # 404 error if the session does not exist
        raise HTTPException(status_code = 404, detail = "Cannot find the study session")
    
    db.delete(session) # delete the session
    db.commit() # save the change
    return{ # return the message
        "message": f"The study session has been deleted."
    }

# 6. search for the sessions with a specific subject
@app.get("/subjects/{subject_id}/study-sessions", response_model = List[schemas.StudySession]) # use the GET method to search for all the sessions with a specific subject
def get_subject_study_sessions(subject_id: int, db: Session = Depends(get_db)):
    """Brings the study sessions of a specfic subject"""
    subject = db.query(Subject).filter(Subject.id == subject_id).first()
    if not subject: # 404 error if the session does not exist
        raise HTTPException(status_code = 404, detail = "Cannot find the subject")
    
    sessions = db.query(StudySession).filter(StudySession.subject_id == subject_id).all() # use the subject id to search for the sessions
    return sessions # return the list of sessions
from fastapi import FastAPI, Depends, HTTPException # brings the main class FastAPI
from fastapi.middleware.cors import CORSMiddleware # tool that gives the web access to this api
from fastapi.middleware.httpsredirect import HTTPSRedirectMiddleware
from sqlalchemy.orm import Session
from typing import List # list type
from datetime import datetime, timedelta
from sqlalchemy import func, extract
from models import Subject, StudySession, Habit, HabitLog, Goal, Profile
from auth import get_current_user  # autshentication function
import calendar
import schemas  # for goal schemas
import os

# import from database.py, main.py, schemas.py
from database import get_db, create_tables, engine
from models import Subject, StudySession, Habit, HabitLog
import schemas

from habit import router as habit_router

from study import router as study_router

# Database type detection for date formatting functions
def get_date_format_func():
    """Get appropriate date formatting function based on database type"""
    db_type = engine.url.drivername
    if 'postgresql' in db_type:
        def pg_date_format(column, format_str):
            # Convert SQLite strftime format to PostgreSQL to_char format
            pg_format = format_str.replace('%Y', 'YYYY').replace('%m', 'MM').replace('%d', 'DD')
            if '%w' in format_str:
                # PostgreSQL uses 'ID' for day of week (0=Sunday, 6=Saturday)
                pg_format = pg_format.replace('%w', 'ID')
            return func.to_char(column, pg_format)
        return pg_date_format
    else:  # SQLite and others
        return func.strftime

#main object of the web api server
app = FastAPI(
    title = "Study Habit Tracker",
    description = "API that Tracks and analyzes study habits",
    version = "1.0.0"
) 

# HTTPS redirect - only apply in production
if os.getenv("ENVIRONMENT") == "production":
    app.add_middleware(HTTPSRedirectMiddleware)

app.add_middleware(
    CORSMiddleware, # CORS => web browser security protocol
    allow_origins=["https://www.studyhabittrack.tech", "https://studyhabittrack.tech", "http://localhost:3000"], # explicitly allow these origins
    allow_credentials = True, # allows request for credentials (cookies, authorization header and ...)
    allow_methods = ["GET", "POST", "PUT", "DELETE", "OPTIONS"], # explicitly allow OPTIONS
    allow_headers = ["*"], # allows every header
)

# Handle OPTIONS requests for CORS preflight
@app.options("/{path:path}")
async def handle_options(path: str):
    return {"message": "OK"}

# ======== Profile Management API ==========
@app.post("/profiles/", response_model=schemas.Profile)
def create_profile(
    profile: schemas.ProfileCreate,
    user_id: str = Depends(get_current_user),  # Get authenticated user ID
    db: Session = Depends(get_db)
):
    """Create a new user profile with email uniqueness validation"""
    # Check if email already exists
    existing_profile = db.query(Profile).filter(Profile.email == profile.email).first()
    if existing_profile:
        raise HTTPException(
            status_code=400,
            detail="An account with this email already exists. Please use a different email address."
        )

    # Use provided ID or authenticated user ID
    profile_id = profile.id if profile.id else user_id

    # Create new profile
    db_profile = Profile(
        id=profile_id,
        user_id=profile_id,  # Also set user_id for consistency
        email=profile.email,
        full_name=profile.full_name,
        avatar_url=profile.avatar_url
    )

    try:
        db.add(db_profile)
        db.commit()
        db.refresh(db_profile)
        return db_profile
    except Exception as e:
        db.rollback()
        # Handle unique constraint violation
        if "unique constraint" in str(e).lower() or "duplicate key" in str(e).lower():
            raise HTTPException(
                status_code=400,
                detail="An account with this email already exists. Please use a different email address."
            )
        raise HTTPException(status_code=500, detail=f"Failed to create profile: {str(e)}")

@app.get("/profiles/me", response_model=schemas.Profile)
def get_my_profile(
    user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's profile"""
    profile = db.query(Profile).filter(Profile.id == user_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile

@app.put("/profiles/me", response_model=schemas.Profile)
def update_my_profile(
    profile_update: schemas.ProfileCreate,
    user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update current user's profile"""
    profile = db.query(Profile).filter(Profile.id == user_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    # Check email uniqueness if email is being changed
    if profile_update.email != profile.email:
        existing_profile = db.query(Profile).filter(
            Profile.email == profile_update.email,
            Profile.id != user_id  # Exclude current user
        ).first()
        if existing_profile:
            raise HTTPException(
                status_code=400,
                detail="This email address is already in use by another account."
            )

    # Update profile fields
    profile.email = profile_update.email
    profile.full_name = profile_update.full_name
    profile.avatar_url = profile_update.avatar_url
    profile.updated_at = datetime.now()

    db.commit()
    db.refresh(profile)
    return profile

from dashboard import router as dashboard_router
app.include_router(dashboard_router)

app.include_router(habit_router)

app.include_router(study_router)

from groups import router as groups_router
app.include_router(groups_router)

# creates the table when the server starts
@app.on_event("startup")
def startup_event():
    create_tables()

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
def get_subjects(
    user_id: str = Depends(get_current_user),  # auth dependency
    db: Session = Depends(get_db)
):
    """Brings the list of current user's subjects only"""
    subjects = db.query(Subject).filter(Subject.user_id == user_id).all() # brings current user's subjects only
    return subjects

# 2. create new subject
@app.post("/subjects", response_model = schemas.Subject)
def create_subject(
    subject: schemas.SubjectCreate, 
    user_id: str = Depends(get_current_user),  # auth dependency
    db: Session = Depends(get_db)
):
    """Creates new subject for current user"""
    # creating new subject object with user_id
    db_subject = Subject(
        name = subject.name,
        color = subject.color,
        user_id = user_id  # connect the current user id
    )

    # save it in db
    db.add(db_subject)
    db.commit()
    db.refresh(db_subject) # load saved data
    return db_subject

#. 3. load specific subject
@app.get("/subjects/{subject_id}", response_model = schemas.Subject)
def get_subject(
    subject_id: int, 
    user_id: str = Depends(get_current_user),  # auth dependency
    db: Session = Depends(get_db)
):
    """Loads information of specific subject for current user only"""
    subject = db.query(Subject).filter(
        Subject.id == subject_id, 
        Subject.user_id == user_id  # check for the user
    ).first()
    if not subject:
        raise HTTPException(status_code = 404, detail = "Cannot find the subject or access denied")
    return subject

# 4. update subject
@app.put("/subjects/{subject_id}", response_model = schemas.Subject)
def update_subject(
    subject_id: int, 
    subject_update: schemas.SubjectUpdate, 
    user_id: str = Depends(get_current_user),  # auth dependency
    db: Session = Depends(get_db)
):
    """Updates existing subjects' details for current user only"""
    subject = db.query(Subject).filter(
        Subject.id == subject_id, 
        Subject.user_id == user_id  # check for the user
    ).first()
    if not subject:
        raise HTTPException(status_code = 404, detail = "Cannot find the subject or access denied")
    
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
def delete_subject(
    subject_id: int, 
    user_id: str = Depends(get_current_user),  # auth dependency
    db: Session = Depends(get_db)
):
    """Deletes a subject for current user only"""
    subject = db.query(Subject).filter(
        Subject.id == subject_id, 
        Subject.user_id == user_id  # check for the user
    ).first()
    if not subject:
        raise HTTPException(status_code = 404, detail = "Cannot find the subject or access denied")
    
    db.delete(subject)
    db.commit()
    return{"message": f"'{subject.name}' has been deleted"}

# ======== study session management API ===========

# 1. check every study session
@app.get("/study-sessions", response_model = List[schemas.StudySession]) # use the GET method API
def get_study_sessions(
    user_id: str = Depends(get_current_user),  # auth dependency
    db: Session = Depends(get_db)
): # the return value is the list from StudySession schema
    """Loads current user's study sessions only"""
    sessions = db.query(StudySession).filter(StudySession.user_id == user_id).all() # check current user's StudySession only
    return sessions # return the study sessions

# 2. create new study session
@app.post("/study-sessions", response_model = schemas.StudySession) # use the POST method API
def create_study_session(
    session: schemas.StudySessionCreate, 
    user_id: str = Depends(get_current_user),  # auth dependency
    db: Session = Depends(get_db)
):
    # session: schemas.StudySessionCreate: parse the data that has been requested(study sessions)
    """Creates a new study session for current user"""
    # check if the subject exists and belongs to current user
    subject = db.query(Subject).filter(
        Subject.id == session.subject_id, 
        Subject.user_id == user_id  # check for the user
    ).first()
    # 404 error if it doesnt exist or access denied
    if not subject:
        raise HTTPException(status_code = 404, detail = "Cannot find the subject or access denied")
    
    # creating new study session object with user_id
    db_session = StudySession(
        subject_id = session.subject_id,
        duration_minutes = session.duration_minutes,
        notes = session.notes,
        user_id = user_id  # connect the current user id
    )

    # save the object in the db
    db.add(db_session) # add the study session object in the db
    db.commit() # save
    db.refresh(db_session) # refresh the object
    return db_session # return the study session

# 3. check a specific study session
@app.get("/study-sessions/{session_id}", response_model = schemas.StudySession) # use a specific id to search for the session
def get_study_session(
    session_id: int, 
    user_id: str = Depends(get_current_user),  # add JWT authentication
    db: Session = Depends(get_db)
): # session_id: int: get the session id from the URL
    """Loads the details of a specific study session for current user only"""
    session = db.query(StudySession).filter(
        StudySession.id == session_id,
        StudySession.user_id == user_id  # ensure user owns this session
    ).first() # search for the session with the id provided
    if not session:
        raise HTTPException(status_code = 404, detail = "Cannot find the study session or access denied") # 404 error if it doesnt exist
    return session # return the session

# 4. update study session
@app.put("/study-sessions/{session_id}", response_model = schemas.StudySession) # use the PUT method to modify the session details
def update_study_session(
    session_id: int, 
    session_update: schemas.StudySessionUpdate, 
    user_id: str = Depends(get_current_user),  # add JWT authentication
    db: Session = Depends(get_db)
): # session_update: schemas.StudySessionUpdate parse the detaisl to be updated
    """Updates the details of existing study sessions for current user only"""
    session = db.query(StudySession).filter(
        StudySession.id == session_id,
        StudySession.user_id == user_id  # ensure user owns this session
    ).first() # search for the study session
    if not session: # 404 error if the session does not exist
        raise HTTPException(status_code = 404, detail = "Cannot find the study session or access denied")
    
    # change only the fields to be updated
    if session_update.subject_id is not None:
        # if the new subject exists and belongs to current user
        subject = db.query(Subject).filter(
            Subject.id == session_update.subject_id,
            Subject.user_id == user_id  # ensure subject belongs to current user
        ).first()
        if not subject: # 404 error if the subject does not exist or access denied
            raise HTTPException(status_code = 404, detail = "Cannot find the subject or access denied")
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
def delete_study_session(
    session_id: int, 
    user_id: str = Depends(get_current_user),  # add JWT authentication
    db: Session = Depends(get_db)
):
    """Deletes a study session for current user only"""
    session = db.query(StudySession).filter(
        StudySession.id == session_id,
        StudySession.user_id == user_id  # ensure user owns this session
    ).first() # search for the session
    if not session: # 404 error if the session does not exist
        raise HTTPException(status_code = 404, detail = "Cannot find the study session or access denied")
    
    db.delete(session) # delete the session
    db.commit() # save the change
    return{ # return the message
        "message": f"The study session has been deleted."
    }

# 6. search for the sessions with a specific subject
@app.get("/subjects/{subject_id}/study-sessions", response_model = List[schemas.StudySession]) # use the GET method to search for all the sessions with a specific subject
def get_subject_study_sessions(
    subject_id: int, 
    user_id: str = Depends(get_current_user),  # add JWT authentication
    db: Session = Depends(get_db)
):
    """Brings the study sessions of a specific subject for current user only"""
    subject = db.query(Subject).filter(
        Subject.id == subject_id,
        Subject.user_id == user_id  # ensure subject belongs to current user
    ).first()
    if not subject: # 404 error if the subject does not exist or access denied
        raise HTTPException(status_code = 404, detail = "Cannot find the subject or access denied")
    
    sessions = db.query(StudySession).filter(
        StudySession.subject_id == subject_id,
        StudySession.user_id == user_id  # ensure sessions belong to current user
    ).all() # use the subject id to search for the sessions
    return sessions # return the list of sessions

#-------------------------------- data analysis API endpoints--------------------------------------------
@app.get("/analytics/study-stats")
def get_study_statistics(
    period: str = "week", 
    user_id: str = Depends(get_current_user),  # auth dependency
    db: Session = Depends(get_db)
):
    """Returns weekly/monthly study statistics"""
    try:
        now = datetime.now()

        if period == "week":
            # data for the past 7 days
            start_date = now - timedelta(days = 7)
            date_func = get_date_format_func()

            # daily study time for current user only
            daily_stats = db.query(
                date_func(StudySession.created_at, '%Y-%m-%d').label('date'),
                func.sum(StudySession.duration_minutes).label('total_minutes'),
                func.count(StudySession.id).label('session_count')
            ).filter(
                StudySession.created_at >= start_date,
                StudySession.user_id == user_id  # add user filtering
            ).group_by(
                date_func(StudySession.created_at, '%Y-%m-%d')
            ).all()
        
        elif period == "month":
            # data for the past 30 days
            start_date = now - timedelta(days = 30)
            date_func = get_date_format_func()

            # daily study time for current user only
            daily_stats = db.query(
                date_func(StudySession.created_at, '%Y-%m-%d').label('date'),
                func.sum(StudySession.duration_minutes).label('total_minutes'),
                func.count(StudySession.id).label('session_count')
            ).filter(
                StudySession.created_at >= start_date,
                StudySession.user_id == user_id  # add user filtering
            ).group_by(
                date_func(StudySession.created_at, '%Y-%m-%d')
            ).all()

        # stats per subject for current user only
        subject_stats = db.query(
            Subject.name,
            Subject.color,
            func.sum(StudySession.duration_minutes).label('total_minutes'),
            func.count(StudySession.id).label('session_count')
        ).join(StudySession).filter(
            StudySession.created_at >= start_date,
            StudySession.user_id == user_id,  # add user filtering
            Subject.user_id == user_id  # add user filtering
        ).group_by(
            Subject.id, Subject.name, Subject.color
        ).all()

        return {
            "period": period,
            "daily_stats": [
                {
                    "date": str(stat.date),
                    "total_minutes": stat.total_minutes or 0,
                    "session_count": stat.session_count or 0
                }
                for stat in daily_stats
            ],
            "subject_stats": [
                {
                    "subject": stat.name,
                    "color": stat.color,
                    "total_minutes": stat.total_minutes or 0,
                    "session_count": stat.session_count or 0
                }
                for stat in subject_stats
            ]
        }

    except Exception as e:
        raise HTTPException(status_code = 500, detail = str(e))

# ======== Dashboard Summary API ===========
@app.get("/dashboard/summary")
def get_dashboard_summary(
    user_id: str = Depends(get_current_user),  # auth dependency
    db: Session = Depends(get_db)
):
    """Returns current user's dashboard summary data"""
    try:
        from datetime import datetime, timedelta

        today = datetime.now().date()
        date_func = get_date_format_func()

        # calculates today's study time of the day (PostgreSQL compatible)
        study_today = db.query(StudySession).filter(
            StudySession.user_id == user_id,
            date_func(StudySession.created_at, '%Y-%m-%d') == today.strftime('%Y-%m-%d')
        ).with_entities(func.sum(StudySession.duration_minutes)).scalar() or 0

        # habit achieved today (PostgreSQL compatible)
        habits_done = db.query(HabitLog).filter(
            HabitLog.user_id == user_id,
            date_func(HabitLog.completed_date, '%Y-%m-%d') == today.strftime('%Y-%m-%d')
        ).count()
        
        # total number of habits
        total_habits = db.query(Habit).filter(
            Habit.user_id == user_id
        ).count()
        
        return {
            "study_today": study_today,
            "habit_done": habits_done,
            "habit_total": total_habits
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.get("/analytics/habit-completion")
def get_habit_completion_stats(
    period: str = "week", 
    user_id: str = Depends(get_current_user),  # add JWT authentication
    db: Session = Depends(get_db)
):
    """Analyse the habit completion data"""
    try:
        now = datetime.now()

        if period == "week":
            start_date = now - timedelta(days = 7)
        else:
            start_date = now - timedelta(days = 30)

        # daily habit completion data for current user only
        total_habits = db.query(func.count(Habit.id)).filter(Habit.user_id == user_id).scalar()
        date_func = get_date_format_func()

        daily_completion = db.query(
            date_func(HabitLog.completed_date, '%Y-%m-%d').label('date'),
            func.count(func.distinct(HabitLog.habit_id)).label('completed_habits')
        ).join(Habit, HabitLog.habit_id == Habit.id).filter(
            Habit.user_id == user_id,  # filter by user_id
            HabitLog.completed_date >= start_date
        ).group_by(
            date_func(HabitLog.completed_date, '%Y-%m-%d')
        ).all()

        # completion rate by day of the week for current user only
        weekday_completion = db.query(
            date_func(HabitLog.completed_date, '%w').label('weekday'),
            func.count(func.distinct(HabitLog.habit_id)).label('completion_count')
        ).join(Habit, HabitLog.habit_id == Habit.id).filter(
            Habit.user_id == user_id,  # filter by user_id
            HabitLog.completed_date >= start_date
        ).group_by(
            date_func(HabitLog.completed_date, '%w')
        ).all()

        # completion rate by habit for current user only
        habit_stats = db.query(
            Habit.name,
            func.count(func.distinct(HabitLog.habit_id)).label('completion_count')
        ).join(HabitLog).filter(
            Habit.user_id == user_id,  # filter by user_id
            HabitLog.completed_date >= start_date
        ).group_by(Habit.id, Habit.name).all()

        return {
            "period": period,
            "total_habits": total_habits,
            "daily_completion": [
                {
                    "date": str(stat.date),
                    "completed_habits": stat.completed_habits,
                    "completion_rate": (stat.completed_habits / total_habits * 100) if total_habits > 0 else 0
                }
                for stat in daily_completion
            ],
            "weekday_completion": [
                {
                    "weekday": int(stat.weekday),
                    "weekday_name": calendar.day_name[int(stat.weekday)],
                    "completion_count": stat.completion_count
                }
                for stat in weekday_completion
            ],
            "habit_stats": [
                {
                    "habit_name": stat.name,
                    "completion_count": stat.completion_count
                }
                for stat in habit_stats
            ]
        }

    except Exception as e:
        raise HTTPException(status_code = 500, detail = str(e))
    
@app.get("/analytics/correlation")
def get_study_habit_correlation(
    user_id: str = Depends(get_current_user),  # add JWT authentication
    db: Session = Depends(get_db)
):
    """Correlation analysis between study time and habit completion rate"""
    try:
        # data for the past 30 days
        start_date = datetime.now() - timedelta(days = 30)
        date_func = get_date_format_func()

        # Daily study time and number of habits completed
        correlation_data = db.query(
            date_func(StudySession.created_at, '%Y-%m-%d').label('date'),
            func.sum(StudySession.duration_minutes).label('study_minutes')
        ).filter(
            StudySession.user_id == user_id,  # filter by user_id
            StudySession.created_at >= start_date
        ).group_by(
            date_func(StudySession.created_at, '%Y-%m-%d')
        ).subquery()

        habit_data = db.query(
            date_func(HabitLog.completed_date, '%Y-%m-%d').label('date'),
            func.count(func.distinct(HabitLog.habit_id)).label('habit_count')
        ).join(Habit, HabitLog.habit_id == Habit.id).filter(
            Habit.user_id == user_id,  # filter by user_id
            HabitLog.completed_date >= start_date
        ).group_by(
            date_func(HabitLog.completed_date, '%Y-%m-%d')
        ).subquery()

        # combined data
        combined_data = db.query(
            correlation_data.c.date,
            correlation_data.c.study_minutes,
            habit_data.c.habit_count
        ).outerjoin(
            habit_data, correlation_data.c.date == habit_data.c.date
        ).all()
        
        return {
            "correlation_data": [
                {
                    "date": str(data.date),
                    "study_minutes": data.study_minutes or 0,
                    "habit_count": data.habit_count or 0
                }
                for data in combined_data
            ]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.post("/goals/", response_model=schemas.Goal)
def create_goal(goal: schemas.GoalCreate, db: Session = Depends(get_db)):
    """Create a new goal"""
    db_goal = Goal(
        user_id="1",
        goal_type=goal.goal_type,
        target_value=goal.target_value,
        target_unit=goal.target_unit,
        period=goal.period,
        description=goal.description,
        is_active=goal.is_active
    )
    db.add(db_goal)
    db.commit()
    db.refresh(db_goal)
    return db_goal

@app.get("/goals/", response_model=List[schemas.Goal])
def get_goals(db: Session = Depends(get_db)):
    """Check every active goals"""
    goals = db.query(Goal).filter(Goal.is_active == 1).all()
    return goals

@app.put("/goals/{goal_id}", response_model=schemas.Goal)
def update_goal(goal_id: int, goal_update: schemas.GoalUpdate, db: Session = Depends(get_db)):
    """Update existing goals"""
    goal = db.query(Goal).filter(Goal.id == goal_id).first()
    if goal is None:
        raise HTTPException(status_code=404, detail="Cannot find the goal")
    
    # update the required fields
    for field, value in goal_update.dict(exclude_unset=True).items():
        setattr(goal, field, value)
    
    db.commit()
    db.refresh(goal)
    return goal

@app.delete("/goals/{goal_id}")
def delete_goal(goal_id: int, db: Session = Depends(get_db)):
    """Deactivates the goal (is_active = 0)"""
    goal = db.query(Goal).filter(Goal.id == goal_id).first()
    if goal is None:
        raise HTTPException(status_code=404, detail="Cannot find the goal")
    
    goal.is_active = 0
    db.commit()
    return {"message": "The goal has successfully been deactivated"}

@app.get("/goals/{goal_id}/progress")
def get_goal_progress(goal_id: int, db: Session = Depends(get_db)):
    """Calculates the achievement rate of a specific goal and returns it"""
    goal = db.query(Goal).filter(Goal.id == goal_id, Goal.is_active == 1).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")

    # date calculation
    from datetime import datetime, timedelta
    now = datetime.now()
    if goal.period == "daily":
        start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
    elif goal.period == "weekly":
        start_date = now - timedelta(days=now.weekday())
        start_date = start_date.replace(hour=0, minute=0, second=0, microsecond=0)
    elif goal.period == "monthly":
        start_date = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    else:
        start_date = now

    # calculates the achievement rate
    actual_value = 0
    if goal.goal_type in ["daily_study", "weekly_study", "monthly_study"]:
        # study time addition
        actual_value = db.query(
            StudySession
        ).filter(
            StudySession.created_at >= start_date
        ).with_entities(
            func.sum(StudySession.duration_minutes)
        ).scalar() or 0
    elif goal.goal_type in ["daily_habit", "weekly_habit"]:
        # habit achievement addition
        actual_value = db.query(
            HabitLog
        ).filter(
            HabitLog.completed_date >= start_date
        ).count()

    # success rate calculation
    progress = min(100, int((actual_value / goal.target_value) * 100)) if goal.target_value > 0 else 0

    return {
        "goal_id": goal.id,
        "goal_type": goal.goal_type,
        "period": goal.period,
        "target_value": goal.target_value,
        "actual_value": actual_value,
        "progress": progress
    }

# ======== Activity Heatmap API ===========
@app.get("/api/activity-heatmap", response_model=schemas.HeatmapResponse)
def get_activity_heatmap(
    year: int = datetime.now().year,
    activity_type: str = "all",  # "all", "study", "habit"
    user_id: str = Depends(get_current_user),  # auth dependency
    db: Session = Depends(get_db)
):
    """
    GitHub-style activity heatmap data for the specified year
    Returns daily activity levels (0-4) based on study time and habit completion
    """
    from datetime import date
    import calendar
    
    # Generate all dates for the year
    start_date = date(year, 1, 1)
    end_date = date(year, 12, 31)
    date_func = get_date_format_func()
    
    # Get study sessions for the year (current user only)
    study_sessions = db.query(StudySession).filter(
        date_func(StudySession.created_at, '%Y-%m-%d') >= start_date.strftime('%Y-%m-%d'),
        date_func(StudySession.created_at, '%Y-%m-%d') <= end_date.strftime('%Y-%m-%d'),
        StudySession.user_id == user_id  # add user filtering
    ).all()
    
    # Get habit logs for the year (current user only)
    habit_logs = db.query(HabitLog).filter(
        date_func(HabitLog.completed_date, '%Y-%m-%d') >= start_date.strftime('%Y-%m-%d'),
        date_func(HabitLog.completed_date, '%Y-%m-%d') <= end_date.strftime('%Y-%m-%d'),
        HabitLog.user_id == user_id  # add user filtering
    ).all()
    
    # Get all habits to calculate completion rates (current user only)
    all_habits = db.query(Habit).filter(Habit.user_id == user_id).all()  # add user filtering
    total_habits_count = len(all_habits)
    
    # Organize data by date
    daily_data = {}
    current_date = start_date
    
    while current_date <= end_date:
        date_str = current_date.strftime("%Y-%m-%d")
        
        # Calculate daily study time
        daily_study = sum(
            session.duration_minutes for session in study_sessions
            if session.created_at.date() == current_date
        )
        
        # Calculate daily habit completion
        daily_habits_completed = len([
            log for log in habit_logs
            if log.completed_date.date() == current_date
        ])
        
        # Calculate completion rate
        habit_completion_rate = (
            daily_habits_completed / total_habits_count 
            if total_habits_count > 0 else 0
        )
        
        # Calculate activity score (0-100)
        study_score = min(daily_study / 60 * 60, 60)  # Max 60 points for 1+ hours
        habit_score = habit_completion_rate * 40  # Max 40 points for 100% habits
        total_score = int(study_score + habit_score)
        
        # Apply activity type filter
        if activity_type == "study":
            total_score = int(study_score * (100/60))  # Normalize to 0-100
        elif activity_type == "habit":
            total_score = int(habit_score * (100/40))  # Normalize to 0-100
        
        # Convert to level (0-4)
        if total_score == 0:
            level = 0
        elif total_score <= 25:
            level = 1
        elif total_score <= 50:
            level = 2
        elif total_score <= 75:
            level = 3
        else:
            level = 4
        
        daily_data[date_str] = schemas.HeatmapData(
            date=date_str,
            value=total_score,
            level=level,
            study_time=daily_study,
            habit_completion_rate=habit_completion_rate,
            total_habits=total_habits_count,
            completed_habits=daily_habits_completed
        )
        
        current_date = date(current_date.year, current_date.month, current_date.day) + timedelta(days=1)
    
    # Calculate summary statistics
    all_values = [data.value for data in daily_data.values()]
    summary = {
        "total_days": len(daily_data),
        "active_days": len([v for v in all_values if v > 0]),
        "average_score": sum(all_values) / len(all_values) if all_values else 0,
        "max_score": max(all_values) if all_values else 0,
        "total_study_time": sum(data.study_time for data in daily_data.values()),
        "total_habit_completions": sum(data.completed_habits for data in daily_data.values()),
        "activity_type": activity_type
    }
    
    return schemas.HeatmapResponse(
        year=year,
        data=list(daily_data.values()),
        summary=summary
    )

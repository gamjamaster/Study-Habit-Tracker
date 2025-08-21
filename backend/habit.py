from fastapi import APIRouter, Depends, HTTPException  # import router, depends and HTTPException from FastAPT
from sqlalchemy.orm import Session  # import session from SQLAlchemy
from typing import List  # import List from tyuping

from database import get_db  # import function to create sessions
from models import Habit, HabitLog  # import habit and habitlog models
import schemas # import schemas

router = APIRouter()

# 1. get every habit
@router.get("/habits", response_model=List[schemas.Habit]) # use the GET method for habit API
def read_habits(db: Session = Depends(get_db)):
    """Reads every habit"""
    habits = db.query(Habit).all()
    return habits

# 2. create new habit
@router.post("/habits", response_model=schemas.Habit) # use the POST method, repond with schemas.habit type
def create_habit(habit: schemas.HabitCreate, db: Session = Depends(get_db)): 
    """Creates new habit"""
    db_habit = Habit( # creates a new habit object
        name=habit.name,
        description=habit.description
    )
    db.add(db_habit)
    db.commit()
    db.refresh(db_habit)
    return db_habit

# 3. search a specific habit
@router.get("/habits/{habit_id}", response_model=schemas.Habit)
def read_habit(habit_id: int, db: Session = Depends(get_db)):
    """Searches for a specific habit"""
    habit = db.query(Habit).filter(Habit.id == habit_id).first()
    if not habit:
        raise HTTPException(status_code=404, detail="Cannot find the habit")
    return habit

# 4. update a habit
@router.put("/habits/{habit_id}", response_model=schemas.Habit)
def update_habit(habit_id: int, habit_update: schemas.HabitUpdate, db: Session = Depends(get_db)):
    """Updates the details of a habit"""
    habit = db.query(Habit).filter(Habit.id == habit_id).first()
    if not habit:
        raise HTTPException(status_code=404, detail="Cannot find the habit")
    if habit_update.name is not None:
        habit.name = habit_update.name
    if habit_update.description is not None:
        habit.description = habit_update.description
    db.commit()
    db.refresh(habit)
    return habit

# 5. delete a habit
@router.delete("/habits/{habit_id}")
def delete_habit(habit_id: int, db: Session = Depends(get_db)):
    """Deletes a habit"""
    habit = db.query(Habit).filter(Habit.id == habit_id).first()
    if not habit:
        raise HTTPException(status_code=404, detail="Cannot find the habit")
    db.delete(habit)
    db.commit()
    return {"message": f"'{habit.name}' habit has been deleted."}

# 6. add habit check logs
@router.post("/habits/{habit_id}/logs", response_model=schemas.HabitLog)
def create_habit_log(habit_id: int, log: schemas.HabitLogCreate, db: Session = Depends(get_db)):
    """Adds habit check logs"""
    habit = db.query(Habit).filter(Habit.id == habit_id).first()
    if not habit:
        raise HTTPException(status_code=404, detail="Cannot find the habit")
    db_log = HabitLog(
        habit_id=habit_id,
        date=log.date,
        status=log.status
    )
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log

# 7. search for the sessions with a specific habit
@router.get("/habits/{habit_id}/logs", response_model=List[schemas.HabitLog])
def read_habit_logs(habit_id: int, db: Session = Depends(get_db)):
    """Brings the sessions of a specific habit"""
    logs = db.query(HabitLog).filter(HabitLog.habit_id == habit_id).all()
    return logs
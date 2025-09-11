from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
import models
from datetime import date

router = APIRouter()

@router.get("/dashboard/summary")
def dashboard_summary(db: Session = Depends(get_db)):
    try:
        print("API called")
        today = date.today()

        # Use created_at instead of start_time since start_time might be null
        study_today = db.query(func.sum(models.StudySession.duration_minutes))\
            .filter(func.date(models.StudySession.created_at) == today)\
            .scalar() or 0

        study_goal = 180

        habit_done = db.query(func.count(models.HabitLog.id))\
            .filter(func.date(models.HabitLog.completed_date) == today)\
            .scalar() or 0

        habit_total = db.query(func.count(models.Habit.id)).scalar() or 1

        print("API returning")
        return {
            "study_today": study_today,
            "study_goal": study_goal,
            "habit_done": habit_done,
            "habit_total": habit_total
        }
    except Exception as e:
        print("API error:", e)
        return {"error": str(e)}
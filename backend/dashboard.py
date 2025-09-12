from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
import models
from datetime import date
from datetime import timedelta

router = APIRouter()

@router.get("/dashboard/summary")
def dashboard_summary(db: Session = Depends(get_db)):
    try:
        print("API called")
        today = date.today()

        study_today = db.query(func.sum(models.StudySession.duration_minutes))\
            .filter(func.date(models.StudySession.created_at) == today)\
            .scalar() or 0

        study_goal = 180

        habit_done = db.query(func.count(models.HabitLog.id))\
            .filter(func.date(models.HabitLog.completed_date) == today)\
            .scalar() or 0

        habit_total = db.query(func.count(models.Habit.id)).scalar() or 0

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
    
@router.get("/dashboard/weekly") # new API endpoint for weekly data
def dashboard_weekly(db: Session = Depends(get_db)):
    try:
        print("Weekly API called") # API call log
        today = date.today() # loading today's date

        weekly_data = [] # list for saving weekly data
        day_names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] # list for days

        for i in range(6,-1,-1): # iterate till today from 6 days ago
            target_date = today - timedelta(days=i) # calculate the date

            # load the total study time for that day
            study_time = db.query(func.sum(models.StudySession.duration_minutes))\
                .filter(func.date(models.StudySession.created_at) == target_date)\
                .scalar() or 0
            
            # load the habit achievement for that day
            habit_count = db.query(func.count(models.HabitLog.id))\
                .filter(func.date(models.HabitLog.completed_date) == target_date)\
                .scalar() or 0
            
            # save the daily data as dictionary
            weekly_data.append({
                "day": day_names[target_date.weekday()], # name of day
                "study_time": study_time, # study time
                "habit_count": habit_count # habit count
            })

        print("Weekly API returning") # API return log
        return{
            "labels": [day["day"] for day in weekly_data], # chart label (day)
            "study_data": [day["study_time"] for day in weekly_data], # study data
            "habit_data": [day["habit_count"] for day in weekly_data] # habit data
        }
    
    except Exception as e:
        print("Weekly API error:", e) # error log
        return {"error": str(e)} # return error
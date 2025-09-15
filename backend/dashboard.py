from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
from auth import get_current_user
import models
from datetime import date
from datetime import timedelta

router = APIRouter()

@router.get("/dashboard/summary")
def dashboard_summary(
    user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        print("API called")
        today = date.today()

        # Get today's study time for the current user
        study_today = db.query(func.sum(models.StudySession.duration_minutes))\
            .filter(models.StudySession.user_id == user_id)\
            .filter(func.date_trunc('day', models.StudySession.created_at) == today)\
            .scalar() or 0

        study_goal = 180

        # Count habit completions for today (user's habits only)
        # Use both UTC date and local date to handle timezone issues
        habit_done = db.query(func.count(models.HabitLog.id))\
            .join(models.Habit, models.HabitLog.habit_id == models.Habit.id)\
            .filter(models.Habit.user_id == user_id)\
            .filter(
                (func.date_trunc('day', models.HabitLog.completed_date) == today)
            )\
            .scalar() or 0

        # Count total habits for the current user
        habit_total = db.query(func.count(models.Habit.id))\
            .filter(models.Habit.user_id == user_id)\
            .scalar() or 0

        print(f"Dashboard summary for user {user_id}:")
        print(f"  Study today: {study_today} minutes")
        print(f"  Habit done: {habit_done}")
        print(f"  Habit total: {habit_total}")
        
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
def dashboard_weekly(
    user_id: str = Depends(get_current_user),  # add JWT authentication
    db: Session = Depends(get_db)
):
    try:
        print("Weekly API called") # API call log
        today = date.today() # loading today's date

        weekly_data = [] # list for saving weekly data
        day_names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] # list for days

        for i in range(6,-1,-1): # iterate till today from 6 days ago
            target_date = today - timedelta(days=i) # calculate the date

            # load the total study time for that day for current user only
            study_time = db.query(func.sum(models.StudySession.duration_minutes))\
                .filter(func.date_trunc('day', models.StudySession.created_at) == target_date)\
                .filter(models.StudySession.user_id == user_id)\
                .scalar() or 0
            
            # load the habit achievement for that day for current user only
            # Use both UTC date and local date to handle timezone issues
            habit_count = db.query(func.count(models.HabitLog.id))\
                .join(models.Habit, models.HabitLog.habit_id == models.Habit.id)\
                .filter(
                    (func.date_trunc('day', models.HabitLog.completed_date) == target_date)
                )\
                .filter(models.Habit.user_id == user_id)\
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
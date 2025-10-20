from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, text
from database import get_db
from auth import get_current_user
import models
from datetime import date
from datetime import timedelta
from cache import cache_manager

router = APIRouter()

@router.get("/dashboard/summary")
def dashboard_summary(
    user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        # Generate cache key
        cache_key = cache_manager.get_cache_key(user_id, "dashboard_summary")

        # Check cache for data
        cached_data = cache_manager.get(cache_key)
        if cached_data:
            return cached_data

        today = date.today()

        # Get today's study time for the current user (Pacific/Fiji timezone)
        study_today = db.query(func.sum(models.StudySession.duration_minutes))\
            .filter(models.StudySession.user_id == user_id)\
            .filter(func.date(text("created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Pacific/Fiji'")) == today)\
            .scalar() or 0

        # Count unique habit completions for today (user's habits only, Pacific/Fiji timezone)
        habit_done = db.query(func.count(func.distinct(models.HabitLog.habit_id)))\
            .join(models.Habit, models.HabitLog.habit_id == models.Habit.id)\
            .filter(models.Habit.user_id == user_id)\
            .filter(func.date(text("completed_date AT TIME ZONE 'UTC' AT TIME ZONE 'Pacific/Fiji'")) == today)\
            .scalar() or 0

        # Count total habits for the current user
        habit_total = db.query(func.count(models.Habit.id))\
            .filter(models.Habit.user_id == user_id)\
            .scalar() or 0

        result = {
            "study_today": study_today,
            "habit_done": habit_done,
            "habit_total": habit_total,
            "habit_percent": int((habit_done / habit_total * 100) if habit_total > 0 else 0)
        }

        # Store result in cache (5 minutes)
        cache_manager.set(cache_key, result, expire_seconds=300)

        return result
    except Exception as e:
        return {"error": str(e)}
    
@router.get("/dashboard/weekly")  # new API endpoint for weekly data
def dashboard_weekly(
    user_id: str = Depends(get_current_user),  # add JWT authentication
    db: Session = Depends(get_db)
):
    try:
        today = date.today()

        weekly_data = []  # list for saving weekly data
        day_names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]  # list for days

        for i in range(6,-1,-1):  # iterate till today from 6 days ago
            target_date = today - timedelta(days=i)  # calculate the date

            # load the total study time for that day for current user only
            study_time = db.query(func.sum(models.StudySession.duration_minutes))\
                .filter(func.date(text("created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Pacific/Fiji'")) == target_date)\
                .filter(models.StudySession.user_id == user_id)\
                .scalar() or 0 
            
            # load the habit achievement for that day for current user only
            # Use both UTC date and local date to handle timezone issues
            habit_count = db.query(func.count(func.distinct(models.HabitLog.habit_id)))\
                .join(models.Habit, models.HabitLog.habit_id == models.Habit.id)\
                .filter(
                    func.date(text("completed_date AT TIME ZONE 'UTC' AT TIME ZONE 'Pacific/Fiji'")) == target_date
                )\
                .filter(models.Habit.user_id == user_id)\
                .scalar() or 0  
            
            # save the daily data as dictionary
            weekly_data.append({
                "day": day_names[target_date.weekday()],  # name of day
                "study_time": study_time,  # study time
                "habit_count": habit_count  # habit count
            })

        return{
            "labels": [day["day"] for day in weekly_data],  # chart label (day)
            "study_data": [day["study_time"] for day in weekly_data],  # study data
            "habit_data": [day["habit_count"] for day in weekly_data]  # habit data
        }
    
    except Exception as e:
        return {"error": str(e)}  # return error
    
@router.get("/dashboard/leaderboard/{group_id}")
def dashboard_leaderboard(
    group_id: int,  # 그룹 ID 추가
    db: Session = Depends(get_db)
):
    try:
        leaderboard = db.query(
            models.User.username,
            func.sum(models.StudySession.duration_minutes).label("total_study_time")
        )\
        .join(models.GroupMembership, models.User.id == models.GroupMembership.user_id)\
        .join(models.StudySession, models.User.id == models.StudySession.user_id)\
        .filter(models.GroupMembership.group_id == group_id)\
        .group_by(models.User.id)\
        .order_by(func.sum(models.StudySession.duration_minutes).desc())\
        .limit(10)\
        .all()

        result = [
            {"username": item.username, "total_study_time": item.total_study_time}
            for item in leaderboard
        ]

        return {"leaderboard": result}
    except Exception as e:
        return {"error": str(e)}
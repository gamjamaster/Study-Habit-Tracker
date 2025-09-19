from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta
from sqlalchemy import func, and_, or_

from database import get_db
from models import StudyGroup, GroupMembership, StudySession, HabitLog, Habit, Profile
import schemas
from auth import get_current_user

router = APIRouter()

# 1. Create a new study group
@router.post("/groups", response_model=schemas.StudyGroup)
def create_group(
    group: schemas.StudyGroupCreate,
    user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Creates a new study group"""
    # Generate unique invite code
    import secrets
    invite_code = secrets.token_urlsafe(8)

    db_group = StudyGroup(
        name=group.name,
        description=group.description,
        created_by=user_id,
        invite_code=invite_code
    )
    db.add(db_group)
    db.commit()
    db.refresh(db_group)

    # Add creator as admin member
    membership = GroupMembership(
        group_id=db_group.id,
        user_id=user_id,
        role="admin"
    )
    db.add(membership)
    db.commit()

    return db_group

# 2. Get all groups for current user
@router.get("/groups", response_model=List[schemas.StudyGroup])
def read_groups(
    user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Gets all study groups for current user"""
    # Get groups where user is a member
    memberships = db.query(GroupMembership).filter(
        GroupMembership.user_id == user_id
    ).all()

    group_ids = [m.group_id for m in memberships]
    groups = db.query(StudyGroup).filter(
        StudyGroup.id.in_(group_ids)
    ).all()

    return groups

# 3. Get specific group details
@router.get("/groups/{group_id}", response_model=schemas.StudyGroup)
def read_group(
    group_id: int,
    user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Gets specific group details if user is a member"""
    # Check if user is member of the group
    membership = db.query(GroupMembership).filter(
        and_(
            GroupMembership.group_id == group_id,
            GroupMembership.user_id == user_id
        )
    ).first()

    if not membership:
        raise HTTPException(status_code=403, detail="Not a member of this group")

    group = db.query(StudyGroup).filter(StudyGroup.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    return group

# 4. Join group with invite code
@router.post("/groups/join/{invite_code}")
def join_group(
    invite_code: str,
    user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Joins a study group using invite code"""
    # Find group by invite code
    group = db.query(StudyGroup).filter(
        StudyGroup.invite_code == invite_code
    ).first()

    if not group:
        raise HTTPException(status_code=404, detail="Invalid invite code")

    # Check if user is already a member
    existing_membership = db.query(GroupMembership).filter(
        and_(
            GroupMembership.group_id == group.id,
            GroupMembership.user_id == user_id
        )
    ).first()

    if existing_membership:
        raise HTTPException(status_code=400, detail="Already a member of this group")

    # Create membership
    membership = GroupMembership(
        group_id=group.id,
        user_id=user_id,
        role="member"
    )
    db.add(membership)
    db.commit()

    return {"message": "Successfully joined group", "group_name": group.name}

# 5. Get group leaderboard
@router.get("/groups/{group_id}/leaderboard", response_model=schemas.GroupLeaderboardResponse)
def get_group_leaderboard(
    group_id: int,
    user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Gets leaderboard for a study group"""
    # Check if user is member of the group
    membership = db.query(GroupMembership).filter(
        and_(
            GroupMembership.group_id == group_id,
            GroupMembership.user_id == user_id
        )
    ).first()

    if not membership:
        raise HTTPException(status_code=403, detail="Not a member of this group")

    # Get all group members
    memberships = db.query(GroupMembership).filter(
        GroupMembership.group_id == group_id
    ).all()

    member_ids = [m.user_id for m in memberships]

    # Calculate week range (Monday to Sunday)
    today = datetime.now()
    week_start = today - timedelta(days=today.weekday())  # Monday
    week_start = week_start.replace(hour=0, minute=0, second=0, microsecond=0)
    week_end = week_start + timedelta(days=6, hours=23, minutes=59, seconds=59)

    leaderboard = []

    for member_id in member_ids:
        # Get user info from Profile table (full_name as username)
        profile = db.query(Profile).filter(Profile.user_id == member_id).first()
        username = profile.full_name if profile else "Unknown User"

        # Calculate study statistics for the week
        study_sessions = db.query(StudySession).filter(
            and_(
                StudySession.user_id == member_id,
                StudySession.created_at >= week_start,
                StudySession.created_at <= week_end
            )
        ).all()

        total_study_minutes = sum(session.duration_minutes for session in study_sessions)
        study_sessions_count = len(study_sessions)

        # Calculate habit completion rate for the week
        habits = db.query(Habit).filter(Habit.user_id == member_id).all()
        total_habits = len(habits)

        completed_habits = 0
        if total_habits > 0:
            for habit in habits:
                habit_logs = db.query(HabitLog).filter(
                    and_(
                        HabitLog.habit_id == habit.id,
                        HabitLog.completed_date >= week_start.date(),
                        HabitLog.completed_date <= week_end.date()
                    )
                ).all()
                if len(habit_logs) >= habit.target_frequency:
                    completed_habits += 1

        habit_completion_rate = completed_habits / total_habits if total_habits > 0 else 0

        leaderboard.append({
            "user_id": member_id,
            "user_email": member_id,
            "username": username,
            "total_study_minutes": total_study_minutes,
            "study_sessions_count": study_sessions_count,
            "habit_completion_rate": habit_completion_rate,
            "total_habits": total_habits,
            "completed_habits": completed_habits,
            "rank": 0  # Will be calculated after sorting
        })

    # Sort by total study minutes (descending)
    leaderboard.sort(key=lambda x: x["total_study_minutes"], reverse=True)

    # Assign ranks
    for i, entry in enumerate(leaderboard, 1):
        entry["rank"] = i

    group = db.query(StudyGroup).filter(StudyGroup.id == group_id).first()

    return {
        "group_id": group_id,
        "group_name": group.name,
        "leaderboard": leaderboard,
        "total_members": len(member_ids),
        "week_start": week_start.strftime("%Y-%m-%d"),
        "week_end": week_end.strftime("%Y-%m-%d")
    }

# 6. Leave group
@router.delete("/groups/{group_id}/leave")
def leave_group(
    group_id: int,
    user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Leaves a study group"""
    # Check if user is member of the group
    membership = db.query(GroupMembership).filter(
        and_(
            GroupMembership.group_id == group_id,
            GroupMembership.user_id == user_id
        )
    ).first()

    if not membership:
        raise HTTPException(status_code=403, detail="Not a member of this group")

    # Check if user is the only admin
    if membership.role == "admin":
        admin_count = db.query(GroupMembership).filter(
            and_(
                GroupMembership.group_id == group_id,
                GroupMembership.role == "admin"
            )
        ).count()

        if admin_count == 1:
            raise HTTPException(
                status_code=400,
                detail="Cannot leave group as the only admin. Transfer admin role first or delete the group."
            )

    # Remove membership
    db.delete(membership)
    db.commit()

    return {"message": "Successfully left the group"}

# 7. Update group (admin only)
@router.put("/groups/{group_id}", response_model=schemas.StudyGroup)
def update_group(
    group_id: int,
    group_update: schemas.StudyGroupUpdate,
    user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Updates group details (admin only)"""
    # Check if user is admin of the group
    membership = db.query(GroupMembership).filter(
        and_(
            GroupMembership.group_id == group_id,
            GroupMembership.user_id == user_id,
            GroupMembership.role == "admin"
        )
    ).first()

    if not membership:
        raise HTTPException(status_code=403, detail="Admin access required")

    group = db.query(StudyGroup).filter(StudyGroup.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    # Update fields
    if group_update.name is not None:
        group.name = group_update.name
    if group_update.description is not None:
        group.description = group_update.description

    db.commit()
    db.refresh(group)
    return group

# 8. Delete group (admin only)
@router.delete("/groups/{group_id}")
def delete_group(
    group_id: int,
    user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Deletes a study group (admin only)"""
    # Check if user is admin of the group
    membership = db.query(GroupMembership).filter(
        and_(
            GroupMembership.group_id == group_id,
            GroupMembership.user_id == user_id,
            GroupMembership.role == "admin"
        )
    ).first()

    if not membership:
        raise HTTPException(status_code=403, detail="Admin access required")

    # Delete all memberships first
    db.query(GroupMembership).filter(GroupMembership.group_id == group_id).delete()

    # Delete the group
    db.query(StudyGroup).filter(StudyGroup.id == group_id).delete()
    db.commit()

    return {"message": "Group deleted successfully"}
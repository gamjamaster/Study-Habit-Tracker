from pydantic import BaseModel # imports base class of Pydantic, used to define data type in API
from datetime import datetime
from typing import Optional # used to express values that may or may not exist

# required data when creating subjects
class SubjectCreate(BaseModel):
    name: str # subject name
    color: str # subject color code

# required data when updating subject details
class SubjectUpdate(BaseModel):
    name: Optional[str] = None # input value if update is needed or none
    color: Optional[str] = None

# data to send when API responds to the client
class Subject(BaseModel):
    id: int # index of the subject
    name: str # name of the subject
    color: str # color of the subject
    created_at: datetime # date and time that the subject has been created

    class Config: # inner class for Pydantic config
        from_attributes = True # automatically transforms the SQLAlchemy model(subject class at models.py) to this schema

# study session schema
class StudySessionCreate(BaseModel): # data format to create a new study session
    subject_id: int # id of the subject studied
    duration_minutes: int # amount of time spent on studying
    notes: Optional[str] = None # notes while studying (optional)

class StudySessionUpdate(BaseModel): # data format to update existing study sessions
    subject_id: Optional[int] = None # change subject id if wanted
    duration_minutes: Optional[int] = None # change study time if wanted
    notes: Optional[str] = None # modify notes if wanted


class StudySession(BaseModel): # data to send when the API responds
    id: int # unique id of the study session
    subject_id: Optional[int] = None # unique id of the subject (nullable for old data)
    duration_minutes: int # study time
    notes: Optional[str] # notes
    created_at: datetime # date and time at which the study session has been recorded

    class Config: # inner class for Pydantic config
        from_attributes = True # automatically transform SQLAlchemy model to this schema

# Simplified study session schema for API responses (without nested subject)
class StudySessionResponse(BaseModel):
    id: int
    subject_id: Optional[int] = None  # nullable for old data
    duration_minutes: int
    notes: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

from typing import List

class Habit(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    target_frequency: Optional[int] = 7  # Default to 7 if None
    color: Optional[str] = "#10B981"  # Default green color if None
    created_at: datetime

    class Config:
        from_attributes = True

class HabitCreate(BaseModel):
    name: str
    description: Optional[str] = None
    target_frequency: int
    color: str

class HabitUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    target_frequency: Optional[int] = None
    color: Optional[str] = None

class HabitLog(BaseModel):
    id: int
    habit_id: int
    completed_date: datetime

    class Config:
        from_attributes = True

class HabitLogCreate(BaseModel):
    completed_date: datetime

class GoalBase(BaseModel):
    goal_type: str
    target_value: int
    target_unit: str = "minutes"
    period: str
    description: Optional[str] = None
    is_active: int = 1

class GoalCreate(GoalBase):
    pass

class Goal(GoalBase):
    id: int
    user_id: str
    created_at: datetime

    class Config:
        from_attributes = True

class GoalUpdate(BaseModel):
    goal_type: Optional[str] = None
    target_value: Optional[int] = None
    target_unit: Optional[str] = None
    period: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[int] = None

# Heatmap schemas
class HeatmapData(BaseModel):
    """Individual day data for heatmap"""
    date: str  # YYYY-MM-DD format
    value: int  # Total activity score (0-100)
    level: int  # Color intensity level (0-4)
    study_time: int  # Minutes of study
    habit_completion_rate: float  # 0.0 to 1.0
    total_habits: int  # Total habits for the day
    completed_habits: int  # Completed habits for the day

class HeatmapResponse(BaseModel):
    """Complete heatmap response"""
    year: int
    data: List[HeatmapData]
    summary: dict  # Statistics summary

# Study Group schemas
class StudyGroupCreate(BaseModel):
    name: str
    description: Optional[str] = None

class StudyGroupUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

class StudyGroup(BaseModel):
    id: int
    name: str
    description: Optional[str]
    created_by: str
    created_at: datetime
    invite_code: str

    class Config:
        from_attributes = True

# Group Membership schemas
class GroupMembershipCreate(BaseModel):
    group_id: int
    user_id: str
    role: str = "member"

class GroupMembership(BaseModel):
    id: int
    group_id: int
    user_id: str
    joined_at: datetime
    role: str

    class Config:
        from_attributes = True

# Leaderboard schemas
class LeaderboardEntry(BaseModel):
    user_id: str
    username: str
    total_study_minutes: int
    study_sessions_count: int
    habit_completion_rate: float
    total_habits: int
    completed_habits: int
    rank: int

class GroupLeaderboardResponse(BaseModel):
    group_id: int
    group_name: str
    leaderboard: List[LeaderboardEntry]
    total_members: int
    week_start: str
    week_end: str
    
class ProfileBase(BaseModel):
    email: str
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None

class ProfileCreate(ProfileBase):
    id: Optional[str] = None  # Optional ID from Supabase

class Profile(ProfileBase):
    id: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
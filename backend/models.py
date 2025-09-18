from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey # data types to make table columns
from sqlalchemy.orm import relationship # import relationship for foreign key connections
from database import Base # brings basic table frame from database.py
from datetime import datetime # to record current time

# subject table
class Subject(Base): # creates table "Subject"
    __tablename__ = "subjects" # name of the table in the db

    id = Column(Integer, primary_key = True, index = True) # every subject has an unique id
    user_id = Column(String, index = True)
    name = Column(String, index = True) # subject name
    color = Column(String) # color of each subject
    created_at = Column(DateTime, default = datetime.now) # records when the subject has been created

    study_sessions = relationship("StudySession", back_populates = "subject")

# study session table
class StudySession(Base):
    __tablename__ = "study_sessions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), index=True)  # ForeignKey 추가
    subject_id = Column(Integer, ForeignKey("subjects.id"))
    start_time = Column(DateTime, nullable=True)
    end_time = Column(DateTime, nullable=True)
    duration_minutes = Column(Integer)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.now)

    # 관계 설정
    user = relationship("User", back_populates="study_sessions")
    subject = relationship("Subject", back_populates="study_sessions")

# habit table
class Habit(Base):
    __tablename__ = "habits"

    id = Column(Integer, primary_key = True, index = True)
    user_id = Column(String, index=True)
    name = Column(String, index = True) # name of the habit
    description = Column(Text, nullable = True) # description of the habit
    target_frequency = Column(Integer, default=7) # target frequency per week (default 7)
    color = Column(String, default="#10B981") # color of each habit (default green)
    created_at = Column(DateTime, default = datetime.now)

    logs = relationship("HabitLog", back_populates="habit")

# habit log table
class HabitLog(Base):
    __tablename__ = "habit_logs"

    id = Column(Integer, primary_key = True, index = True)
    user_id = Column(String, index=True)
    habit_id = Column(Integer, ForeignKey("habits.id")) # which habit it is from the habit column
    completed_date = Column(DateTime) # when the habit has been completed
    notes = Column(Text, nullable = True) # notes on how the habit has been completed
    created_at = Column(DateTime, default = datetime.now)
    habit = relationship("Habit", lazy="joined")

    habit = relationship("Habit", back_populates="logs")

# goal table
class Goal(Base):
    __tablename__ = "goals"

    id = Column(Integer, primary_key = True, index = True) # unique ID
    user_id = Column(String, index=True) # user ID
    goal_type = Column(String, index = True) # goal type: "daily_study", "weekly_study", "monthly_study", "daily_habit", "weekly_habit"
    target_value = Column(Integer) # goal value
    target_unit = Column(String, default="minutes") # metrics: "minutes", "sessions", "habits"
    period = Column(String, index = True) # period: "daily", "weekly", "monthly"
    description = Column(Text, nullable = True) # goal explanation (optional)
    is_active = Column(Integer, default=1) # if its active or not (1: active, 0: inactive)
    created_at = Column(DateTime, default = datetime.now) # goal created time

# study group table
class StudyGroup(Base):
    __tablename__ = "study_groups"

    id = Column(Integer, primary_key = True, index = True)
    name = Column(String, index = True) # group name
    description = Column(Text, nullable = True) # group description
    created_by = Column(String, index = True) # user ID of the creator
    created_at = Column(DateTime, default = datetime.now)
    invite_code = Column(String, unique = True, index = True) # unique invite code for joining

    memberships = relationship("GroupMembership", back_populates="group")

# group membership table
class GroupMembership(Base):
    __tablename__ = "group_memberships"

    id = Column(Integer, primary_key = True, index = True)
    group_id = Column(Integer, ForeignKey("study_groups.id"))
    user_id = Column(String, index = True)
    joined_at = Column(DateTime, default = datetime.now)
    role = Column(String, default = "member") # "admin" or "member"

    group = relationship("StudyGroup", back_populates="memberships")

class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    created_at = Column(DateTime, default=datetime.now)

    # 관계 설정
    study_sessions = relationship("StudySession", back_populates="user")
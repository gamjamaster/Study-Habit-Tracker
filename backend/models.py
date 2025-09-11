from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey # data types to make table columns
from sqlalchemy.orm import relationship # import relationship for foreign key connections
from database import Base # brings basic table frame from database.py
from datetime import datetime # to record current time

# subject table
class Subject(Base): # creates table "Subject"
    __tablename__ = "subjects" # name of the table in the db

    id = Column(Integer, primary_key = True, index = True) # every subject has an unique id
    name = Column(String, index = True) # subject name
    color = Column(String) # color of each subject
    created_at = Column(DateTime, default = datetime.now) # records when the subject has been created

# study session table
class StudySession(Base): # table to keep track of study sessions
    __tablename__ = "study_sessions" # name of the table in the db

    id = Column(Integer, primary_key = True, index = True) 
    subject_id = Column(Integer, ForeignKey("subjects.id")) # keeps the subject that has been studied
                                                           # connects with id of subject table
    start_time = Column(DateTime, nullable=True) # study begun at
    end_time = Column(DateTime, nullable=True) # study ended at
    duration_minutes = Column(Integer) # total study time in minutes
    notes = Column(Text, nullable = True) # notes on what has been studied, used text type as it may be long
                                          # nullable = True: notes can be empty
    created_at = Column(DateTime, default = datetime.now)
    subject = relationship("Subject", lazy="joined")

# habit table
class Habit(Base):
    __tablename__ = "habits"

    id = Column(Integer, primary_key = True, index = True)
    name = Column(String, index = True) # name of the habit
    description = Column(Text, nullable = True) # description of the habit
    target_frequency = Column(Integer) # target frequency per week
    color = Column(String) # color of each habit
    created_at = Column(DateTime, default = datetime.now)

# habit log table
class HabitLog(Base):
    __tablename__ = "habit_logs"

    id = Column(Integer, primary_key = True, index = True)
    habit_id = Column(Integer, ForeignKey("habits.id")) # which habit it is from the habit column
    completed_date = Column(DateTime) # when the habit has been completed
    notes = Column(Text, nullable = True) # notes on how the habit has been completed
    created_at = Column(DateTime, default = datetime.now)
    habit = relationship("Habit", lazy="joined")
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
    subject_id: int # unique id of the subject
    duration_minutes: int # study time
    notes: Optional[str] # notes
    created_at: datetime # date and time at which the study session has been recorded

    subject: Subject # sends the entire detail of the subject as well

    class Config: # inner class for Pydantic config
        from_attributes = True # automatically transform SQLAlchemy model to this schema
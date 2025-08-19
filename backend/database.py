from sqlalchemy import create_engine # core tool that connects with the database
from sqlalchemy.ext.declarative import declarative_base # basic class to make table model
from sqlalchemy.orm import sessionmaker # tool to make a session to converse with the database

# SQLite database file directory
DATABASE_URL = "sqlite:///./study_habit.db"
# DATABASE_URL: location of the databse
# sqlite://: SQLite database is being used
# ./study_habit.db: save the database as study_habit.db in the current folder

# creating db engine
engine = create_engine( # engine: core tool to connect with the db
    DATABASE_URL, # make engine with the directory
    connect_args = {"check_same_thread": False} # SQLite config that helps to process multiple requests safely
)

# db session generator
SessionLocal = sessionmaker(autocommit = False, autoflush = False, bind = engine)
# SessionLocal: generator that makes sessions to converse with the db
# autocommit = False: manually check data when saving
# autoflush = False: manually send data
# bind = engine: connect with the engine above
# session uses the engine to converse with the db

# basic class for table models
Base = declarative_base()
#Base: parent class for every table model

# function to get db connection
def get_db(): # function that is called whenever the API uses db
    db = SessionLocal() # create new db session
    try: # beginning of the code that may have errors
        yield db # lend the session
                 # reurn to this point after using the session
    finally: # executes regardless of the error
        db.close() # close the connecton after usage

def create_tables(): # function to create every table in the db
    Base.metadata.create_all(bind = engine) # create every table model that has inherited Base in the db
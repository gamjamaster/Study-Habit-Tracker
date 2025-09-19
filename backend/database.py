import os
from sqlalchemy import create_engine # core tool that connects with the database
from sqlalchemy.ext.declarative import declarative_base # basic class to make table model
from sqlalchemy.orm import sessionmaker # tool to make a session to converse with the database

# Database URL - supports both SQLite (local) and PostgreSQL (production)
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./study_habit.db")

# If PostgreSQL URL, change to psycopg2 connection method
if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg2://", 1)

# creating db engine
if DATABASE_URL.startswith("sqlite"):
    # SQLite configuration
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False} # SQLite config for multiple requests
    )
else:
    # PostgreSQL configuration
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,      # Check connection status
        pool_recycle=300,        # Connection reuse time (5 minutes)
        pool_size=5,             # Connection pool size
        max_overflow=10,         # Maximum number of connections
        echo=False               # Disable SQL logging (production)
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

# function to create all tables
def create_tables():
    """Create all database tables"""
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables created successfully")
    except Exception as e:
        print(f"❌ Error creating tables: {e}")

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
import sqlite3
import os

def migrate_database():
    """add user_id column to the db"""
    db_path = "study_habit.db"
    
    if not os.path.exists(db_path):
        print("The db file does not exist.")
        return
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # add user_id column to each table
        tables = ['subjects', 'study_sessions', 'habits', 'habit_logs']
        
        for table in tables:
            try:
                cursor.execute(f"ALTER TABLE {table} ADD COLUMN user_id TEXT")
                print(f"{table} user_id column has been added to the table")
            except sqlite3.OperationalError as e:
                if "duplicate column name" in str(e):
                    print(f"{table} the user_id column already exists")
                else:
                    print(f"{table} table modification error: {e}")
        
        # create index
        for table in tables:
            try:
                cursor.execute(f"CREATE INDEX IF NOT EXISTS idx_{table}_user_id ON {table}(user_id)")
                print(f"{table} table user_id index creation has been completed")
            except sqlite3.Error as e:
                print(f"index creation error: {e}")
        
        conn.commit()
        print("db migration complete")
        
    except Exception as e:
        print(f"migration error: {e}")
        conn.rollback()
    
    finally:
        conn.close()

if __name__ == "__main__":
    migrate_database()
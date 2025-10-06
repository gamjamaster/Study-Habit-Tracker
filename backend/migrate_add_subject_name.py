"""
Migration script to add subject_name column to study_sessions table
and populate it with existing subject names
"""

from sqlalchemy import create_engine, text
from database import DATABASE_URL
import os

def migrate_add_subject_name():
    """Add subject_name column and populate with existing data"""
    
    # Get database URL from environment or use default
    db_url = os.getenv("DATABASE_URL", DATABASE_URL)
    
    # Fix for Render.com PostgreSQL URL
    if db_url and db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql://", 1)
    
    engine = create_engine(db_url)
    
    with engine.connect() as conn:
        print("🔄 Starting migration: add subject_name to study_sessions...")
        
        try:
            # Step 1: Add subject_name column (if it doesn't exist)
            print("📝 Adding subject_name column...")
            conn.execute(text("""
                ALTER TABLE study_sessions 
                ADD COLUMN IF NOT EXISTS subject_name VARCHAR;
            """))
            conn.commit()
            print("✅ Column added successfully")
            
            # Step 2: Update existing records with subject names
            print("📝 Populating subject_name for existing records...")
            result = conn.execute(text("""
                UPDATE study_sessions
                SET subject_name = subjects.name
                FROM subjects
                WHERE study_sessions.subject_id = subjects.id
                AND study_sessions.subject_name IS NULL;
            """))
            conn.commit()
            print(f"✅ Updated {result.rowcount} records with subject names")
            
            # Step 3: Show summary
            summary = conn.execute(text("""
                SELECT 
                    COUNT(*) as total_sessions,
                    COUNT(subject_name) as sessions_with_name,
                    COUNT(*) - COUNT(subject_name) as sessions_without_name
                FROM study_sessions;
            """))
            stats = summary.fetchone()
            
            print("\n📊 Migration Summary:")
            print(f"   Total sessions: {stats[0]}")
            print(f"   Sessions with subject name: {stats[1]}")
            print(f"   Sessions without subject name: {stats[2]}")
            
            print("\n✅ Migration completed successfully!")
            
        except Exception as e:
            print(f"❌ Migration failed: {e}")
            conn.rollback()
            raise

if __name__ == "__main__":
    migrate_add_subject_name()

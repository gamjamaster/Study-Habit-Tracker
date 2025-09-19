import sqlite3
import os

def migrate_profiles_table():
    """Add missing columns to profiles table"""
    db_path = "study_habit.db"

    if not os.path.exists(db_path):
        print("Database file does not exist.")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    try:
        # Check if profiles table exists
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='profiles'")
        if not cursor.fetchone():
            print("Profiles table does not exist. Creating it...")
            cursor.execute("""
                CREATE TABLE profiles (
                    id TEXT PRIMARY KEY,
                    user_id TEXT,
                    email TEXT UNIQUE,
                    full_name TEXT,
                    avatar_url TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME
                )
            """)
            print("Profiles table created successfully")
        else:
            print("Profiles table exists. Checking for missing columns...")

            # Check and add user_id column if missing
            try:
                cursor.execute("SELECT user_id FROM profiles LIMIT 1")
                print("user_id column already exists")
            except sqlite3.OperationalError:
                print("Adding user_id column to profiles table...")
                cursor.execute("ALTER TABLE profiles ADD COLUMN user_id TEXT")
                print("user_id column added successfully")

            # Check and add email column if missing
            try:
                cursor.execute("SELECT email FROM profiles LIMIT 1")
                print("email column already exists")
            except sqlite3.OperationalError:
                print("Adding email column to profiles table...")
                cursor.execute("ALTER TABLE profiles ADD COLUMN email TEXT UNIQUE")
                print("email column added successfully")

            # Check and add full_name column if missing
            try:
                cursor.execute("SELECT full_name FROM profiles LIMIT 1")
                print("full_name column already exists")
            except sqlite3.OperationalError:
                print("Adding full_name column to profiles table...")
                cursor.execute("ALTER TABLE profiles ADD COLUMN full_name TEXT")
                print("full_name column added successfully")

            # Check and add avatar_url column if missing
            try:
                cursor.execute("SELECT avatar_url FROM profiles LIMIT 1")
                print("avatar_url column already exists")
            except sqlite3.OperationalError:
                print("Adding avatar_url column to profiles table...")
                cursor.execute("ALTER TABLE profiles ADD COLUMN avatar_url TEXT")
                print("avatar_url column added successfully")

            # Check and add created_at column if missing
            try:
                cursor.execute("SELECT created_at FROM profiles LIMIT 1")
                print("created_at column already exists")
            except sqlite3.OperationalError:
                print("Adding created_at column to profiles table...")
                cursor.execute("ALTER TABLE profiles ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP")
                print("created_at column added successfully")

            # Check and add updated_at column if missing
            try:
                cursor.execute("SELECT updated_at FROM profiles LIMIT 1")
                print("updated_at column already exists")
            except sqlite3.OperationalError:
                print("Adding updated_at column to profiles table...")
                cursor.execute("ALTER TABLE profiles ADD COLUMN updated_at DATETIME")
                print("updated_at column added successfully")

        # Create indexes
        try:
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id)")
            print("Index on user_id created successfully")
        except sqlite3.Error as e:
            print(f"Index creation error: {e}")

        try:
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email)")
            print("Index on email created successfully")
        except sqlite3.Error as e:
            print(f"Index creation error: {e}")

        conn.commit()
        print("Profiles table migration completed successfully!")

    except Exception as e:
        print(f"Migration error: {e}")
        conn.rollback()

    finally:
        conn.close()

if __name__ == "__main__":
    migrate_profiles_table()
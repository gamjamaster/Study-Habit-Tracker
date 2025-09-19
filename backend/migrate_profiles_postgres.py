"""
PostgreSQL migration script for adding missing columns to profiles table
Run this in your production database
"""

# SQL commands to run in PostgreSQL:

MIGRATION_SQL = """
-- Add missing columns to profiles table if they don't exist
DO $$
BEGIN
    -- Add user_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'profiles' AND column_name = 'user_id') THEN
        ALTER TABLE profiles ADD COLUMN user_id TEXT;
        RAISE NOTICE 'Added user_id column to profiles table';
    END IF;

    -- Add email column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'profiles' AND column_name = 'email') THEN
        ALTER TABLE profiles ADD COLUMN email TEXT UNIQUE;
        RAISE NOTICE 'Added email column to profiles table';
    END IF;

    -- Add full_name column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'profiles' AND column_name = 'full_name') THEN
        ALTER TABLE profiles ADD COLUMN full_name TEXT;
        RAISE NOTICE 'Added full_name column to profiles table';
    END IF;

    -- Add avatar_url column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'profiles' AND column_name = 'avatar_url') THEN
        ALTER TABLE profiles ADD COLUMN avatar_url TEXT;
        RAISE NOTICE 'Added avatar_url column to profiles table';
    END IF;

    -- Add created_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'profiles' AND column_name = 'created_at') THEN
        ALTER TABLE profiles ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
        RAISE NOTICE 'Added created_at column to profiles table';
    END IF;

    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'profiles' AND column_name = 'updated_at') THEN
        ALTER TABLE profiles ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Added updated_at column to profiles table';
    END IF;

    -- Create indexes if they don't exist
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'profiles' AND indexname = 'idx_profiles_user_id') THEN
        CREATE INDEX idx_profiles_user_id ON profiles(user_id);
        RAISE NOTICE 'Created index on user_id';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'profiles' AND indexname = 'idx_profiles_email') THEN
        CREATE INDEX idx_profiles_email ON profiles(email);
        RAISE NOTICE 'Created index on email';
    END IF;

    RAISE NOTICE 'Profiles table migration completed successfully!';
END $$;
"""

def print_migration_sql():
    """Print the SQL commands to run in production"""
    print("Run the following SQL in your PostgreSQL database:")
    print("=" * 50)
    print(MIGRATION_SQL)
    print("=" * 50)

if __name__ == "__main__":
    print_migration_sql()
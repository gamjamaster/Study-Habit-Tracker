import sqlite3

conn = sqlite3.connect('study_habit.db')
cursor = conn.cursor()

print('=== StudySession 테이블 ===')
cursor.execute('SELECT COUNT(*) FROM study_sessions')
study_count = cursor.fetchone()[0]
print(f'Total study sessions: {study_count}')

if study_count > 0:
    cursor.execute('SELECT * FROM study_sessions LIMIT 5')
    sessions = cursor.fetchall()
    print('Sample study sessions:')
    for session in sessions:
        print(session)

print('\n=== Habit 테이블 ===')
cursor.execute('SELECT COUNT(*) FROM habits')
habit_count = cursor.fetchone()[0]
print(f'Total habits: {habit_count}')

if habit_count > 0:
    cursor.execute('SELECT * FROM habits LIMIT 5')
    habits = cursor.fetchall()
    print('Sample habits:')
    for habit in habits:
        print(habit)

print('\n=== HabitLog 테이블 ===')
cursor.execute('SELECT COUNT(*) FROM habit_logs')
log_count = cursor.fetchone()[0]
print(f'Total habit logs: {log_count}')

if log_count > 0:
    cursor.execute('SELECT * FROM habit_logs LIMIT 5')
    logs = cursor.fetchall()
    print('Sample habit logs:')
    for log in logs:
        print(log)

conn.close()
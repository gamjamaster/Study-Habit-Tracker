"use client"; // Declares this as a Next.js client component

import React, { useState, useEffect } from "react"; // Import React and useState hook
import Calendar from "react-calendar";   // Import Calendar component from react-calendar
import "react-calendar/dist/Calendar.css"; // Import default CSS for react-calendar
import { API_ENDPOINTS } from "@/lib/api"; // Import API endpoints

// Type definitions for API data
interface StudySession {
  id: number;
  subject_id: number;
  duration_minutes: number;
  notes?: string;
  created_at: string;
}

interface HabitLog {
  id: number;
  habit_id: number;
  completed_date: string;
}

interface Subject {
  id: number;
  name: string;
  color: string;
  created_at: string;
}

interface Habit {
  id: number;
  name: string;
  description?: string;
  created_at: string;
}

export default function MyCalendar() { // Function component for the calendar
  const [value, setValue] = useState<Date>(new Date()); // State: currently selected date
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [sessionsRes, habitsLogRes, subjectsRes, habitsRes] = await Promise.all([
          fetch(API_ENDPOINTS.STUDY_SESSIONS),
          fetch(API_ENDPOINTS.HABIT_LOGS),
          fetch(API_ENDPOINTS.SUBJECTS),
          fetch(API_ENDPOINTS.HABITS)
        ]);

        if (sessionsRes.ok) {
          const sessions = await sessionsRes.json();
          setStudySessions(sessions);
        }

        if (habitsLogRes.ok) {
          const logs = await habitsLogRes.json();
          setHabitLogs(logs);
        }

        if (subjectsRes.ok) {
          const subs = await subjectsRes.json();
          setSubjects(subs);
        }

        if (habitsRes.ok) {
          const habs = await habitsRes.json();
          setHabits(habs);
        }
      } catch (error) {
        console.error('Error fetching calendar data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Get selected date data
  const getSelectedDateData = (selectedDate: Date) => {
    // Use local date formatting to avoid timezone issues
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    const iso = `${year}-${month}-${day}`;
    
    const dayStudySessions = studySessions.filter(session => 
      session.created_at.slice(0, 10) === iso
    );
    
    const dayHabitLogs = habitLogs.filter(log => 
      log.completed_date.slice(0, 10) === iso
    );

    return { dayStudySessions, dayHabitLogs };
  };

  const { dayStudySessions, dayHabitLogs } = getSelectedDateData(value);

  if (loading) {
    return <div className="flex justify-center py-8 text-gray-500">Loading calendar...</div>;
  }

  return (
    <div className="py-4 lg:py-8">
      {/* Calendar */}
      <div className="bg-white rounded-2xl shadow p-4 sm:p-8 lg:p-12 max-w-6xl w-full mx-auto mb-6 flex justify-center">
        <Calendar
          onChange={(value) => setValue(value as Date)}
          value={value}
          className="!border-0 w-full text-sm sm:text-lg lg:text-xl max-w-4xl"
          calendarType="iso8601"
          locale="eng-US"
          prev2Label={null}
          next2Label={null}
        />
      </div>

      {/* Selected Date Details */}
      <div className="max-w-6xl w-full mx-auto px-4 sm:px-0">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-800 text-center">
          📅 {value.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Study Sessions */}
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-semibold mb-4 text-blue-600 flex items-center">
              📚 Study Sessions
            </h3>
            {dayStudySessions.length > 0 ? (
              <div className="space-y-3">
                {dayStudySessions.map((session) => {
                  const subject = subjects.find(s => s.id === session.subject_id);
                  return (
                    <div key={session.id} className="p-3 bg-blue-50 rounded-lg">
                      <div className="font-medium text-blue-800">
                        {subject?.name || 'Unknown Subject'}
                      </div>
                      <div className="text-sm text-blue-600">
                        Duration: {session.duration_minutes} minutes
                      </div>
                      {session.notes && (
                        <div className="text-sm text-gray-600 mt-1">
                          Notes: {session.notes}
                        </div>
                      )}
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(session.created_at).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 italic">No study sessions for this day</p>
            )}
          </div>

          {/* Habit Logs */}
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-semibold mb-4 text-green-600 flex items-center">
              ✅ Habits
            </h3>
            {dayHabitLogs.length > 0 ? (
              <div className="space-y-3">
                {dayHabitLogs
                  .filter((log) => habits.find(h => h.id === log.habit_id))
                  .map((log) => {
                    const habit = habits.find(h => h.id === log.habit_id);
                    return (
                      <div key={log.id} className="p-3 bg-green-50 rounded-lg">
                        <div className="font-medium text-green-800">
                          {habit?.name}
                        </div>
                        <div className="text-sm text-green-600">
                          ✅ Completed
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(log.completed_date).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                          })}
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <p className="text-gray-500 italic">No habit logs for this day</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { API_ENDPOINTS } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";  // import authentication context
import ProtectedRoute from "@/components/ProtectedRoute";  // import protected route component

// Habit interface definition
interface Habit {
  id: number;
  name: string;
  description?: string;
  target_frequency: number;
  color: string;
  created_at: string;
}

// Habit with completion status interface
interface HabitWithStatus extends Habit {
  done: boolean;
}

// Habit log interface
interface HabitLog {
  id: number;
  habit_id: number;
  completed_date: string;
}

function HabitContent() {
  const { user, session } = useAuth(); // get authentication state
  // Habit state management
  const [habits, setHabits] = useState<HabitWithStatus[]>([]);
  // New habit input value
  const [newHabit, setNewHabit] = useState("");
  // Loading state
  const [loading, setLoading] = useState(true);
  // Error state
  const [error, setError] = useState<string | null>(null);

  // Check if habit is completed today - helper function
  const checkTodayCompletion = useCallback(async (habitId: number): Promise<boolean> => {
    try {
      // check authentication before making API calls
      if (!session) return false;

      // Use local date formatting to avoid timezone issues
      const today = new Date();
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      
      const response = await fetch(API_ENDPOINTS.habitLogs(habitId), {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,  // add JWT token
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) return false;
      
      const logs: HabitLog[] = await response.json();
      
      // Check if there's a log for today (compare date part only, regardless of timezone)
      const hasToday = logs.some((log) => {
        const logDate = new Date(log.completed_date);
        // Use toLocaleDateString() to properly convert UTC to local date
        const logDateStr = logDate.toLocaleDateString('en-CA'); // Format: YYYY-MM-DD
        const isToday = logDateStr === todayStr;
        return isToday;
      });
      
      return hasToday;
    } catch (error) {
      console.error(`❌ Error checking habit ${habitId} completion:`, error);
      return false;
    }
  }, [session]);

  // Fetch habits from backend  
  const loadHabits = useCallback(async () => {
    // check authentication before making API calls
    if (!user || !session) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const response = await fetch(API_ENDPOINTS.HABITS, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,  // add JWT token
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error("Cannot load habit data");
      
      const habitsData: Habit[] = await response.json();
      
      // Check today's completion status for each habit
      const habitsWithStatus = await Promise.all(
        habitsData.map(async (habit) => {
          const isDone = await checkTodayCompletion(habit.id);
          return { ...habit, done: isDone };
        })
      );
      
      setHabits(habitsWithStatus);
      setError(null);
    } catch (error) {
      console.error("Habit load error:", error);
      setError("Cannot load habit data");
      setHabits([]);
    } finally {
      setLoading(false);
    }
  }, [user, session, checkTodayCompletion]); // add dependencies for authentication state

  // Load habits data when component mounts
  useEffect(() => {
    loadHabits();
  }, [loadHabits]);

  // Also reload habits when session changes
  useEffect(() => {
    if (session) {
      loadHabits();
    }
  }, [session, loadHabits]);



  // Toggle habit completion status
  const toggleHabits = async (habitId: number) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    // Store the original state for rollback
    const originalDone = habit.done;

    try {
      // Update UI optimistically first
      setHabits(habits.map(h => 
        h.id === habitId ? { ...h, done: !h.done } : h
      ));

      if (originalDone) {
        // Uncheck: delete today's log
        await deleteTodayLog(habitId);
      } else {
        // Check: create today's log
        await createTodayLog(habitId);
      }
    } catch (error) {
      console.error("Habit toggle error:", error);
      
      // Rollback UI on error
      setHabits(habits.map(h => 
        h.id === habitId ? { ...h, done: originalDone } : h
      ));
      
      alert("Failed to update habit status. Please try again.");
    }
  };

  // Create today's habit completion log
  const createTodayLog = async (habitId: number) => {
    try {
      // Use current time for when the habit was actually completed
      const now = new Date();
      const completedTime = now.toISOString();
      
      const payload = {
        completed_date: completedTime
      };
      
      const response = await fetch(API_ENDPOINTS.habitLogs(habitId), {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          'Authorization': `Bearer ${session?.access_token}`  // add JWT token
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Log creation failed: ${errorText}`);
        throw new Error(`Log creation failed: ${errorText}`);
      }
      
      await response.json();
    } catch (error) {
      console.error("Log creation error:", error);
      throw error;
    }
  };

  // Delete today's habit completion log
  const deleteTodayLog = async (habitId: number) => {
    try {
      // Get today's logs and delete them
      const response = await fetch(API_ENDPOINTS.habitLogs(habitId), {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,  // add JWT token
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) return;
      
      const logs: HabitLog[] = await response.json();
      // Use local date formatting to match creation logic
      const today = new Date();
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      
      // Filter today's logs for deletion (use same logic as checkTodayCompletion)
      const todayLogs = logs.filter((log) => {
        const logDate = new Date(log.completed_date);
        // Use toLocaleDateString() to properly convert UTC to local date (same as checkTodayCompletion)
        const logDateStr = logDate.toLocaleDateString('en-CA'); // Format: YYYY-MM-DD
        const isToday = logDateStr === todayStr;
        return isToday;
      });
      
      // Delete each today's log
      for (const log of todayLogs) {
        const deleteResponse = await fetch(API_ENDPOINTS.habitLogById(log.id), {
          method: "DELETE",
          headers: {
            'Authorization': `Bearer ${session?.access_token}`,  // add JWT token
            'Content-Type': 'application/json'
          }
        });
        
        if (!deleteResponse.ok) {
          console.error(`Failed to delete log ${log.id}`);
        }
      }
    } catch (error) {
      console.error("Log deletion error:", error);
      throw error;
    }
  };

  // Add new habit
  const addHabit = async () => {
    if (!newHabit.trim()) return;
    
    try {
      const response = await fetch(API_ENDPOINTS.HABITS, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          'Authorization': `Bearer ${session?.access_token}`  // add JWT token
        },
        body: JSON.stringify({
          name: newHabit.trim(),
          description: "",
          target_frequency: 7, // Default: 7 times per week
          color: "#10B981" // Default: green color
        })
      });
      
      if (!response.ok) throw new Error("Habit addition failed");
      
      const newHabitData = await response.json();
      setHabits([...habits, { ...newHabitData, done: false }]);
      setNewHabit("");
    } catch (error) {
      console.error("Habit addition error:", error);
      alert("Failed to add habit");
    }
  };

  // Delete habit
  const removeHabit = async (habitId: number) => {
    if (!confirm("Are you sure you want to delete this habit?")) return;
    
    try {
      const response = await fetch(API_ENDPOINTS.habitById(habitId), {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,  // add JWT token
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error("Habit deletion failed");
      
      setHabits(habits.filter(h => h.id !== habitId));
    } catch (error) {
      console.error("Habit deletion error:", error);
      alert("Failed to delete habit");
    }
  };





  // Loading display
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600">Loading...</span>
      </div>
    );
  }

  // Error display
  if (error) {
    return (
      <section className="max-w-2xl mx-auto p-8">
        <div className="text-center text-red-400">{error}</div>
      </section>
    );
  }

  return (
    <div className="py-8">
      <div className="max-w-2xl mx-auto p-4">
        {/* page title */}
        <h1 className="text-3xl font-bold mb-8 text-gray-900 text-center">✅ My Habits</h1>
        
        {/* habit addition card */}
        <div className="bg-white rounded-xl shadow p-4 sm:p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">Add New Habit</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-sm sm:text-base"
              placeholder="Enter a new habit (e.g., Exercise, Reading)"
              value={newHabit}
              onChange={e => setNewHabit(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addHabit()}
            />
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-6 py-3 flex items-center justify-center font-medium transition-colors"
              onClick={addHabit}
            >
              <PlusIcon className="w-5 h-5 sm:mr-2" /> 
              <span className="hidden sm:inline">Add</span>
            </button>
          </div>
        </div>

        {/* habit list card */}
        {habits.length > 0 ? (
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-700">Today&apos;s Habits</h2>
            <div className="space-y-3">
              {habits.map(habit => (
                <div
                  key={habit.id}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    habit.done 
                      ? "bg-green-50 border-green-200" 
                      : "bg-gray-50 border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={habit.done}
                        onChange={() => toggleHabits(habit.id)}
                        className="w-6 h-6 accent-green-500 cursor-pointer"
                      />
                      <span className={`font-medium text-lg ${
                        habit.done ? "text-green-700 line-through" : "text-gray-800"
                      }`}>
                        {habit.name}
                      </span>
                      {habit.done && (
                        <span className="text-green-600 text-sm font-medium">✅ Completed</span>
                      )}
                    </div>
                    <button
                      className="p-2 rounded-lg hover:bg-red-100 transition-colors"
                      onClick={() => removeHabit(habit.id)}
                      title="Delete habit"
                    >
                      <TrashIcon className="w-5 h-5 text-red-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow p-8 text-center">
            <div className="text-gray-400 mb-4">
              <span className="text-4xl">📝</span>
            </div>
            <h3 className="text-lg font-medium text-gray-600 mb-2">No habits yet</h3>
            <p className="text-gray-500">Add your first habit above to get started!</p>
          </div>
        )}

        {/* tip */}
        <div className="mt-8 text-center">
          <p className="text-gray-400 text-sm">
            💡 <strong>Tip:</strong> Add habits and check them off when completed. <br />
            Consistency is the key to building great routines!
          </p>
        </div>
      </div>
    </div>
  );
}

// Main component with authentication protection
export default function HabitPage() {
  return (
    <ProtectedRoute>
      <HabitContent />
    </ProtectedRoute>
  );
}
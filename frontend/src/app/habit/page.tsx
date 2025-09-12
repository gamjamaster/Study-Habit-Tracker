"use client";

import React, { useState, useEffect, useCallback } from "react";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { API_ENDPOINTS } from "@/lib/api";

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

export default function HabitPage() {
  // Habit state management
  const [habits, setHabits] = useState<HabitWithStatus[]>([]);
  // New habit input value
  const [newHabit, setNewHabit] = useState("");
  // Loading state
  const [loading, setLoading] = useState(true);
  // Error state
  const [error, setError] = useState<string | null>(null);

  // Fetch habits from backend
  const loadHabits = useCallback(async () => {
    try {
      setLoading(true);
      console.log("🔄 Loading habit data...");
      
      const response = await fetch(API_ENDPOINTS.HABITS);
      if (!response.ok) throw new Error("Cannot load habit data");
      
      const habitsData: Habit[] = await response.json();
      console.log("✅ Habit data loaded:", habitsData.length, "items");
      
      // Check today's completion status for each habit
      const habitsWithStatus = await Promise.all(
        habitsData.map(async (habit) => {
          console.log(`🔍 Checking completion for habit ${habit.id}: ${habit.name}`);
          const isDone = await checkTodayCompletion(habit.id);
          console.log(`📊 Habit ${habit.id} completion status: ${isDone}`);
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
  }, []);

  // Load habits data when component mounts
  useEffect(() => {
    loadHabits();
  }, [loadHabits]);

  // Check if habit is completed today
  const checkTodayCompletion = async (habitId: number): Promise<boolean> => {
    try {
      // Use local date formatting to avoid timezone issues
      const today = new Date();
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      
      const response = await fetch(API_ENDPOINTS.habitLogs(habitId));
      
      if (!response.ok) return false;
      
      const logs: HabitLog[] = await response.json();
      console.log(`Checking habit ${habitId} for ${todayStr}:`, logs); // Debug log
      
      // Check if there's a log for today
      const hasToday = logs.some((log) => {
        const logDate = log.completed_date.slice(0, 10);
        console.log(`Comparing ${logDate} with ${todayStr}`); // Debug log
        return logDate === todayStr;
      });
      
      console.log(`Habit ${habitId} has today's log: ${hasToday}`);
      return hasToday;
    } catch (error) {
      console.error("Completion status check error:", error);
      return false;
    }
  };

  // Toggle habit completion status
  const toggleHabits = async (habitId: number) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    console.log(`🔄 Toggling habit ${habitId}: ${habit.name} (currently ${habit.done ? 'checked' : 'unchecked'})`);

    try {
      if (habit.done) {
        // Uncheck: delete today's log
        console.log(`❌ Unchecking habit ${habitId} - deleting today's log`);
        await deleteTodayLog(habitId);
      } else {
        // Check: create today's log
        console.log(`✅ Checking habit ${habitId} - creating today's log`);
        await createTodayLog(habitId);
      }
      
      // Update UI
      setHabits(habits.map(h => 
        h.id === habitId ? { ...h, done: !h.done } : h
      ));
      console.log(`🔄 UI updated for habit ${habitId}`);
    } catch (error) {
      console.error("Habit toggle error:", error);
      alert("Failed to update habit status");
    }
  };

  // Create today's habit completion log
  const createTodayLog = async (habitId: number) => {
    try {
      // Use local date formatting to avoid timezone issues
      const today = new Date();
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}T00:00:00`;
      
      console.log(`📝 Creating log for habit ${habitId} on ${todayStr}`);
      
      const payload = {
        habit_id: habitId,
        completed_date: todayStr
      };
      
      console.log(`📤 Sending payload:`, payload);
      
      const response = await fetch(API_ENDPOINTS.habitLogs(habitId), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      console.log(`📥 Response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Log creation failed: ${errorText}`);
        throw new Error(`Log creation failed: ${errorText}`);
      }
      
      const result = await response.json();
      console.log(`✅ Log created successfully:`, result);
    } catch (error) {
      console.error("Log creation error:", error);
      throw error;
    }
  };

  // Delete today's habit completion log
  const deleteTodayLog = async (habitId: number) => {
    try {
      // Get today's logs and delete them
      const response = await fetch(API_ENDPOINTS.habitLogs(habitId));
      if (!response.ok) return;
      
      const logs: HabitLog[] = await response.json();
      // Use local date formatting to match creation logic
      const today = new Date();
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      
      // Filter today's logs for deletion
      const todayLogs = logs.filter((log) => {
        const logDate = log.completed_date.slice(0, 10);
        return logDate === todayStr;
      });
      
      // Delete each today's log
      for (const log of todayLogs) {
        console.log(`🗑️ Deleting log ${log.id} for habit ${habitId}`);
        const deleteResponse = await fetch(API_ENDPOINTS.habitLogById(log.id), {
          method: "DELETE"
        });
        
        if (!deleteResponse.ok) {
          console.error(`Failed to delete log ${log.id}`);
        } else {
          console.log(`✅ Successfully deleted log ${log.id}`);
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
        headers: { "Content-Type": "application/json" },
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
        method: "DELETE"
      });
      
      if (!response.ok) throw new Error("Habit deletion failed");
      
      setHabits(habits.filter(h => h.id !== habitId));
    } catch (error) {
      console.error("Habit deletion error:", error);
      alert("Failed to delete habit");
    }
  };



  // Calculate completed habits and percentage
  const done = habits.filter(h => h.done).length;
  const percent = habits.length ? Math.round((done / habits.length) * 100) : 0;

  // Loading display
  if (loading) {
    return (
      <section className="max-w-2xl mx-auto p-8">
        <div className="text-center text-gray-400">Loading habit data...</div>
      </section>
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
    <section className="max-w-2xl mx-auto p-8">
      {/* title */}
      <h1 className="text-3xl font-bold mb-5">Today&apos;s Habit</h1>

      {/* percentage bar + number */}
      <div className="mb-6">
        <div className="flex justify-between items-end mb-1">
          <span className="font-semibold">Percentage Accomplished</span>
          <span className="text-green-700 font-bold">{done} / {habits.length} ({percent}%)</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-green-500 h-3 rounded-full transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* adding habit form */}
      <div className="flex gap-2 mb-6">
        <input
          className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary-400"
          placeholder="Enter a new habit"
          value={newHabit}
          onChange={e => setNewHabit(e.target.value)}
          onKeyDown={e => e.key === "Enter" && addHabit()}
        />
        <button
          className="bg-primary-500 hover:bg-primary-600 text-white rounded px-3 py-2 flex items-center"
          onClick={addHabit}
        >
          <PlusIcon className="w-5 h-5 mr-1" /> Add
        </button>
      </div>

      {/* habit list */}
      <ul className="space-y-2">
        {habits.map(habit => (
          <li
            key={habit.id}
            className={`p-3 rounded shadow flex items-center justify-between
            ${habit.done ? "bg-green-50 border border-green-400" : "bg-white"}`}
          >
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={habit.done}
                onChange={() => toggleHabits(habit.id)}
                className="w-5 h-5 accent-green-500"
              />
              <span className={`font-medium text-lg ${habit.done ? "text-green-700 line-through" : ""}`}>
                {habit.name}
              </span>
            </div>
            <button
              className="p-1 rounded hover:bg-red-100"
              onClick={() => removeHabit(habit.id)}
              title="Delete"
            >
              <TrashIcon className="w-5 h-5 text-red-400" />
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-8 text-gray-400 text-sm text-center">
        Add a habit and check when achieved. <br />
        Consistency is the best routine!
      </div>
    </section>
  );
}
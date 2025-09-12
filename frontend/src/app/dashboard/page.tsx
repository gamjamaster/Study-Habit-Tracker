"use client";

import { ChartBarIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import WeeklyChart from "@/components/WeeklyChart";
import { useEffect, useState } from "react"; // React's current state and effect hook
import { API_ENDPOINTS } from "@/lib/api";

// type of dashboad data
type DashboardSummary={
  study_today: number;
  study_goal: number;
  study_percent: number;
  habit_done: number;
  habit_total: number;
  habit_percent: number;
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null); // dashboard data state
  const [loading, setLoading] = useState(true); // loading state
  const [error, setError] = useState<string | null>(null); // error state

  useEffect(() => {
  fetch(API_ENDPOINTS.DASHBOARD_SUMMARY)
      .then(res => {
        if(!res.ok) throw new Error("API Error");
        return res.json();
      })
      .then(data => {
        // store the API response in the current state
        setSummary({
          study_today: data.study_today,
          study_goal: data.study_goal,
          study_percent: Math.round((data.study_today / data.study_goal) * 100),
          habit_done: data.habit_done,
          habit_total: data.habit_total,
          habit_percent: data.habit_total > 0 ? Math.round((data.habit_done / data.habit_total) * 100) : 0
        });
        setLoading(false);
      })
      .catch(() => {
        setError("Cannot load the dashboard data.");
        setLoading(false);
      });
  }, []);

  // loading / error handling
  if (loading) return <div className = "p-8 text center text-gray-400">Loading dashboard data...</div>;
  if (error) return <div className = "p-8 text-center text-red-400">{error}</div>;
  if(!summary) return null; // return null if data doesnt exist

  return (
    <section>
      {/* dashboard title */}
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Dashboard</h1>

      {/* today's study time/habit summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* study card */}
        <div className="bg-white rounded-xl shadow p-6 flex items-center gap-5">
          <div className="bg-primary-500/10 rounded-full p-3">
            <ChartBarIcon className="w-8 h-8 text-primary-500" />
          </div>
          <div>
            <div className="text-lg font-medium text-gray-500">Today&apos;s Study Time</div>
            <div className="text-3xl font-bold text-gray-900">
              {summary.study_today} <span className="text-base text-gray-400">/ {summary.study_goal} minutes</span>
            </div>
            <div className="mt-1 text-primary-500 font-semibold">{summary.study_percent}% Achieved</div>
          </div>
        </div>
        {/* habit card */}
        <div className="bg-white rounded-xl shadow p-6 flex items-center gap-5">
          <div className="bg-green-500/10 rounded-full p-3">
            <CheckCircleIcon className="w-8 h-8 text-green-500" />
          </div>
          <div>
            <div className="text-lg font-medium text-gray-500">Today&apos;s Achieved Habit</div>
            <div className="text-3xl font-bold text-gray-900">
              {summary.habit_done} <span className="text-base text-gray-400">/ {summary.habit_total} habits</span>
            </div>
            <div className="mt-1 text-green-500 font-semibold">{summary.habit_percent}% Achieved</div>
          </div>
        </div>
      </div>

      {/* weekly graph */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="font-semibold text-gray-700 mb-4">Weekly Study/Habit Graph</h2>
        <WeeklyChart />
      </div>
    </section>
  );
}
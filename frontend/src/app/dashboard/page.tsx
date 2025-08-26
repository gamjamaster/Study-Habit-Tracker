"use client";

import { ChartBarIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import WeeklyChart from "@/components/WeeklyChart";

// dummy data
const studyStats = { today: 120, goal: 180, percent: Math.round((120 / 180) * 100) };
const habitStats = { done: 4, total: 5, percent: Math.round((4 / 5) * 100) };

export default function DashboardPage() {
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
            <div className="text-lg font-medium text-gray-500">Today's Study Time</div>
            <div className="text-3xl font-bold text-gray-900">
              {studyStats.today} <span className="text-base text-gray-400">/ {studyStats.goal} minutes</span>
            </div>
            <div className="mt-1 text-primary-500 font-semibold">{studyStats.percent}% Achieved</div>
          </div>
        </div>
        {/* habit card */}
        <div className="bg-white rounded-xl shadow p-6 flex items-center gap-5">
          <div className="bg-green-500/10 rounded-full p-3">
            <CheckCircleIcon className="w-8 h-8 text-green-500" />
          </div>
          <div>
            <div className="text-lg font-medium text-gray-500">Today's Achieved Habit</div>
            <div className="text-3xl font-bold text-gray-900">
              {habitStats.done} <span className="text-base text-gray-400">/ {habitStats.total} habits</span>
            </div>
            <div className="mt-1 text-green-500 font-semibold">{habitStats.percent}% Achieved</div>
          </div>
        </div>
      </div>

      {/* 주간 그래프 */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="font-semibold text-gray-700 mb-4">Weekly Study/Habit Graph</h2>
        <WeeklyChart />
      </div>
    </section>
  );
}
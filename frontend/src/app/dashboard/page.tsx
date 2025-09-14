"use client";

import { ChartBarIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import WeeklyChart from "@/components/WeeklyChart";
import { useEffect, useState } from "react"; // React's current state and effect hook
import { API_ENDPOINTS } from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";

// type of dashboad data
type DashboardSummary={
  study_today: number;
  study_goal: number;
  study_percent: number;
  habit_done: number;
  habit_total: number;
  habit_percent: number;
}

function DashboardContent(){
  const {user, session} = useAuth() // loads the current user's info and session
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // request for data only when an user is logged in
    if(!user || !session) {
      console.log('Dashboard: No user or session', { user: !!user, session: !!session });
      return;
    }

    console.log('Dashboard: Making API request', { 
      endpoint: API_ENDPOINTS.DASHBOARD_SUMMARY, 
      hasToken: !!session.access_token 
    });

    // request for API with JWT token included in the header
    fetch(API_ENDPOINTS.DASHBOARD_SUMMARY, {
      headers: {
        'Authorization': `Bearer ${session.access_token}`, // Supabase session token
        'Content-Type': 'application/json'
      }
    })
    .then(res => {
      console.log('Dashboard API response status:', res.status);
      if(!res.ok) {
        throw new Error(`API Error: ${res.status} ${res.statusText}`);
      }
      return res.json();
    })
    .then(data => {
      console.log('Dashboard API data:', data);
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
    .catch((error) => {
      console.error('Dashboard API error:', error);
      setError(`Cannot load the dashboard data: ${error.message}`);
      setLoading(false);
    });
  }, [user, session]); // reload whenever the user or session changes

  if(loading) return <div className = "p-8 text-center text-gray-400">Loading...</div>;
  if(error) return <div className = "p-8 text-center text-red-400">{error}</div>;
  if(!summary) return null;

  return (
    <div className="py-4 lg:py-8">
      <div className="max-w-4xl mx-auto p-2 sm:p-4">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-gray-900 text-center">
          📊 {user?.email}&apos;s Dashboard
        </h1>

        {/* 오늘의 통계 카드들 */}
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2 mb-6 sm:mb-8">
          {/* 학습 시간 카드 */}
          <div className="bg-blue-50 rounded-xl shadow p-4 sm:p-6 flex flex-col items-center">
            <ChartBarIcon className="w-8 h-8 text-blue-600 mb-3" />
            <h3 className="text-lg font-bold text-blue-700 mb-2">Today&apos;s Study Time</h3>
            <div className="text-3xl font-bold text-blue-800 mb-1">
              {summary.study_today} / {summary.study_goal}
            </div>
            <div className="text-sm text-blue-600 mb-2">minutes</div>
            <div className="text-lg font-semibold text-blue-700">{summary.study_percent}% Achieved</div>
          </div>

          {/* 습관 카드 */}
          <div className="bg-green-50 rounded-xl shadow p-4 sm:p-6 flex flex-col items-center">
            <CheckCircleIcon className="w-8 h-8 text-green-600 mb-3" />
            <h3 className="text-lg font-bold text-green-700 mb-2">Today&apos;s Habits</h3>
            <div className="text-3xl font-bold text-green-800 mb-1">
              {summary.habit_done} / {summary.habit_total}
            </div>
            <div className="text-sm text-green-600 mb-2">habits</div>
            <div className="text-lg font-semibold text-green-700">{summary.habit_percent}% Achieved</div>
          </div>
        </div>

        {/* 주간 차트 카드 */}
        <div className="bg-white rounded-xl shadow p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-700 mb-4 flex items-center">
            📈 Weekly Progress
          </h2>
          <WeeklyChart token={session?.access_token} />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
"use client";

import { ChartBarIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { Suspense } from "react"; // React's Suspense for dynamic loading
import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";

// Dynamic loading for WeeklyChart component performance optimization
const WeeklyChart = dynamic(() => import("@/components/WeeklyChart"), {
  loading: () => (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      <span className="ml-2 text-gray-600">Loading chart...</span>
    </div>
  ),
  ssr: false // Disable server-side rendering, load only on client
});

// Type definition for dashboard data
type DashboardData = {
  study_today: number;
  habit_done: number;
  habit_total: number;
  habit_percent: number;
}

function DashboardContent(){
  const {user, session} = useAuth() // Get current user info and session

  // Use React Query for API data caching and optimization
  const { data: summary, isLoading, error, refetch } = useQuery<DashboardData>({
    queryKey: ['dashboard-summary', user?.id], // Include user ID in cache key
    queryFn: async () => {
      if(!user || !session) {
        throw new Error('User authentication required');
      }

      const response = await fetch(API_ENDPOINTS.DASHBOARD_SUMMARY, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if(!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      return {
        study_today: data.study_today,
        habit_done: data.habit_done,
        habit_total: data.habit_total,
        habit_percent: data.habit_total > 0 ? Math.round((data.habit_done / data.habit_total) * 100) : 0
      };
    },
    enabled: !!user && !!session, // Only run query when user and session exist
    staleTime: 2 * 60 * 1000, // Keep data fresh for 2 minutes
    gcTime: 5 * 60 * 1000, // Keep cache for 5 minutes
  });

  // Manual refresh function
  const handleRefresh = () => {
    refetch(); // Use React Query's refetch function
  };

  if(isLoading) return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600">Loading...</span>
      </div>
    );
  if(error) return <div className = "p-8 text-center text-red-400">{error.message}</div>;
  if(!summary) return null;

  return (
    <div className="py-4 lg:py-8">
      <div className="max-w-4xl mx-auto p-2 sm:p-4">
        <div className="flex items-center justify-center gap-4 mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {user?.user_metadata?.full_name || user?.email}&apos;s Dashboard
          </h1>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            title="Refresh dashboard data"
          >
            🔄 {isLoading ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        {/* summary cards */}
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2 mb-6 sm:mb-8">
          {/* study time card */}
          <div className="bg-blue-50 rounded-xl shadow p-4 sm:p-6 flex flex-col items-center">
            <ChartBarIcon className="w-8 h-8 text-blue-600 mb-3" />
            <h3 className="text-lg font-bold text-blue-700 mb-2">Today&apos;s Study Time</h3>
            <div className="text-3xl font-bold text-blue-800 mb-1">
              {summary.study_today}
            </div>
            <div className="text-sm text-blue-600 mb-2">minutes</div>
          </div>

          {/* habit card */}
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

        {/* weekly chart card */}
        <div className="bg-white rounded-xl shadow p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-700 mb-4 flex items-center">
            📈 Weekly Progress
          </h2>
          <Suspense fallback={
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-2 text-gray-600">Loading chart...</span>
            </div>
          }>
            <WeeklyChart token={session?.access_token} />
          </Suspense>
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
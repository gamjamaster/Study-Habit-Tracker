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

  // Format minutes to hours and minutes
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return { display: `${hours}h ${mins}m`, label: `${hours} hour${hours > 1 ? 's' : ''} ${mins} minute${mins !== 1 ? 's' : ''}` };
    }
    return { display: `${mins}m`, label: `${mins} minute${mins !== 1 ? 's' : ''}` };
  };

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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-700"></div>
        <span className="ml-3 text-gray-600">Loading...</span>
      </div>
    );
    
  if(error) return <div className = "p-8 text-center text-red-400">{error.message}</div>;
  if(!summary) return null;

  return (
    <div className="py-4 sm:py-6 lg:py-8 lg:-ml-60 lg:pl-60">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-3 sm:gap-4 mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 text-center sm:text-left">
            {user?.user_metadata?.full_name || user?.email}&apos;s Dashboard
          </h1>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg text-xs sm:text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1 mx-auto sm:mx-0"
            title="Refresh dashboard data"
          >
            🔄 {isLoading ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        {/* summary cards */}
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2 mb-6 sm:mb-8">
          {/* study time card */}
          <div className="bg-white border-2 border-gray-200 rounded-xl shadow p-4 sm:p-6 flex flex-col items-center">
            <ChartBarIcon className="w-8 h-8 text-gray-900 mb-3" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">Today&apos;s Study Time</h3>
            <div className="text-3xl font-bold text-black mb-1">
              {formatTime(summary.study_today).display}
            </div>
            <div className="text-sm text-gray-600 mb-2">{formatTime(summary.study_today).label}</div>
          </div>

          {/* habit card */}
          <div className="bg-gray-50 border-2 border-gray-200 rounded-xl shadow p-4 sm:p-6 flex flex-col items-center">
            <CheckCircleIcon className="w-8 h-8 text-gray-900 mb-3" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">Today&apos;s Habits</h3>
            <div className="text-3xl font-bold text-black mb-1">
              {summary.habit_done} / {summary.habit_total}
            </div>
            <div className="text-sm text-gray-600 mb-2">habits</div>
            <div className="text-lg font-semibold text-gray-900">{summary.habit_percent}% Achieved</div>
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
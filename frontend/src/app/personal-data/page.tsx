"use client";

import { useState, useEffect, useCallback } from "react";
import { API_ENDPOINTS } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import StudyStatsChart from "@/components/analytics/StudyStatsChart";
import HabitCompletionChart from "@/components/analytics/HabitCompletionChart";
import CorrelationChart from "@/components/analytics/CorrelationChart";
import {
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon
} from "@heroicons/react/24/outline";

interface StudyStats {
  period: string;
  daily_stats: Array<{
    date: string;
    total_minutes: number;
    session_count: number;
  }>;
  subject_stats: Array<{
    subject: string;
    color: string;
    total_minutes: number;
    session_count: number;
  }>;
}

interface HabitStats {
  period: string;
  total_habits: number;
  daily_completion: Array<{
    date: string;
    completed_habits: number;
    completion_rate: number;
  }>;
  weekday_completion: Array<{
    weekday: number;
    weekday_name: string;
    completion_count: number;
  }>;
  habit_stats: Array<{
    habit_name: string;
    completion_count: number;
  }>;
}

interface CorrelationData {
  correlation_data: Array<{
    date: string;
    study_minutes: number;
    habit_count: number;
  }>;
}

function PersonalDataContent() {
  const { user, session } = useAuth(); // get authentication state
  const [studyStats, setStudyStats] = useState<StudyStats | null>(null);
  const [habitStats, setHabitStats] = useState<HabitStats | null>(null);
  const [correlationData, setCorrelationData] = useState<CorrelationData | null>(null);
  const [period, setPeriod] = useState<'week' | 'month'>('week');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalyticsData = useCallback(async () => {
    // check authentication before making API calls
    if (!user || !session) {
      console.log('PersonalData: No user or session', { user: !!user, session: !!session });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const headers = {
        'Authorization': `Bearer ${session.access_token}`, // add JWT token
        'Content-Type': 'application/json'
      };
      
      const [studyResponse, habitResponse, correlationResponse] = await Promise.all([
        fetch(`${API_ENDPOINTS.ANALYTICS_STUDY_STATS}?period=${period}`, { headers }),
        fetch(`${API_ENDPOINTS.ANALYTICS_HABIT_COMPLETION}?period=${period}`, { headers }),
        fetch(`${API_ENDPOINTS.ANALYTICS_CORRELATION}`, { headers })
      ]);

      if (studyResponse.ok) {
        const studyData = await studyResponse.json();
        setStudyStats(studyData);
      }

      if (habitResponse.ok) {
        const habitData = await habitResponse.json();
        setHabitStats(habitData);
      }

      if (correlationResponse.ok) {
        const corrData = await correlationResponse.json();
        setCorrelationData(corrData);
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      setError('Failed to load analytics data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [period, user, session]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600">Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchAnalyticsData}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4 lg:py-8">
      <div className="max-w-7xl mx-auto p-2 sm:p-4">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">📊 Personal Data Analytics</h1>
          
          {/* Period Selector */}
          <div className="flex gap-2">
            <button
              onClick={() => setPeriod('week')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                period === 'week' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setPeriod('month')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                period === 'month' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Monthly
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-blue-50 rounded-xl shadow p-4 sm:p-6">
            <div className="flex items-center">
              <ChartBarIcon className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Study Time</p>
                <p className="text-2xl font-bold text-blue-800">
                  {studyStats?.daily_stats.reduce((sum, day) => sum + day.total_minutes, 0) || 0} min
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 rounded-xl shadow p-4 sm:p-6">
            <div className="flex items-center">
              <CheckCircleIcon className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm text-green-600 font-medium">Habits Completed</p>
                <p className="text-2xl font-bold text-green-800">
                  {habitStats?.daily_completion.reduce((sum, day) => sum + day.completed_habits, 0) || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 rounded-xl shadow p-4 sm:p-6">
            <div className="flex items-center">
              <ClockIcon className="w-8 h-8 text-purple-600 mr-3" />
              <div>
                <p className="text-sm text-purple-600 font-medium">Study Sessions</p>
                <p className="text-2xl font-bold text-purple-800">
                  {studyStats?.daily_stats.reduce((sum, day) => sum + day.session_count, 0) || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 rounded-xl shadow p-4 sm:p-6">
            <div className="flex items-center">
              <ArrowTrendingUpIcon className="w-8 h-8 text-orange-600 mr-3" />
              <div>
                <p className="text-sm text-orange-600 font-medium">Avg Completion Rate</p>
                <p className="text-2xl font-bold text-orange-800">
                  {habitStats?.daily_completion && habitStats.daily_completion.length > 0 
                    ? Math.round(
                        habitStats.daily_completion.reduce((sum, day) => sum + day.completion_rate, 0) / 
                        habitStats.daily_completion.length
                      ) 
                    : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
          {/* Study Statistics Chart */}
          {studyStats && (
            <div className="bg-white rounded-xl shadow p-4 sm:p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">📚 Study Time Trends</h2>
              <StudyStatsChart data={studyStats} />
            </div>
          )}

          {/* Habit Completion Chart */}
          {habitStats && (
            <div className="bg-white rounded-xl shadow p-4 sm:p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">✅ Habit Completion Analysis</h2>
              <HabitCompletionChart data={habitStats} />
            </div>
          )}

          {/* Correlation Chart */}
          {correlationData && (
            <div className="bg-white rounded-xl shadow p-4 sm:p-6 xl:col-span-2">
              <h2 className="text-xl font-bold text-gray-800 mb-4">🔗 Study Time vs Habit Completion Correlation</h2>
              <CorrelationChart data={correlationData} />
            </div>
          )}
        </div>

        {/* Insights Section */}
        {studyStats && habitStats && (
          <div className="mt-8 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">💡 Personal Insights</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4">
                <h3 className="font-semibold text-blue-700 mb-2">Study Pattern</h3>
                <p className="text-sm text-gray-600">
                  Your most productive subject is {studyStats.subject_stats.length > 0 
                    ? studyStats.subject_stats.sort((a, b) => b.total_minutes - a.total_minutes)[0].subject 
                    : 'N/A'} with the highest study time.
                </p>
              </div>
              <div className="bg-white rounded-lg p-4">
                <h3 className="font-semibold text-green-700 mb-2">Habit Consistency</h3>
                <p className="text-sm text-gray-600">
                  {habitStats.weekday_completion.length > 0 
                    ? `Your best day for habits is ${habitStats.weekday_completion.sort((a, b) => b.completion_count - a.completion_count)[0].weekday_name}.`
                    : 'Start logging habits to see patterns!'
                  }
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Main component with authentication protection
export default function PersonalDataPage() {
  return (
    <ProtectedRoute>
      <PersonalDataContent />
    </ProtectedRoute>
  );
}
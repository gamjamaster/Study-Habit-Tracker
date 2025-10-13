"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { TrophyIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import { API_ENDPOINTS } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Link from "next/link";

// Leaderboard entry interface
interface LeaderboardEntry {
  user_id: string;
  username: string;
  total_study_minutes: number;
  study_sessions_count: number;
  habit_completion_rate: number;
  total_habits: number;
  completed_habits: number;
  rank: number;
}

// Group leaderboard response interface
interface GroupLeaderboardResponse {
  group_id: number;
  group_name: string;
  leaderboard: LeaderboardEntry[];
  total_members: number;
  week_start: string;
  week_end: string;
}

// Group interface
interface StudyGroup {
  id: number;
  name: string;
  description?: string;
  created_by: string;
  created_at: string;
  invite_code: string;
}

function GroupDetailContent() {
  const params = useParams();
  const router = useRouter();
  const { user, session } = useAuth();
  const [group, setGroup] = useState<StudyGroup | null>(null);
  const [leaderboard, setLeaderboard] = useState<GroupLeaderboardResponse | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [leaving, setLeaving] = useState(false);

  const groupId = params.id as string;

  // Fetch group details and leaderboard
  useEffect(() => {
    async function fetchGroupData() {
      if (!user || !session || !groupId) {
        setLoading(false);
        return;
      }

      try {
        // Fetch group details
        const groupResponse = await fetch(API_ENDPOINTS.groupById(parseInt(groupId)), {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        });

        if (groupResponse.ok) {
          const groupData = await groupResponse.json();
          setGroup(groupData);
        } else if (groupResponse.status === 403) {
          alert("You are not a member of this group");
          router.push('/groups');
          return;
        }

        // Fetch leaderboard
        const leaderboardResponse = await fetch(API_ENDPOINTS.groupLeaderboard(parseInt(groupId)), {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        });

        if (leaderboardResponse.ok) {
          const leaderboardData = await leaderboardResponse.json();
          setLeaderboard(leaderboardData);
        }
      } catch (error) {
        console.error('Error fetching group data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchGroupData();
  }, [user, session, groupId, router]);

  // Leave group
  const leaveGroup = async () => {
    if (!confirm("Are you sure you want to leave this group?")) {
      return;
    }

    if (!session) {
      alert("Please log in to leave the group");
      return;
    }

    setLeaving(true);
    try {
      const response = await fetch(API_ENDPOINTS.leaveGroup(parseInt(groupId)), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        alert("Successfully left the group");
        router.push('/groups');
      } else {
        const error = await response.json();
        alert(`Failed to leave group: ${error.detail}`);
      }
    } catch (error) {
      console.error('Error leaving group:', error);
      alert("An error occurred while leaving the group");
    } finally {
      setLeaving(false);
    }
  };

  // Format time
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  // Get rank color
  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return "text-yellow-600 bg-yellow-100";
      case 2: return "text-gray-600 bg-gray-100";
      case 3: return "text-orange-600 bg-orange-100";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  if(isLoading) return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600">Loading...</span>
      </div>
    );

  if (!group || !leaderboard) {
    return (
      <div className="py-8">
        <div className="max-w-4xl mx-auto p-4 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Group Not Found</h1>
          <Link
            href="/groups"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg inline-flex items-center gap-2"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Back to Groups
          </Link>
        </div>
      </div>
    );
  }

  const currentUserEntry = leaderboard.leaderboard.find(entry => entry.user_id === user?.id);

  return (
    <div className="py-8">
      <div className="max-w-6xl mx-auto p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/groups"
              className="text-gray-600 hover:text-gray-800"
            >
              <ArrowLeftIcon className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{group.name}</h1>
              {group.description && (
                <p className="text-gray-600 mt-1">{group.description}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm text-gray-500">Members</div>
              <div className="font-semibold">{leaderboard.total_members}</div>
            </div>
            <button
              onClick={leaveGroup}
              disabled={leaving}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
            >
              {leaving ? "Leaving..." : "Leave Group"}
            </button>
          </div>
        </div>

        {/* Week Info */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-blue-900">This Week&apos;s Leaderboard</h2>
              <p className="text-sm text-blue-700">
                {new Date(leaderboard.week_start).toLocaleDateString()} - {new Date(leaderboard.week_end).toLocaleDateString()}
              </p>
            </div>
            <TrophyIcon className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        {/* Current User Stats */}
        {currentUserEntry && (
          <div className="bg-green-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-green-900 mb-2">Your Stats This Week</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">#{currentUserEntry.rank}</div>
                <div className="text-sm text-green-700">Rank</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{formatTime(currentUserEntry.total_study_minutes)}</div>
                <div className="text-sm text-green-700">Study Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{currentUserEntry.study_sessions_count}</div>
                <div className="text-sm text-green-700">Sessions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{Math.round(currentUserEntry.habit_completion_rate * 100)}%</div>
                <div className="text-sm text-green-700">Habits</div>
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">🏆 Leaderboard</h2>
          </div>

          <div className="divide-y divide-gray-200">
            {leaderboard.leaderboard.map((entry) => (
              <div
                key={entry.user_id}
                className={`px-6 py-4 flex items-center justify-between ${
                  entry.user_id === user?.id ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${getRankColor(entry.rank)}`}>
                    {entry.rank <= 3 ? (
                      <TrophyIcon className="w-6 h-6" />
                    ) : (
                      entry.rank
                    )}
                  </div>

                  <div>
                    <div className="font-semibold text-gray-900">
                      {entry.username} 
                      {entry.user_id === user?.id && (
                        <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">You</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      {entry.study_sessions_count} sessions
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <div className="font-semibold text-gray-900">{formatTime(entry.total_study_minutes)}</div>
                    <div className="text-gray-500">Study Time</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-gray-900">{Math.round(entry.habit_completion_rate * 100)}%</div>
                    <div className="text-gray-500">Habits</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {leaderboard.leaderboard.length === 0 && (
            <div className="px-6 py-12 text-center">
              <TrophyIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">No Data Yet</h3>
              <p className="text-gray-500">Start studying and completing habits to see the leaderboard!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Main component wrapped with authentication protection
export default function GroupDetailPage() {
  return (
    <ProtectedRoute>
      <GroupDetailContent />
    </ProtectedRoute>
  );
}
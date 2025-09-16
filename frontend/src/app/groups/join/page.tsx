"use client";

import React, { useState } from "react";
import { UsersIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import { API_ENDPOINTS } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Link from "next/link";
import { useRouter } from "next/navigation";

function JoinGroupContent() {
  const { session } = useAuth();
  const router = useRouter();
  const [inviteCode, setInviteCode] = useState("");
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");

  const joinGroup = async () => {
    if (!inviteCode.trim()) {
      setError("Please enter an invite code");
      return;
    }

    if (!session) {
      setError("Please log in to join a group");
      return;
    }

    setJoining(true);
    setError("");

    try {
      const response = await fetch(API_ENDPOINTS.joinGroup(inviteCode), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Successfully joined "${data.group_name}"!`);
        router.push('/groups');
      } else {
        const errorData = await response.json();
        setError(errorData.detail || "Failed to join group");
      }
    } catch (error) {
      console.error('Error joining group:', error);
      setError("An error occurred while joining the group");
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="py-8">
      <div className="max-w-md mx-auto p-4">
        {/* Back Button */}
        <Link
          href="/groups"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Back to Groups
        </Link>

        {/* Join Group Card */}
        <div className="bg-white rounded-xl shadow-md p-8">
          <div className="text-center mb-6">
            <div className="text-4xl mb-4">👥</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Join Study Group</h1>
            <p className="text-gray-600">Enter the invite code to join an existing study group</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Invite Code
              </label>
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-lg font-mono tracking-wider"
                placeholder="ENTER CODE"
                maxLength={16}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <button
              onClick={joinGroup}
              disabled={joining}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {joining ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Joining...
                </>
              ) : (
                <>
                  <UsersIcon className="w-5 h-5" />
                  Join Group
                </>
              )}
            </button>
          </div>

          {/* Help Text */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Don&apos;t have an invite code?{" "}
              <Link href="/groups" className="text-blue-600 hover:text-blue-700 font-medium">
                Create your own group
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main component wrapped with authentication protection
export default function JoinGroupPage() {
  return (
    <ProtectedRoute>
      <JoinGroupContent />
    </ProtectedRoute>
  );
}
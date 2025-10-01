"use client";

import React, { useState, useEffect } from "react";
import { PlusIcon, UsersIcon, ClipboardIcon, TrashIcon } from "@heroicons/react/24/outline";
import { API_ENDPOINTS } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Link from "next/link";

// Group interface
interface StudyGroup {
  id: number;
  name: string;
  description?: string;
  created_by: string;
  created_at: string;
  invite_code: string;
}

function GroupsContent() {
  const { user, session } = useAuth();
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: "", description: "" });
  const [creating, setCreating] = useState(false);

  // Fetch user's groups
  useEffect(() => {
    async function fetchGroups() {
      if (!user || !session) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(API_ENDPOINTS.GROUPS, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setGroups(data);
        }
      } catch (error) {
        console.error('Error fetching groups:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchGroups();
  }, [user, session]);

  // Create new group
  const createGroup = async () => {
    if (!newGroup.name.trim()) {
      alert("Please enter a group name");
      return;
    }

    if (!session) {
      alert("Please log in to create a group");
      return;
    }

    setCreating(true);
    try {
      const response = await fetch(API_ENDPOINTS.GROUPS, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newGroup)
      });

      if (response.ok) {
        const createdGroup = await response.json();
        setGroups([...groups, createdGroup]);
        setNewGroup({ name: "", description: "" });
        setShowCreateForm(false);
        alert("Group created successfully!");
      } else {
        const error = await response.json();
        alert(`Failed to create group: ${error.detail}`);
      }
    } catch (error) {
      console.error('Error creating group:', error);
      alert("An error occurred while creating the group");
    } finally {
      setCreating(false);
    }
  };

  // Copy invite code to clipboard
  const copyInviteCode = (inviteCode: string) => {
    navigator.clipboard.writeText(inviteCode);
    alert("Invite code copied to clipboard!");
  };

  // Delete group
  const deleteGroup = async (groupId: number, groupName: string) => {
    if (!confirm(`Are you sure you want to delete "${groupName}"? This action cannot be undone.`)) {
      return;
    }

    if (!session) {
      alert("Please log in to delete a group");
      return;
    }

    try {
      const response = await fetch(API_ENDPOINTS.deleteGroup(groupId), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setGroups(groups.filter(group => group.id !== groupId));
        alert("Group deleted successfully!");
      } else {
        const error = await response.json();
        alert(`Failed to delete group: ${error.detail}`);
      }
    } catch (error) {
      console.error('Error deleting group:', error);
      alert("An error occurred while deleting the group");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="max-w-6xl mx-auto p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">📚 Study Groups</h1>
            <p className="text-gray-600">Create and join study groups to compete with friends</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            Create Group
          </button>
        </div>

        {/* Create Group Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
              <h2 className="text-xl font-bold mb-4">Create New Study Group</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Group Name *
                  </label>
                  <input
                    type="text"
                    value={newGroup.name}
                    onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter group name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    value={newGroup.description}
                    onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe your study group"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={createGroup}
                  disabled={creating}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                >
                  {creating ? "Creating..." : "Create Group"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Groups Grid */}
        {groups.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-12 text-center">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Study Groups Yet</h3>
            <p className="text-gray-500 mb-6">Create your first study group to start competing with friends!</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg inline-flex items-center gap-2"
            >
              <PlusIcon className="w-5 h-5" />
              Create Your First Group
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
              <div key={group.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{group.name}</h3>
                    {group.description && (
                      <p className="text-gray-600 text-sm">{group.description}</p>
                    )}
                  </div>
                  <UsersIcon className="w-6 h-6 text-gray-400" />
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>Created {new Date(group.created_at).toLocaleDateString()}</span>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <Link
                    href={`/groups/${group.id}`}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-center block"
                  >
                    View Group
                  </Link>

                  <button
                    onClick={() => copyInviteCode(group.invite_code)}
                    className="w-full border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-lg text-center flex items-center justify-center gap-2"
                  >
                    <ClipboardIcon className="w-4 h-4" />
                    Copy Invite Code
                  </button>

                  <button
                    onClick={() => deleteGroup(group.id, group.name)}
                    className="w-full border border-red-300 hover:bg-red-50 text-red-600 px-4 py-2 rounded-lg text-center flex items-center justify-center gap-2"
                  >
                    <TrashIcon className="w-4 h-4" />
                    Delete Group
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Join Group Section */}
        <div className="mt-12 bg-gray-50 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">Join a Study Group</h2>
          <p className="text-gray-600 mb-4">
            Have an invite code? Join an existing study group to start competing!
          </p>
          <Link
            href="/groups/join"
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg inline-flex items-center gap-2"
          >
            <UsersIcon className="w-5 h-5" />
            Join Group
          </Link>
        </div>
      </div>
    </div>
  );
}

// Main component wrapped with authentication protection
export default function GroupsPage() {
  return (
    <ProtectedRoute>
      <GroupsContent />
    </ProtectedRoute>
  );
}
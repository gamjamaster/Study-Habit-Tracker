// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// API endpoints
export const API_ENDPOINTS = {
  HABITS: `${API_BASE_URL}/habits`,
  HABIT_LOGS: `${API_BASE_URL}/habit-logs`,
  SUBJECTS: `${API_BASE_URL}/subjects`,
  STUDY_SESSIONS: `${API_BASE_URL}/study-sessions`,
  DASHBOARD_SUMMARY: `${API_BASE_URL}/dashboard/summary`,
  DASHBOARD_WEEKLY: `${API_BASE_URL}/dashboard/weekly`,

  // Groups endpoints
  GROUPS: `${API_BASE_URL}/groups`,
  joinGroup: (inviteCode: string) => `${API_BASE_URL}/groups/join/${inviteCode}`,

  // Dynamic endpoints
  habitById: (id: number) => `${API_BASE_URL}/habits/${id}`,
  habitLogs: (id: number) => `${API_BASE_URL}/habits/${id}/logs`,
  habitLogById: (id: number) => `${API_BASE_URL}/habit-logs/${id}`,
  groupById: (id: number) => `${API_BASE_URL}/groups/${id}`,
  groupLeaderboard: (id: number) => `${API_BASE_URL}/groups/${id}/leaderboard`,
  leaveGroup: (id: number) => `${API_BASE_URL}/groups/${id}/leave`,

  // Analytics endpoints
  ANALYTICS_STUDY_STATS: `${API_BASE_URL}/analytics/study-stats`,
  ANALYTICS_HABIT_COMPLETION: `${API_BASE_URL}/analytics/habit-completion`,
  ANALYTICS_CORRELATION: `${API_BASE_URL}/analytics/correlation`,
};export default API_BASE_URL;
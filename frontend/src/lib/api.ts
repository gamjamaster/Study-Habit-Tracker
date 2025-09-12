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
  
  // Dynamic endpoints
  habitById: (id: number) => `${API_BASE_URL}/habits/${id}`,
  habitLogs: (id: number) => `${API_BASE_URL}/habits/${id}/logs`,
  habitLogById: (id: number) => `${API_BASE_URL}/habit-logs/${id}`,
};

export default API_BASE_URL;
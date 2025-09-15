"use client";

import React, { useState, useEffect } from "react";
import { PlusIcon, TrashIcon, BookOpenIcon } from "@heroicons/react/24/outline";
import { API_ENDPOINTS } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";  // import authentication context
import ProtectedRoute from "@/components/ProtectedRoute";  // import protected route component

// define interfaces for type safety
interface Subject {
  id: number;
  name: string;
  color: string;
  created_at: string;
}

interface StudyLog {
  id: number;
  subject_id: number;
  duration_minutes: number;
  notes?: string;
  created_at: string;
}

// load subjects with timeout and error handling
async function fetchSubjects(token: string) {
  try {
    console.log("🔄 Fetching subjects from backend..."); // debug log
    const controller = new AbortController(); // create timeout controller
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const res = await fetch(API_ENDPOINTS.SUBJECTS, {
      headers: {
        'Authorization': `Bearer ${token}`,  // add JWT token to request
        'Content-Type': 'application/json'
      },
      signal: controller.signal, // attach timeout signal
    });
    
    clearTimeout(timeoutId); // clear timeout on success
    
    if (!res.ok) {
      console.error("❌ Failed to fetch subjects:", res.status);
      return [];
    }
    
    const data = await res.json();
    console.log("✅ Subjects loaded:", data.length, "items");
    return data;
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        console.error("⏱️ Request timeout: subjects");
      } else {
        console.error("❌ Network error fetching subjects:", error.message);
      }
    } else {
      console.error("❌ Unknown error fetching subjects:", error);
    }
    return []; // return empty array to prevent infinite loading
  }
}

// load study logs with timeout and error handling
async function fetchStudyLogs(token: string) {
  try {
    console.log("🔄 Fetching study logs from backend..."); // debug log
    const controller = new AbortController(); // create timeout controller
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const res = await fetch(API_ENDPOINTS.STUDY_SESSIONS, {
      headers: {
        'Authorization': `Bearer ${token}`,  // add JWT token to request
        'Content-Type': 'application/json'
      },
      signal: controller.signal, // attach timeout signal
    });
    
    clearTimeout(timeoutId); // clear timeout on success
    
    if (!res.ok) {
      console.error("❌ Failed to fetch study logs:", res.status);
      return [];
    }
    
    const data = await res.json();
    console.log("✅ Study logs loaded:", data.length, "items");
    return data;
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        console.error("⏱️ Request timeout: study logs");
      } else {
        console.error("❌ Network error fetching study logs:", error.message);
      }
    } else {
      console.error("❌ Unknown error fetching study logs:", error);
    }
    return []; // return empty array to prevent infinite loading
  }
}

function StudyContent() {
  const { user, session } = useAuth(); // get authentication state
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [logs, setLogs] = useState<StudyLog[]>([]);
  const [newLog, setNewLog] = useState({ subject_id: "", minutes: "", note: "" });
  const [loading, setLoading] = useState(true);

  // fetch subjects and study log when loading the page
  useEffect(() => {
    async function loadData() {
      // check if user is authenticated before making API calls
      if (!user || !session) {
        console.log('Study: No user or session', { user: !!user, session: !!session });
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log("Fetching data from backend..."); // debug log
        const [subjectList, logList] = await Promise.all([
          fetchSubjects(session.access_token), 
          fetchStudyLogs(session.access_token)
        ]);
        console.log("Data received:", { subjectList, logList }); // debug log
        setSubjects(subjectList);
        setLogs(logList);
      } catch (error) {
        console.error("Error loading data:", error); // error log
        // Set empty data on error to prevent infinite loading
        setSubjects([]);
        setLogs([]);
      } finally {
        setLoading(false); // always set loading to false
      }
    }
    loadData();
  }, [user, session]); // add dependencies for authentication state

  // add study log
  const addLog = async () => {
    console.log("🔄 Adding study log...", newLog);
    
    if (!newLog.subject_id || !newLog.minutes) {
      alert("Please select a subject and enter study time.");
      return;
    }

    // check if study time is less than 1 minute
    if (Number(newLog.minutes) < 1) {
      alert("Study sessions must be at least 1 minute long.");
      return;
    }

    // check authentication before making API call
    if (!session) {
      alert("Please log in to add study logs.");
      return;
    }

    try {
      const payload = {
        subject_id: Number(newLog.subject_id),
        duration_minutes: Number(newLog.minutes),
        notes: newLog.note || ""
      };
      
      console.log("📤 Sending payload:", payload);
      
      const res = await fetch(API_ENDPOINTS.STUDY_SESSIONS, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          'Authorization': `Bearer ${session.access_token}`  // add JWT token
        },
        body: JSON.stringify(payload)
      });
      
      console.log("📥 Response status:", res.status);
      
      if (res.ok) {
        const saved = await res.json();
        console.log("✅ Study log saved:", saved);
        setLogs(logs => [...logs, saved]);
        setNewLog({ subject_id: "", minutes: "", note: "" });
        alert("Study log saved successfully!");
      } else {
        const errorText = await res.text();
        console.error("❌ Save failed:", errorText);
        alert(`Failed to save the log: ${errorText}`);
      }
    } catch (error) {
      console.error("❌ Network error:", error);
      alert("Network error occurred. Please check your connection.");
    }
  };

  // delete study log
  const deletelog = async(logId : number) => { // receive the log ID to delete with the logId parameter
    if(!confirm("Are you sure to delete this record?")) return; // confirms the deletion

    // check authentication before making API call
    if (!session) {
      alert("Please log in to delete study logs.");
      return;
    }

    try{
      const res = await fetch(`${API_ENDPOINTS.STUDY_SESSIONS}/${logId}`, { // call the delete API
        method: "DELETE", // use the HTTP DELETE method
        headers: {
          'Authorization': `Bearer ${session.access_token}`,  // add JWT token
          'Content-Type': 'application/json'
        }
      });      if(res.ok){
        setLogs(logs => logs.filter(log => log.id !== logId)); // delete the log from UI
        alert("Study record has been deleted successfully.") // success message
      } else{
        alert("Falied to delete the study record.") // failure message
      }
    } catch (error){
      console.error("Delete error:", error); //error log
      alert("An error has occured during the deletion process.") // notify the error to the user
    }
  };



  if (loading) return <div className="p-8 text-center text-gray-400">Loading...</div>;

  return (
    <div className="py-8">
      <div className="max-w-4xl mx-auto p-4">
        {/* page title */}
        <h1 className="text-3xl font-bold mb-8 text-gray-900 text-center">📚 Study Tracker</h1>
        
        {/* study log addition card */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-700 flex items-center">
            <PlusIcon className="w-5 h-5 mr-2 text-blue-500" />
            Add Study Session
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <select
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-sm sm:text-base"
              value={newLog.subject_id}
              onChange={e => setNewLog({ ...newLog, subject_id: e.target.value })}
            >
              <option value="">Select Subject</option>
              {subjects.map(sub => (
                <option key={sub.id} value={sub.id}>{sub.name}</option>
              ))}
            </select>
            <input
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-sm sm:text-base"
              placeholder="Minutes"
              type="number"
              min="1"
              value={newLog.minutes}
              onChange={e => setNewLog({ ...newLog, minutes: e.target.value })}
            />
            <input
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-sm sm:text-base sm:col-span-2 lg:col-span-1"
              placeholder="Notes (optional)"
              value={newLog.note}
              onChange={e => setNewLog({ ...newLog, note: e.target.value })}
            />
            <button 
              className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-6 py-3 flex items-center justify-center font-medium transition-colors sm:col-span-2 lg:col-span-1"
              onClick={addLog}
            >
              <PlusIcon className="w-5 h-5 mr-2" /> Add Session
            </button>
          </div>
        </div>

        {/* study logs card */}
        {logs.length > 0 ? (
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-700 flex items-center">
              <BookOpenIcon className="w-5 h-5 mr-2 text-blue-500" />
              Study Records ({logs.length})
            </h2>
            <div className="space-y-3">
              {logs.map(log => (
                <div key={log.id} className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-semibold text-blue-800 text-lg">
                          {subjects.find(s => s.id === log.subject_id)?.name || "Unknown Subject"}
                        </span>
                        <span className="bg-blue-200 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                          {log.duration_minutes} min
                        </span>
                      </div>
                      {log.notes && (
                        <p className="text-gray-600 mb-2 italic">&ldquo;{log.notes}&rdquo;</p>
                      )}
                      <div className="text-xs text-gray-500">
                        📅 {new Date(log.created_at).toLocaleDateString()} at {new Date(log.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                      </div>
                    </div>
                    <button
                      onClick={() => deletelog(log.id)}
                      className="p-2 rounded-lg hover:bg-red-100 transition-colors ml-3"
                      title="Delete study record"
                    >
                      <TrashIcon className="w-5 h-5 text-red-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {/* total study time summary */}
            <div className="mt-4 pt-4 border-t border-blue-200">
              <div className="text-center">
                <span className="text-blue-700 font-semibold">
                  📊 Total: {logs.reduce((sum, log) => sum + log.duration_minutes, 0)} minutes today
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow p-8 text-center">
            <div className="text-gray-400 mb-4">
              <span className="text-4xl">📖</span>
            </div>
            <h3 className="text-lg font-medium text-gray-600 mb-2">No study records yet</h3>
            <p className="text-gray-500">Add your first study session above to start tracking!</p>
          </div>
        )}

        {/* explanation msg */}
        <div className="mt-8 text-center">
          <p className="text-gray-400 text-sm">
            💡 <strong>Tip:</strong> Track your study sessions to see your progress. <br />
            Consistent learning leads to great achievements!
          </p>
        </div>
      </div>
    </div>
  );
}

// Main component wrapped with authentication protection
export default function StudyPage() {
  return (
    <ProtectedRoute>
      <StudyContent />
    </ProtectedRoute>
  );
}
"use client";

import React, { useState, useEffect } from "react";
import { PlusIcon, TrashIcon, BookOpenIcon } from "@heroicons/react/24/outline";
import { API_ENDPOINTS } from "@/lib/api";

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
async function fetchSubjects() {
  try {
    console.log("🔄 Fetching subjects from backend..."); // debug log
    const controller = new AbortController(); // create timeout controller
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const res = await fetch("http://127.0.0.1:8000/subjects", {
      signal: controller.signal, // attach timeout signal
    });    clearTimeout(timeoutId); // clear timeout on success
    
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
async function fetchStudyLogs() {
  try {
    console.log("🔄 Fetching study logs from backend..."); // debug log
    const controller = new AbortController(); // create timeout controller
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const res = await fetch("http://127.0.0.1:8000/study-sessions", {
      signal: controller.signal, // attach timeout signal
    });    clearTimeout(timeoutId); // clear timeout on success
    
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

export default function StudyPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [logs, setLogs] = useState<StudyLog[]>([]);
  const [newLog, setNewLog] = useState({ subject_id: "", minutes: "", note: "" });
  const [loading, setLoading] = useState(true);

  // fetch subjects and study log when loading the page
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        console.log("Fetching data from backend..."); // debug log
        const [subjectList, logList] = await Promise.all([fetchSubjects(), fetchStudyLogs()]);
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
  }, []);

  // add study log
  const addLog = async () => {
    console.log("🔄 Adding study log...", newLog);
    
    if (!newLog.subject_id || !newLog.minutes) {
      alert("Please select a subject and enter study time.");
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
        headers: { "Content-Type": "application/json" },
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

    try{
      const res = await fetch(`http://127.0.0.1:8000/study-sessions/${logId}`, { // call the delete API
        method: "DELETE", // use the HTTP DELETE method
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

  // study gaal percentage
  const studyGoal = 180;
  const todayStudy = logs.reduce((sum, log) => sum + log.duration_minutes, 0);
  const percent = Math.round((todayStudy / studyGoal) * 100);
  const cappedPercent = Math.min(percent, 100); // limit so that the bar does not exceeds 100%

  if (loading) return <div className="p-8 text-center text-gray-400">Loading...</div>;

  return (
    <section className="max-w-3xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Today&apos;s Study</h1>
      <div className="mb-8 p-6 bg-white rounded-xl shadow flex flex-col md:flex-row items-center justify-between">
        <div>
          <div className="font-semibold text-gray-500 mb-1">Today&apos;s Study Time</div>
          <div className="text-3xl font-bold text-primary-500">
            {todayStudy} minutes <span className="text-base text-gray-400">/ {studyGoal} minutes</span>
          </div>
        </div>
        <div className="flex-1 md:ml-8 w-full">
          <div className="w-full bg-gray-200 rounded-full h-3 mb-1 mt-3 md:mt-0">
            <div 
              className="bg-primary-500 h-3 rounded-full transition-all"
              style={{width: `${cappedPercent}%`}}
            />
          </div>
          <span className="text-primary-600 font-semibold">{percent}% Achieved</span>
        </div>
      </div>

      {/* study log form */}
      <div className="mb-8 bg-white rounded-xl shadow p-6">
        <div className="flex items-center mb-3">
          <BookOpenIcon className="w-6 h-6 text-primary-500 mr-2" />
          <span className="font-semibold text-lg">Add Study Log</span>
        </div>
        <div className="flex gap-2 mb-4">
          <select
            className="w-32 px-3 py-2 border rounded"
            value={newLog.subject_id}
            onChange={e => setNewLog({ ...newLog, subject_id: e.target.value })}
          >
            <option value="">Select Subject</option>
            {subjects.map(sub => (
              <option key={sub.id} value={sub.id}>{sub.name}</option>
            ))}
          </select>
          <input
            className="w-24 px-2 py-2 border rounded"
            placeholder="Time(m)"
            type="number"
            value={newLog.minutes}
            onChange={e => setNewLog({ ...newLog, minutes: e.target.value })}
          />
          <input
            className="flex-1 px-3 py-2 border rounded"
            placeholder="Memo(optional)"
            value={newLog.note}
            onChange={e => setNewLog({ ...newLog, note: e.target.value })}
          />
          <button className="bg-primary-500 hover:bg-primary-600 text-white rounded px-3 py-2" onClick={addLog}>
            <PlusIcon className="w-5 h-5 inline" /> Submit
          </button>
        </div>
      </div>

      {/* study log list */}
      <div className="mb-8 bg-white rounded-xl shadow p-6">
        <div className="flex items-center mb-3">
          <BookOpenIcon className="w-6 h-6 text-primary-500 mr-2" />
          <span className="font-semibold text-lg">Study Records</span>
        </div>
        <ul className="space-y-2">
          {logs.map(log => (
            <li key={log.id} className="p-3 rounded bg-gray-50 shadow flex justify-between items-center">
              <div>
                <span>
                  <span className="font-bold text-primary-700">
                    {subjects.find(s => s.id === log.subject_id)?.name || "Unknown"}
                  </span> - {log.duration_minutes} minutes
                  {log.notes && <span className="ml-2 text-gray-500 text-sm">({log.notes})</span>}
                </span>
                <div className="text-xs text-gray-400 mt-1">
                  {new Date(log.created_at).toLocaleDateString()} at {new Date(log.created_at).toLocaleTimeString()}
                </div>
              </div>
              <button
                onClick = {() => deletelog(log.id)} // call the delete function when clicked
                className = "text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
                title="Delete"
              >
                <TrashIcon className = "w-5 h-5" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
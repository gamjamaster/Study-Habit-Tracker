"use client"; // declares that this is the client components

import { useState } from "react";
import Calendar from "@/components/Calendar"; // imports the calendar UI
import CalendarLegend from "@/components/CalendarLegend"; // imports the calendar legends
import ActivityHeatmap from "@/components/ActivityHeatmap"; // imports the activity heatmap

export default function CalendarPage() {
  // View mode state management (calendar or heatmap)
  const [viewMode, setViewMode] = useState<"calendar" | "heatmap">("calendar");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [activityType, setActivityType] = useState<"all" | "study" | "habit">("all");

  return (
    // wraps the entire calendar section
    <section>  
      {/* calendar title and view toggles */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
        
        {/* View mode toggle buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode("calendar")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === "calendar"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            📅 Calendar View
          </button>
          <button
            onClick={() => setViewMode("heatmap")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === "heatmap"
                ? "bg-green-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            🔥 Heatmap View
          </button>
        </div>
      </div>

      {/* Additional controls for heatmap view */}
      {viewMode === "heatmap" && (
        <div className="flex justify-between items-center mb-4">
          {/* Year selection */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Year:</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          {/* Activity type selection */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Activity Type:</label>
            <select
              value={activityType}
              onChange={(e) => setActivityType(e.target.value as "all" | "study" | "habit")}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All</option>
              <option value="study">Study</option>
              <option value="habit">Habits</option>
            </select>
          </div>
        </div>
      )}

      {/* Calendar view */}
      {viewMode === "calendar" && (
        <>
          <div className="mb-4">
            {/* legend that describes the meaning of the font colors */}
            <CalendarLegend />
          </div>
          {/* wraps the calendar with a card UI */}
          <div className="bg-white rounded-xl shadow p-6">
            {/* renders the actual calendar */}
            <Calendar />
          </div>
        </>
      )}

      {/* Heatmap view */}
      {viewMode === "heatmap" && (
        <ActivityHeatmap 
          year={selectedYear} 
          activityType={activityType}
          onActivityTypeChange={setActivityType}
        />
      )}

      {/* Guide message */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-start gap-2">
          <span className="text-blue-600 text-xl">💡</span>
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Usage Guide:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-700">
              <li><strong>Calendar View:</strong> Monthly schedule management and detailed schedule checking</li>
              <li><strong>Heatmap View:</strong> GitHub-style visualization of annual activity patterns</li>
              <li><strong>Heatmap Colors:</strong> Light gray (no activity) → Dark green (high activity)</li>
              <li><strong>Score Calculation:</strong> 0-100 points based on study time + habit completion rate</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
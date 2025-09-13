"use client";

import { useState, useEffect } from "react";

// Define heatmap data types
interface HeatmapData {
  date: string;
  value: number;
  level: number;
  study_time: number;
  habit_completion_rate: number;
  total_habits: number;
  completed_habits: number;
}

interface HeatmapSummary {
  total_days: number;
  active_days: number;
  average_score: number;
  max_score: number;
  total_study_time: number;
  total_habit_completions: number;
  activity_type: string;
}

interface HeatmapResponse {
  year: number;
  data: HeatmapData[];
  summary: HeatmapSummary;
}

interface ActivityHeatmapProps {
  year?: number;
  activityType?: "all" | "study" | "habit";
  onActivityTypeChange?: (type: "all" | "study" | "habit") => void;
}

export default function ActivityHeatmap({ 
  year = new Date().getFullYear(), 
  activityType = "all",
  onActivityTypeChange
}: ActivityHeatmapProps) {
  const [heatmapData, setHeatmapData] = useState<HeatmapResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<HeatmapData | null>(null);

  // Fetch heatmap data from API
  useEffect(() => {
    const fetchHeatmapData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `http://localhost:8000/api/activity-heatmap?year=${year}&activity_type=${activityType}`
        );
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data: HeatmapResponse = await response.json();
        setHeatmapData(data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch heatmap data:", err);
        setError("Failed to load heatmap data.");
      } finally {
        setLoading(false);
      }
    };

    fetchHeatmapData();
  }, [year, activityType]);

  // Convert date data to map for fast lookup
  const dataMap = heatmapData?.data.reduce((acc, item) => {
    acc[item.date] = item;
    return acc;
  }, {} as Record<string, HeatmapData>) || {};

  // Return CSS class based on color level
  const getLevelClass = (level: number): string => {
    const baseClass = "w-3 h-3 rounded-sm cursor-pointer transition-all duration-200 hover:scale-110";
    switch (level) {
      case 0: return `${baseClass} bg-gray-100 hover:bg-gray-200`;
      case 1: return `${baseClass} bg-green-200 hover:bg-green-300`;
      case 2: return `${baseClass} bg-green-400 hover:bg-green-500`;
      case 3: return `${baseClass} bg-green-600 hover:bg-green-700`;
      case 4: return `${baseClass} bg-green-800 hover:bg-green-900`;
      default: return `${baseClass} bg-gray-100`;
    }
  };

  // Month names array
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  // Weekday names array
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Calculate what day of the week the first day of the year is
  const getFirstDayOfYear = (year: number): number => {
    return new Date(year, 0, 1).getDay();
  };

  // Check if the year is a leap year
  const isLeapYear = (year: number): boolean => {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  };

  // Get total days in the year
  const getDaysInYear = (year: number): number => {
    return isLeapYear(year) ? 366 : 365;
  };

  // Generate heatmap grid
  const generateHeatmapGrid = () => {
    if (!heatmapData) return null;

    const firstDay = getFirstDayOfYear(year);
    const totalDays = getDaysInYear(year);

    const grid = [];
    const cellsPerRow = 53; // A year has approximately 53 weeks

    // Generate columns by week
    for (let week = 0; week < cellsPerRow; week++) {
      const weekColumn = [];
      
      for (let day = 0; day < 7; day++) {
        const cellIndex = week * 7 + day;
        const dayIndex = cellIndex - firstDay;
        
        if (dayIndex < 0 || dayIndex >= totalDays) {
          // Empty cell
          weekColumn.push(
            <div
              key={`empty-${cellIndex}`}
              className="w-3 h-3 rounded-sm bg-transparent"
            />
          );
        } else {
          // Cell with actual date
          const currentDate = new Date(year, 0, dayIndex + 1);
          const dateStr = currentDate.toISOString().split('T')[0];
          const dayData = dataMap[dateStr];
          
          weekColumn.push(
            <div
              key={dateStr}
              className={getLevelClass(dayData?.level || 0)}
              onClick={() => setSelectedDate(dayData || null)}
              title={`${dateStr}: ${dayData?.value || 0} points`}
            />
          );
        }
      }
      
      grid.push(
        <div key={week} className="flex flex-col gap-1">
          {weekColumn}
        </div>
      );
    }

    return grid;
  };

  // Loading state
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-6">
        <div className="text-red-500 text-center">
          <p className="text-lg font-semibold mb-2">Error Occurred</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">
            {year} Activity Heatmap
          </h2>
          <p className="text-sm text-gray-600">
            {heatmapData?.summary.active_days}/{heatmapData?.summary.total_days} days active
          </p>
        </div>
        
        {/* Activity type filter buttons */}
        <div className="flex gap-2">
          {["all", "study", "habit"].map((type) => (
            <button
              key={type}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                activityType === type
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              onClick={() => onActivityTypeChange?.(type as "all" | "study" | "habit")}
            >
              {type === "all" ? "All" : type === "study" ? "Study" : "Habits"}
            </button>
          ))}
        </div>
      </div>

      {/* Month labels */}
      <div className="flex gap-1 mb-2 ml-8">
        {months.map((month, index) => (
          <div
            key={month}
            className="text-xs text-gray-500 w-12 text-center"
            style={{ marginLeft: index === 0 ? '0px' : '30px' }}
          >
            {month}
          </div>
        ))}
      </div>

      {/* Heatmap grid */}
      <div className="flex gap-1">
        {/* Weekday labels */}
        <div className="flex flex-col gap-1 mr-2">
          {weekdays.map((day, index) => (
            <div
              key={day}
              className={`text-xs text-gray-500 w-6 h-3 flex items-center ${
                index % 2 === 0 ? "" : "opacity-0"
              }`}
            >
              {index % 2 === 0 ? day : ""}
            </div>
          ))}
        </div>

        {/* Heatmap cells */}
        <div className="flex gap-1 overflow-x-auto">
          {generateHeatmapGrid()}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <span>Less</span>
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className={`w-3 h-3 rounded-sm ${getLevelClass(level).split(' ').slice(-2).join(' ')}`}
              />
            ))}
          </div>
          <span>More</span>
        </div>
        
        <div className="text-xs">
          Average Score: {Math.round(heatmapData?.summary.average_score || 0)} pts
        </div>
      </div>

      {/* Selected date information */}
      {selectedDate && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-2">
            {selectedDate.date} Details
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Activity Score:</span>
              <span className="ml-2 font-medium">{selectedDate.value} pts</span>
            </div>
            <div>
              <span className="text-gray-600">Study Time:</span>
              <span className="ml-2 font-medium">{selectedDate.study_time} min</span>
            </div>
            <div>
              <span className="text-gray-600">Habits Completed:</span>
              <span className="ml-2 font-medium">
                {selectedDate.completed_habits}/{selectedDate.total_habits}
                ({Math.round(selectedDate.habit_completion_rate * 100)}%)
              </span>
            </div>
            <div>
              <span className="text-gray-600">Level:</span>
              <span className="ml-2 font-medium">{selectedDate.level}/4</span>
            </div>
          </div>
        </div>
      )}

      {/* Statistics summary */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="font-semibold text-blue-800">
            {heatmapData?.summary.total_study_time || 0} min
          </div>
          <div className="text-blue-600">Total Study Time</div>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="font-semibold text-green-800">
            {heatmapData?.summary.total_habit_completions || 0}
          </div>
          <div className="text-green-600">Total Habit Completions</div>
        </div>
        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <div className="font-semibold text-purple-800">
            {heatmapData?.summary.active_days || 0} days
          </div>
          <div className="text-purple-600">Active Days</div>
        </div>
        <div className="text-center p-3 bg-orange-50 rounded-lg">
          <div className="font-semibold text-orange-800">
            {Math.round(heatmapData?.summary.max_score || 0)} pts
          </div>
          <div className="text-orange-600">Highest Score</div>
        </div>
      </div>
    </div>
  );
}
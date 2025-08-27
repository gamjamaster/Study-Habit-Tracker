"use client"; // Declares this as a Next.js client component

import React, { useState } from "react"; // Import React and useState hook
import Calendar from "react-calendar";   // Import Calendar component from react-calendar
import "react-calendar/dist/Calendar.css"; // Import default CSS for react-calendar

// Dummy event data: key is date string (YYYY-MM-DD), value is array of events
const sampleEvents = {
  "2025-08-10": [{ type: "study", title: "Recap Algorithm" }],
  "2025-08-28": [
    { type: "habit", title: "Morning exercise" },
    { type: "study", title: "Submit the math assignment" },
  ],
  "2025-08-29": [{ type: "habit", title: "Sleep early" }],
};

// Function to render custom content inside each day cell
function tileContent({ date, view }: { date: Date; view: string }) {
  // Only show events on month view
  if (view === "month") {
    const iso = date.toISOString().slice(0, 10); // Convert date to 'YYYY-MM-DD'
    const events = sampleEvents[iso]; // Get events for this date
    if (!events) return null; // If no events, render nothing

    // Show up to 2 events, then "+N more" if there are more
    const displayEvents = events.slice(0, 2);

    return (
      <div className="flex flex-col gap-1 mt-1 min-h-[36px]">
        {displayEvents.map((ev, idx) => (
          <span
            key={idx}
            // Blue badge for study, green for habit; use max width and truncate long titles
            className={
              "block rounded-full px-2 py-0.5 text-xs font-bold truncate max-w-[80px] " +
              (ev.type === "study"
                ? "bg-blue-500/80 text-white "
                : "bg-green-500/80 text-white "
              )
            }
            title={ev.title} // Show full title on hover
          >
            {ev.title}
          </span>
        ))}
        {/* Show "+N more" if there are more than 2 events */}
        {events.length > 2 && (
          <span className="text-xs text-gray-400">+{events.length - 2} more</span>
        )}
      </div>
    );
  }
  return null; // Don't render anything for other views (week/day)
}

export default function MyCalendar() { // Function component for the calendar
  const [value, setValue] = useState(new Date()); // State: currently selected date

  return (
    <div className="flex justify-center py-8">
      {/* Center calendar and add padding, rounded corners, shadow */}
      <div className="bg-white rounded-2xl shadow p-8 max-w-xl w-full">
        <Calendar
          onChange={setValue} // Update state when a date is selected
          value={value} // Pass selected date to calendar
          tileContent={tileContent} // Render custom content in each day cell
          className="!border-0 w-full" // Remove border, full width
          calendarType="iso8601" // Start week on Monday
          locale="eng-US" // Korean localization
          prev2Label={null} // Hide previous year button
          next2Label={null} // Hide next year button
        />
      </div>
    </div>
  );
}
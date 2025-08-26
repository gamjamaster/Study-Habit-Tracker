"use client" // specifies this file is a client component

import React from "react";

// dummy data
const dummyEvents = [ 
  { date: "2025-08-26", title: "Assignment1 due date" },
  { date: "2025-08-30", title: "Test 1" },
  { date: "2025-09-02", title: "Test 2" },
]

// getting today's date
const today = new Date();
const year = today.getFullYear();
const month = today.getMonth(); // starts from 0, December == 11
const daysInMonth = new Date(year, month + 1, 0).getDate();

function getEventOnDay(day : number){
  // in yyyy-mm-dd format
  const dateStr = `${year}-${(month + 1).toString().padStart(2, "0")}-${day
  .toString()
  .padStart(2, "0")}`;
  return dummyEvents.find((e) => e.date === dateStr); 
}

export default function CalendarPage() {
  // array from 1st to 30th/31st
  const days = Array.from({length: daysInMonth}, (m, i) => i+1)

  return (
    <section className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">캘린더</h1>
      <div className="grid grid-cols-7 gap-2 bg-gray-100 p-4 rounded-lg">
        {/* days header */}
        {["Sun", "Mon", "Tues", "Wed", "Thur", "Fri", "Sat"].map((w) => (
          <div key={w} className="font-bold text-center text-gray-600">
            {w}
          </div>
        ))}
        {/* cell per day */}
        {/* setting the day for the fisrt of the month */}
        {Array.from(
          { length: new Date(year, month, 1).getDay() },
          (_, i) => (
            <div key={"empty-" + i} />
          )
        )}
        {days.map((day) => {
          const event = getEventOnDay(day);
          return (
            <div
              key={day}
              className={`relative h-16 flex flex-col items-center justify-start p-1 rounded-lg ${
                event ? "bg-blue-100 border-blue-400 border" : "bg-white"
              }`}
            >
              <span
                className={`font-semibold ${
                  day === today.getDate() ? "text-blue-600" : ""
                }`}
              >
                {day}
              </span>
              {event && (
                <span className="text-xs mt-1 px-1 py-0.5 bg-blue-500 text-white rounded">
                  {event.title}
                </span>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-4 text-gray-500 text-sm">
        Day wih a schedule is highlighted in blue.
      </div>
    </section>
  );
}
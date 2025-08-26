"use client";

import React from "react";

// dummy data
const dummyStudyLogs = [
  { subject: "Data Structure", minutes: 60, date: "2025-08-26" },
  { subject: "Algorithm", minutes: 90, date: "2025-08-26" },
  { subject: "English", minutes: 30, date: "2025-08-26" },
  { subject: "Mathematics", minutes: 80, date: "2025-08-25" },
];

// today's date string (yyyy-mm-dd)
const today = new Date();
const todayStr = `${today.getFullYear()}-${(today.getMonth() + 1)
  .toString()
  .padStart(2, "0")}-${today.getDate().toString().padStart(2, "0")}`;

// filters only today's study log
const todayLogs = dummyStudyLogs.filter((log) => log.date === todayStr);
// total study time for today
const totalMinutes = todayLogs.reduce((sum, log) => sum + log.minutes, 0);

export default function StudyPage() {
  return (
    <section className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">공부 기록</h1>

      {/* summary of today's study */}
      <div className="mb-6 p-4 bg-blue-50 rounded shadow flex justify-between items-center">
        <div>
          <div className="font-semibold">Total Study Time for Today</div>
          <div className="text-3xl">{totalMinutes}minutes</div>
        </div>
        <div className="text-blue-600 font-bold text-xl">
          {todayLogs.length} subject(s)
        </div>
      </div>

      {/* detailed list of the subject studied today */}
      <div className="mb-4">
        <div className="font-semibold mb-2">Subjects Studied Today</div>
        <ul className="space-y-2">
          {todayLogs.length === 0 ? (
            <li className="text-gray-400">There is no study record for today.</li>
          ) : (
            todayLogs.map((log, idx) => (
              <li
                key={idx}
                className="p-3 bg-white rounded shadow flex justify-between items-center"
              >
                <span className="font-medium">{log.subject}</span>
                <span className="text-blue-800 font-bold">{log.minutes}minutes</span>
              </li>
            ))
          )}
        </ul>
      </div>

      {/* view recent study details */}
      <div className="mt-8">
        <div className="font-semibold mb-2">Recent Study Details</div>
        <ul className="space-y-2">
          {dummyStudyLogs
            .filter((log) => log.date !== todayStr)
            .map((log, idx) => (
              <li
                key={idx}
                className="p-2 bg-gray-50 rounded flex justify-between items-center"
              >
                <span>
                  {log.date} - <b>{log.subject}</b>
                </span>
                <span className="text-gray-600">{log.minutes}minutes</span>
              </li>
            ))}
        </ul>
      </div>
    </section>
  );
}
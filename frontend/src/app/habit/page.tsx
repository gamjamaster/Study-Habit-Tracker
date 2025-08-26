"use client";

import React from "react";

// dummy data
const dummyHabits = [
  { name: "Exercise", done: true },
  { name: "Read a book", done: false },
  { name: "Sleep before 12am", done: true },
  { name: "Eat vegetables", done: true },
  { name: "No soda", done: false },
];

// habit achieved for today
const totalHabits = dummyHabits.length;
const doneHabits = dummyHabits.filter((h) => h.done).length;
const percent = Math.round((doneHabits / totalHabits) * 100);

export default function HabitPage() {
  return (
    <section className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Habit Checklist</h1>

      {/* summary of habit achieved today */}
      <div className="mb-6 p-4 bg-green-50 rounded shadow flex justify-between items-center">
        <div>
          <div className="font-semibold">Today's Habit Completion</div>
          <div className="text-3xl">{doneHabits} / {totalHabits}</div>
        </div>
        <div className="text-green-600 font-bold text-xl">{percent}%</div>
      </div>

      {/* today's habit checklist */}
      <div>
        <div className="font-semibold mb-2">Today's Habits</div>
        <ul className="space-y-2">
          {dummyHabits.map((habit, idx) => (
            <li
              key={idx}
              className={`p-3 rounded shadow flex items-center justify-between
                ${habit.done ? "bg-green-100 border-green-400 border" : "bg-white"}`}
            >
              <span className={`font-medium ${habit.done ? "text-green-700 line-through" : ""}`}>
                {habit.name}
              </span>
              <span
                className={`ml-2 w-6 h-6 flex items-center justify-center rounded-full text-white text-sm
                  ${habit.done ? "bg-green-500" : "bg-gray-300"}`}
              >
                {habit.done ? "✔" : ""}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 text-gray-500 text-sm">
        You can check off your daily habits here.
      </div>
    </section>
  );
}
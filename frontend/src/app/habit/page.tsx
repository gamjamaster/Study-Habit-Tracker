"use client";

import React, {useState} from "react";
import {CheckCircleIcon, PlusIcon, TrashIcon} from "@heroicons/react/24/outline";

// dummy data
const dummyHabits = [
  { id: 1, name: "Exercise", done: true },
  { id: 2, name: "Read a book", done: false },
  { id: 3, name: "Sleep before 12am", done: true },
  { id: 4, name: "Eat vegetables", done: true },
  { id: 5, name: "No soda", done: false },
];

export default function HabitPage(){
  // manage habit status
  const [habits, setHabits] = useState(dummyHabits);
  // new habit value
  const [newHabit, setNewHabit] = useState("");

  // check, uncheck
  const toggleHabits = (id: number) => {
    setHabits(habits =>
      habits.map(h => h.id === id ? {...h, done: !h.done} : h)
    );
  };

  // add habits
  const addHabit = () => {
    if(newHabit.trim())
      setHabits(habits => [
       ...habits,
       {id: Date.now(), name: newHabit, done: false}
      ]);
      setNewHabit("");
  };

  // delete habit
  const removeHabit = (id: number) => {
    setHabits(habits => habits.filter(h => h.id !== id));
  };

  // number of completions
  const done = habits.filter(h => h.done).length;
  const percent = habits.length ? Math.round((done / habits.length) * 100) : 0;

  return (
    <section className="max-w-2xl mx-auto p-8">
      {/* title */}
      <h1 className="text-3xl font-bold mb-5">Today's Habit</h1>

      {/* percentage bar + number */}
      <div className="mb-6">
        <div className="flex justify-between items-end mb-1">
          <span className="font-semibold">Percentage Accomplished</span>
          <span className="text-green-700 font-bold">{done} / {habits.length} ({percent}%)</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-green-500 h-3 rounded-full transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* adding habit form */}
      <div className="flex gap-2 mb-6">
        <input
          className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary-400"
          placeholder="Enter a new habit"
          value={newHabit}
          onChange={e => setNewHabit(e.target.value)}
          onKeyDown={e => e.key === "Enter" && addHabit()}
        />
        <button
          className="bg-primary-500 hover:bg-primary-600 text-white rounded px-3 py-2 flex items-center"
          onClick={addHabit}
        >
          <PlusIcon className="w-5 h-5 mr-1" /> Add
        </button>
      </div>

      {/* habit list */}
      <ul className="space-y-2">
        {habits.map(habit => (
          <li
            key={habit.id}
            className={`p-3 rounded shadow flex items-center justify-between
            ${habit.done ? "bg-green-50 border border-green-400" : "bg-white"}`}
          >
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={habit.done}
                onChange={() => toggleHabits(habit.id)}
                className="w-5 h-5 accent-green-500"
              />
              <span className={`font-medium text-lg ${habit.done ? "text-green-700 line-through" : ""}`}>
                {habit.name}
              </span>
            </div>
            <button
              className="p-1 rounded hover:bg-red-100"
              onClick={() => removeHabit(habit.id)}
              title="Delete"
            >
              <TrashIcon className="w-5 h-5 text-red-400" />
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-8 text-gray-400 text-sm text-center">
        Add a habit and check when achieved. <br />
        Consistency is the best routine!
      </div>
    </section>
  );
}
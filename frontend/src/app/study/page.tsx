"use client";

import React, { useState } from "react";
import { PlusIcon, TrashIcon, BookOpenIcon, CalendarIcon } from "@heroicons/react/24/outline";

// dummy data
const initialTodos = [
  {id: 1, subject: "Data Structure", task: "Recap chapter 4", done: false},
  {id: 2, subject: "Algorithm", task: "3 Time Complexity questions", done: true}
];

const initialLogs = [
  {id: 1, subject: "Data Structure", minutes: 60, note: "Stack/Queue"},
  {id: 2, subject: "Algorithm", minutes: 40, note: "Questions"}
];

const initialSchedules = [
  {id: 1, type: "assignment", subject: "Data Structure", title: "Submit a2", due: "2025-09-01"},
  {id: 2, type: "exam", subject: "English", title: "MST", due: "2025-09-10"}
];

export default function StudyPage(){
  // manage various status
  const [todos, setTodos] = useState(initialTodos); // todo list
  const [logs, setLogs] = useState(initialLogs); // study logs
  const [newTodo, setNewTodo] = useState(""); // new todo input value
  const [newLog, setNewLog] = useState({subject: "", minutes: "", note: ""}); // new study log input value

  // calculating todays study goal and percentage achieved
  const studyGoal = 180; // dummy goal
  const todayStudy = logs.reduce((sum, log) => sum + log.minutes, 0);
  const percent = Math.round((todayStudy / studyGoal) * 100);

  // add, check, delete a todo
  const addTodo = () => {
    if(newTodo.trim())
      setTodos(todos => [
       ...todos,
       { id: Date.now(), subject: "etc", task: newTodo, done: false}
      ]);
    setNewTodo("");
  };

  const toggleTodo = (id: number) => {
    setTodos(todos => todos.map(t => t.id === id ? {...t, done: !t.done} : t));
  };

  const removeTodo = (id: number) => {
    setTodos(todos => todos.filter(t => t.id !== id));
  };

  // add a study log
  const addLog = () => {
    if(newLog.subject && +newLog.minutes > 0)
      setLogs(logs => [
       ...logs,
       {id: Date.now(), subject: newLog.subject, minutes: +newLog.minutes, note: newLog.note}
      ]);
      setNewLog({subject: "", minutes: "", note: ""});
  };

  return (
    <section className="max-w-3xl mx-auto p-8">
      {/* today's study summary card */}
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Today's Study</h1>
      <div className="mb-8 p-6 bg-white rounded-xl shadow flex flex-col md:flex-row items-center justify-between">
        <div>
          <div className="font-semibold text-gray-500 mb-1">Today's Study Time</div>
          <div className="text-3xl font-bold text-primary-500">
            {todayStudy} minutes <span className="text-base text-gray-400">/ {studyGoal} minutes</span>
          </div>
        </div>
        <div className="flex-1 md:ml-8 w-full">
          <div className="w-full bg-gray-200 rounded-full h-3 mb-1 mt-3 md:mt-0">
            <div className="bg-primary-500 h-3 rounded-full transition-all" style={{ width: `${percent}%` }} />
          </div>
          <span className="text-primary-600 font-semibold">{percent}% Achieved</span>
        </div>
      </div>

      {/* today's todo list card */}
      <div className="mb-8 bg-white rounded-xl shadow p-6">
        <div className="flex items-center mb-3">
          <BookOpenIcon className="w-6 h-6 text-primary-500 mr-2" />
          <span className="font-semibold text-lg">Today's Todo List</span>
        </div>
        <div className="flex gap-2 mb-4">
          <input
            className="flex-1 px-3 py-2 border rounded"
            placeholder="Enter a thing to do. (Example: Math Assignment, Algorithm Questions)"
            value={newTodo}
            onChange={e => setNewTodo(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addTodo()}
          />
          <button className="bg-primary-500 hover:bg-primary-600 text-white rounded px-3 py-2" onClick={addTodo}>
            <PlusIcon className="w-5 h-5 inline" /> Add
          </button>
        </div>
        <ul className="space-y-2">
          {todos.map(todo => (
            <li key={todo.id}
              className={`p-3 rounded flex items-center justify-between shadow
                ${todo.done ? "bg-primary-50 border border-primary-400" : "bg-white"}`}>
              <div className="flex items-center gap-3">
                <input type="checkbox" checked={todo.done} onChange={() => toggleTodo(todo.id)} className="w-5 h-5 accent-primary-500" />
                <span className={`font-medium ${todo.done ? "text-primary-700 line-through" : ""}`}>
                  [{todo.subject}] {todo.task}
                </span>
              </div>
              <button onClick={() => removeTodo(todo.id)} className="p-1 rounded hover:bg-red-100">
                <TrashIcon className="w-5 h-5 text-red-400" />
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* study record card */}
      <div className="mb-8 bg-white rounded-xl shadow p-6">
        <div className="flex items-center mb-3">
          <BookOpenIcon className="w-6 h-6 text-primary-500 mr-2" />
          <span className="font-semibold text-lg">Study Record</span>
        </div>
        <div className="flex gap-2 mb-4">
          <input
            className="w-32 px-3 py-2 border rounded"
            placeholder="Subject"
            value={newLog.subject}
            onChange={e => setNewLog({ ...newLog, subject: e.target.value })}
          />
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
        <ul className="space-y-2">
          {logs.map(log => (
            <li key={log.id} className="p-3 rounded bg-gray-50 shadow flex justify-between items-center">
              <span>
                <span className="font-bold text-primary-700">{log.subject}</span> - {log.minutes} minutes
                {log.note && <span className="ml-2 text-gray-500 text-sm">({log.note})</span>}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* schedule card */}
      <div className="mb-8 bg-white rounded-xl shadow p-6">
        <div className="flex items-center mb-3">
          <CalendarIcon className="w-6 h-6 text-primary-500 mr-2" />
          <span className="font-semibold text-lg">Upcoming Schedule</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {initialSchedules.map(sch => (
            <div key={sch.id} className="p-4 rounded-xl shadow bg-primary-50 flex items-center gap-3">
              <span className={`px-2 py-1 rounded-full text-xs font-bold
                ${sch.type === "assignment" ? "bg-blue-100 text-primary-700" : "bg-green-100 text-green-700"}`}>
                {sch.type === "assignment" ? "Assignment" : "Exam"}
              </span>
              <div className="flex-1">
                <span className="font-semibold">{sch.subject}</span> - {sch.title}
                <div className="text-xs text-gray-500 mt-1">Until {sch.due}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* guidance text */}
      <div className="mt-8 text-gray-400 text-sm text-center">
        Make your own routine<br />
        With todo check, study schedule managemnt!
      </div>
    </section>
  );
}
"use client";
import React from "react";
import WeeklyChart from "@/components/WeeklyChart";

export default function DashboardPage() { // making DashboardPage function component
  // using dummy data for now
  // study time constants/variables
  const todayStudyMinutes = 120; // today's study time in minutes (dummy)
  const todayStudyGoal = 180; // today's study goal in minutes (dummy)
  const studyPercent = Math.round((todayStudyMinutes/todayStudyGoal)*100); // today's goal achieving percentage

  // habit constants/variables
  const todayHabitDone = 4; // nuber of habits accomplished today (dummy)
  const todayHabitTotal = 5; // number of habits to be accomplished today (dummy)
  const habitPercent = Math.round((todayHabitDone / todayHabitTotal) * 100); // habit percentage

  
  return (
    <section className = "max-w-2xl mx-auto px-4 py-8">
      <h1 className = "text-2xl font-bold mb-4">대시보드</h1>

      {/* today's study details*/}
      <div className = "mb-4 p-4 bg-blue-50 rounded shadow flex justify-between items-center">
        <div>
          <div className = "font-semibold">Study Details</div>
          <div className = "text-3xl">{todayStudyMinutes}minutes <span className = "text-base">/ {todayStudyGoal}minutes</span></div>
        </div>
        <div className = "text-blue-600 font-bold text-xl">{studyPercent}%</div>
      </div>

      {/* today's habit details*/}
      <div className = "mb-4 p-4 bg-green-50 rounded shadow flex justify-between items-center">
        <div>
          <div className = "font-semibold">Habit Details</div>
          <div className = "text-3xl">{todayHabitDone} habits <span className = "text-base">/ {todayHabitTotal}habits</span></div>
        </div>
        <div className="text-green-600 font-bold text-xl">{habitPercent}%</div>
      </div>

      {/*Chart*/}
      <div className="mt-8">
        <h2 className="font-semibold mb-2">주간 공부/습관 그래프</h2>
        <WeeklyChart />
      </div>
    </section>
  )
}
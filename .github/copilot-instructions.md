# 📚 Study & Lifestyle Habit Tracker – Integrated Development Guide

## Number 1 Rule - VERY IMPORTANT
- Do not modify the code yourself. Just show the code to me so that I can learn the codes by entering them in the codebases.

## 🎯 Project Overview
This project is a **full-stack learning + lifestyle habit management platform** that tracks both study and lifestyle habits, and provides **My Optimal Routine** through data analysis.  

- **Study habits**: record study time, manage assignments/exams, track goal achievement  
- **Lifestyle habits**: exercise, sleep, reading, diet tracking  
- **Data analysis**: correlation between study ↔ lifestyle habits, personalized routine recommendation  
- **Dashboard**: combined visualization of study + lifestyle  

---

## 🏗️ Architecture

### 1. Backend (`backend/`)
- **Framework**: Python + FastAPI  
- **DB**: SQLite (MVP) → PostgreSQL (scalable)  
- **ORM**: SQLAlchemy  
- **Structure**:
  - `main.py` → FastAPI entrypoint  
  - `database.py` → DB setup  
  - `models.py` → ORM models (Subjects, StudySessions, Habits, HabitLogs)  
  - `schemas.py` → Pydantic schemas  
  - `habit.py`, `study.py` → modular API routes  
- **Features**:
  - Habit logging API  
  - Study session logging API  
  - Dashboard statistics API  
- **Other**:
  - CORS enabled for `http://localhost:3000` (frontend dev)  
  - `create_tables()` auto-creates DB tables on startup  

### 2. Frontend (`frontend/`)
- **Framework**: Next.js (TypeScript + TailwindCSS)  
- **Structure**:
  - `src/app/` → pages  
  - `src/components/` → UI components  
- **Main pages**:
  - `dashboard` → dashboard  
  - `calendar` → schedule management  
  - `habit` → habit checklist  
  - `study` → study log  
- **Components**:
  - `Calendar.tsx`  
  - `Sidebar.tsx`  
  - `WeeklyChart.tsx`  

---

## 🚀 MVP Roadmap
1. **MVP 1**: basic logging + dashboard (habit & study tracking with visualization)  
2. **MVP 2**: data analysis + recommendations (personalized routine suggestion)  
3. **MVP 3**: social features (group comparisons, progress sharing)  

---

## 🔧 Tech Stack
- **Frontend**: Next.js, TypeScript, TailwindCSS  
- **Backend**: FastAPI, SQLAlchemy, Pydantic  
- **Database**: SQLite → PostgreSQL  
- **Analytics**: pandas, scikit-learn  
- **Visualization**: Chart.js / Plotly.js (frontend), matplotlib (backend)  
- **Deployment**: Vercel (frontend), Render/Heroku (backend)  

---

## 📂 Suggested Folder Structure

```
study-habit-tracker/
│
├── backend/
│   ├── main.py
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   ├── routers/
│   │   ├── habit.py
│   │   ├── study.py
│   │   └── dashboard.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── habit/page.tsx
│   │   │   ├── study/page.tsx
│   │   │   └── calendar/page.tsx
│   │   ├── components/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Calendar.tsx
│   │   │   └── WeeklyChart.tsx
│   │   └── lib/
│   ├── package.json
│   └── tsconfig.json
```

---

## 🌐 API Design (Example)

### Habit Management
- `POST /habits/` → create new habit  
- `GET /habits/` → get habit list  
- `POST /habits/{habit_id}/log` → log habit activity  

### Study Management
- `POST /study/` → log study session  
- `GET /study/` → get study logs  

### Dashboard
- `GET /dashboard/summary` → weekly/monthly summary  
- `GET /dashboard/correlation` → correlation analysis results  

---

## 🖥️ Frontend Component Example

### `HabitChecklist.tsx`
```tsx
"use client";
import { useState } from "react";

export default function HabitChecklist() {
  const [habits, setHabits] = useState([
    { id: 1, name: "Exercise", done: false },
    { id: 2, name: "Reading", done: false },
    { id: 3, name: "8 hours sleep", done: false },
  ]);

  const toggleHabit = (id: number) => {
    setHabits(
      habits.map((h) =>
        h.id === id ? { ...h, done: !h.done } : h
      )
    );
  };

  return (
    <div className="p-4 bg-white rounded-2xl shadow-md">
      <h2 className="text-xl font-bold mb-3">Today's Habits</h2>
      <ul>
        {habits.map((habit) => (
          <li key={habit.id} className="flex items-center mb-2">
            <input
              type="checkbox"
              checked={habit.done}
              onChange={() => toggleHabit(habit.id)}
              className="mr-2"
            />
            {habit.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### Code Explanation
1. `useState` hook stores the habit list (`id`, `name`, `done`)  
2. `toggleHabit` toggles the `done` state for a habit  
3. `map()` renders each habit as an `<li>`  
4. TailwindCSS styles the checklist as a card UI  

---

## ✅ Best Practices
1. **Modularity**: separate API routes and UI components by feature  
2. **Type safety**: use TypeScript consistently  
3. **DB migration**: use Alembic for FastAPI + SQLAlchemy migrations  
4. **Extensibility**: start with SQLite, migrate to PostgreSQL later  
5. **Comments & documentation**: write detailed comments for learning purposes  

---

## ⚠️ Extra Rule
- Always answer **in Korean**  
- When providing code, always include **line-by-line explanations** for easy understanding  
- 내 질문에 대답할땐 항상 관련 코드 베이스들을 한줄 한줄 확인해
"use client";
import { useState } from "react";

// Type for the goal creation form
interface GoalForm {
  goal_type: string;
  target_value: number;
  target_unit: string;
  period: string;
  description?: string;
}

// Options for goal type
const goalTypeOptions = [
  { value: "daily_study", label: "Daily Study Time" },
  { value: "weekly_study", label: "Weekly Study Time" },
  { value: "monthly_study", label: "Monthly Study Time" },
  { value: "daily_habit", label: "Daily Habit Completion" },
  { value: "weekly_habit", label: "Weekly Habit Completion" },
];

// Options for unit
const unitOptions = [
  { value: "minutes", label: "Minutes" },
  { value: "sessions", label: "Sessions" },
  { value: "habits", label: "Habits" },
];

// Options for period
const periodOptions = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

export default function GoalSettingPage() {
  // State for form data
  const [form, setForm] = useState<GoalForm>({
    goal_type: "daily_study",
    target_value: 60,
    target_unit: "minutes",
    period: "daily",
    description: "",
  });
  // State for loading and message
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      // Call backend API to create a goal
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setMessage("Goal successfully created!");
      } else {
        setMessage("Failed to create goal.");
      }
    } catch {
      setMessage("Server error occurred.");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow mt-8">
      <h2 className="text-2xl font-bold mb-6">Goal Setting</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Goal Type Selection */}
        <div>
          <label className="block font-medium mb-1">Goal Type</label>
          <select
            name="goal_type"
            value={form.goal_type}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          >
            {goalTypeOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        {/* Target Value Input */}
        <div>
          <label className="block font-medium mb-1">Target Value</label>
          <input
            type="number"
            name="target_value"
            value={form.target_value}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            min={1}
          />
        </div>
        {/* Unit Selection */}
        <div>
          <label className="block font-medium mb-1">Unit</label>
          <select
            name="target_unit"
            value={form.target_unit}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          >
            {unitOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        {/* Period Selection */}
        <div>
          <label className="block font-medium mb-1">Period</label>
          <select
            name="period"
            value={form.period}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          >
            {periodOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        {/* Description Input (optional) */}
        <div>
          <label className="block font-medium mb-1">Description (optional)</label>
          <input
            type="text"
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded font-semibold"
          disabled={loading}
        >
          {loading ? "Submitting..." : "Create Goal"}
        </button>
        {/* Message Display */}
        {message && <p className="mt-2 text-center text-green-600">{message}</p>}
      </form>
    </div>
  );
}
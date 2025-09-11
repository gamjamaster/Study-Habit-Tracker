"use client";

import { useState } from "react";

// component for subject creation form
export default function SubjectForm({ onCreated }) {
  const [name, setName] = useState("");
  const [color, setColor] = useState("#FFB300");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // form submit function
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://127.0.0.1:8000/subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, color }),
      });
      if (!res.ok) throw new Error("Failed to create a new subject");
      const data = await res.json();
      onCreated && onCreated(data);
      setName("");
      setColor("#FFB300");
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white rounded-xl shadow mb-4">
      <h2 className="font-bold mb-2">Add new subject</h2>
      <input
        type="text"
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Subject Name"
        className="border px-2 py-1 mr-2"
        required
      />
      <input
        type="color"
        value={color}
        onChange={e => setColor(e.target.value)}
        className="mr-2"
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-500 text-white px-3 py-1 rounded"
      >
        {loading ? "Creating..." : "Create Subject"}
      </button>
      {error && <div className="text-red-500 mt-2">{error}</div>}
    </form>
  );
}
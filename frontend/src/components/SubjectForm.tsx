"use client";

import { useState, useEffect } from "react";

type SubjectFormProps = {
  onCreated?: (data: { id: number; name: string; color: string; created_at: string }) => void;
  onUpdated?: (data: { id: number; name: string; color: string; created_at: string }) => void;
  editSubject?: { id: number; name: string; color: string; created_at: string } | null;
  onCancel?: () => void;
};

// component for subject creation and editing form
export default function SubjectForm({ onCreated, onUpdated, editSubject, onCancel }: SubjectFormProps) {
  const [name, setName] = useState("");
  const [color, setColor] = useState("#FFB300");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Effect to populate form when editing
  useEffect(() => {
    if (editSubject) {
      setName(editSubject.name);
      setColor(editSubject.color);
    } else {
      setName("");
      setColor("#FFB300");
    }
  }, [editSubject]);

  // form submit function
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (editSubject) {
        // Update existing subject
        const res = await fetch(`http://127.0.0.1:8000/subjects/${editSubject.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, color }),
        });
        if (!res.ok) throw new Error("Failed to update subject");
        const data = await res.json();
        if (onUpdated) {
          onUpdated(data);
        }
      } else {
        // Create new subject
        const res = await fetch("http://127.0.0.1:8000/subjects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, color }),
        });
        if (!res.ok) throw new Error("Failed to create a new subject");
        const data = await res.json();
        if (onCreated) {
          onCreated(data);
        }
      }

      // Reset form after successful operation
      if (!editSubject) {
        setName("");
        setColor("#FFB300");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white rounded-xl shadow mb-4">
      <h2 className="font-bold mb-2">{editSubject ? "Edit Subject" : "Add new subject"}</h2>
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
        className="bg-blue-500 text-white px-3 py-1 rounded mr-2"
      >
        {loading ? (editSubject ? "Updating..." : "Creating...") : (editSubject ? "Update Subject" : "Create Subject")}
      </button>
      {editSubject && onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-500 text-white px-3 py-1 rounded"
        >
          Cancel
        </button>
      )}
      {error && <div className="text-red-500 mt-2">{error}</div>}
    </form>
  );
}
"use client"; // declares that this is the client components

import Calendar from "@/components/Calendar"; // imports the calendar UI
import CalendarLegend from "@/components/CalendarLegend"; // imports the calendar legends

export default function CalendarPage() {
  return (
    // wraps the entire calendar section
    <section>  
      {/* calendar title */}
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Calendar</h1>
      <div className="mb-4">
        {/* legend that describes the meaning of the font colors */}
        <CalendarLegend />
      </div>
      {/* wraps the calendar with a card UI */}
      <div className="bg-white rounded-xl shadow p-6">
        {/* renders the actual calendar */}
        <Calendar />
      </div>
    </section>
  );
}
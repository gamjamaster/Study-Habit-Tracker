export default function CalendarLegend() { // export CalendarLegend by default
  return (
    // Css of the legends
    <div className="flex gap-4 items-center text-sm text-gray-600">
      <span className="flex items-center gap-1">
        <span className="inline-block w-3 h-3 rounded-full bg-primary-500" />
        Study
      </span>
      <span className="flex items-center gap-1">
        <span className="inline-block w-3 h-3 rounded-full bg-green-500" />
        Habit
      </span>
    </div>
  );
}
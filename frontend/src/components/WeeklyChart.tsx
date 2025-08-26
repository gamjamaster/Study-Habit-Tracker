import { Bar } from "react-chartjs-2";
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const data = {
  labels: ["Mon", "Tues", "Wed", "Thur", "Fri", "Sat", "Sun"],
  datasets: [
    {
      label: "Study Time(minutes)",
      data: [60, 80, 45, 120, 90, 30, 100], // dummy data
      backgroundColor: "rgba(59,130,246,0.5)",
      borderRadius: 6,
    },
    {
      label: "Habit Achieved (Number)",
      data: [3, 4, 2, 5, 5, 2, 4], // dummy data
      backgroundColor: "rgba(16,185,129,0.5)",
      borderRadius: 6,
    },
  ],
};

const options = {
  responsive: true,
  plugins: {
    legend: {
      position: "top" as const,
    },
    title: {
      display: false,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        stepSize: 20,
      },
    },
  },
};

export default function WeeklyChart() {
  return (
    <div className="bg-white rounded shadow p-4">
      <Bar data={data} options={options} />
    </div>
  );
}
import { Bar } from "react-chartjs-2";
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { useState, useEffect } from "react";
import { API_ENDPOINTS } from "@/lib/api";

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// add data state to WeeklyChart component
export default function WeeklyChart() {
  const [chartData, setChartData] = useState(null); // chart data state
  const [loading, setLoading] = useState(true); // loading state

  // load the data when mounting the component
  useEffect(() =>{
    fetchWeeklyData();
  }, []);

  // function to load the weekly data from backend
  const fetchWeeklyData = async() => {
    try{
  const response = await fetch(API_ENDPOINTS.DASHBOARD_WEEKLY);
      if(!response.ok) throw new Error("Failed to fetch weekly data");

      const data = await response.json();

      // convert the data into Chart.js format
      setChartData({
        labels: data.labels,
        datasets: [
          {
            label: "Study Time(minutes)",
            data: data.study_data,
            backgroundColor: "rgba(59,130,246,0.5)",
            borderRadius: 6,
          },
          {
            label: "Habit Achieved (Number)",
            data: data.habit_data,
            backgroundColor: "rgba(16,185,129,0.5)",
            borderRadius: 6,
          },
        ],
      });
    } catch(error){
      console.error("Error fetching weekly data:", error);

      // use dummy data when an error occurs
      setChartData({
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [
          {
            label: "Study Time(minutes)",
            data: [0,0,0,0,0,0,0],
            backgroundColor: "rgba(59,130,246,0.5)",
            borderRadius: 6,
          },
          {
            label: "Habit Achieved (Number)",
            data: [0,0,0,0,0,0,0],
            backgroundColor: "rgba(16,185,129,0.5)",
            borderRadius: 6,
          },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  // displat when loading
  if(loading){
    return <div className = "bg-white rounded shadow p-4 flex items-center justify-center h-64">
      Loading chart data...
      </div>;
  }

  // chart rendering
  return(
    <div className = "bg-white rounded shadow p-4">
      <Bar data = {chartData} options = {options} />
      </div>
  );
}

// set chart options
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
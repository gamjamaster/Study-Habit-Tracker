import { Bar } from "react-chartjs-2";
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartData } from "chart.js";
import { useState, useEffect, useCallback } from "react";
import { API_ENDPOINTS } from "@/lib/api";

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Props interface for JWT token
interface WeeklyChartProps {
  token?: string;
}

// Chart data type
type ChartDataType = ChartData<"bar", number[], string>;

// add data state to WeeklyChart component
export default function WeeklyChart({ token }: WeeklyChartProps) {
  const [chartData, setChartData] = useState<ChartDataType | null>(null); // chart data state
  const [loading, setLoading] = useState(true); // loading state

  // function to load the weekly data from backend
  const fetchWeeklyData = useCallback(async() => {
    if (!token) {
      console.log('WeeklyChart: No token provided');
      return;
    }

    try{
      const response = await fetch(API_ENDPOINTS.DASHBOARD_WEEKLY, {
        headers: {
          'Authorization': `Bearer ${token}`,  // add JWT token
          'Content-Type': 'application/json'
        }
      });
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
  }, [token]);

  // load the data when mounting the component
  useEffect(() =>{
    if (token) {
      fetchWeeklyData();
    }
  }, [token, fetchWeeklyData]);

  // displat when loading
  if(loading){
    return <div className = "bg-white rounded shadow p-4 flex items-center justify-center h-64">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>;
  }

  // chart rendering
  return(
    <div className = "bg-white rounded shadow p-4">
      {chartData && <Bar data = {chartData} options = {options} />}
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
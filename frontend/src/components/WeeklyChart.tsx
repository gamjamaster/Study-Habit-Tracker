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

  // Format minutes to hours and minutes for tooltip
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  // function to load the weekly data from backend
  const fetchWeeklyData = useCallback(async() => {
    if (!token) {
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
            label: "Study Time",
            data: data.study_data,
            backgroundColor: "rgba(75,85,99,0.5)",
            borderRadius: 6,
          },
          {
            label: "Habit Achieved (Number)",
            data: data.habit_data,
            backgroundColor: "rgba(107,114,128,0.5)",
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
            label: "Study Time",
            data: [0,0,0,0,0,0,0],
            backgroundColor: "rgba(75,85,99,0.5)",
            borderRadius: 6,
          },
          {
            label: "Habit Achieved (Number)",
            data: [0,0,0,0,0,0,0],
            backgroundColor: "rgba(107,114,128,0.5)",
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-700 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>;
  }

  // chart rendering
  return(
    <div className = "bg-white rounded shadow p-4">
      {chartData && <Bar data = {chartData} options = {getChartOptions(formatTime)} />}
      </div>
  );
}

// set chart options with custom tooltip
const getChartOptions = (formatTime: (minutes: number) => string) => ({
  responsive: true,
  plugins: {
    legend: {
      position: "top" as const,
    },
    title: {
      display: false,
    },
    tooltip: {
      callbacks: {
        label: function(context: { dataset: { label?: string }, parsed: { y: number } }) {
          let label = context.dataset.label || '';
          
          if (label) {
            label += ': ';
          }
          
          // Format study time as hours and minutes
          if (context.dataset.label === 'Study Time') {
            label += formatTime(context.parsed.y);
          } else {
            // For habit count, just show the number
            label += context.parsed.y;
          }
          
          return label;
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        stepSize: 20,
        callback: function(value: number | string) {
          // Show y-axis labels as hours for study time
          if (typeof value === 'number') {
            const hours = Math.floor(value / 60);
            const mins = value % 60;
            if (hours > 0 && mins > 0) {
              return `${hours}h ${mins}m`;
            } else if (hours > 0) {
              return `${hours}h`;
            } else {
              return `${mins}m`;
            }
          }
          return value;
        }
      },
    },
  },
});
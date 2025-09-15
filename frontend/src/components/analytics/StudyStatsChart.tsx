"use client";

import React from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TooltipItem
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface StudyStatsProps {
  data: {
    daily_stats: Array<{
      date: string;
      total_minutes: number;
      session_count: number;
    }>;
    subject_stats: Array<{
      subject: string;
      color: string;
      total_minutes: number;
      session_count: number;
    }>;
  };
}

export default function StudyStatsChart({ data }: StudyStatsProps) {
  const dailyChartData = {
    labels: data.daily_stats.map(item => 
      new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    ),
    datasets: [
      {
        label: 'Study Minutes',
        data: data.daily_stats.map(item => item.total_minutes),
        borderColor: 'rgba(110, 8, 76, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.3,
      }
    ]
  };

  const subjectChartData = {
    labels: data.subject_stats.map(item => item.subject),
    datasets: [
      {
        label: 'Study Minutes by Subject',
        data: data.subject_stats.map(item => item.total_minutes),
        backgroundColor: data.subject_stats.map(item => item.color || '#0b244dff'),
        borderWidth: 0,
        borderRadius: 4,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        }
      },
      x: {
        grid: {
          display: false,
        }
      }
    },
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context: TooltipItem<'bar'>) {
            return `${context.parsed.y} minutes`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        }
      },
      x: {
        grid: {
          display: false,
        }
      }
    },
  };

  if (data.daily_stats.length === 0 && data.subject_stats.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <p>No study data available for the selected period.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {data.daily_stats.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 text-gray-700">Daily Study Time Trend</h3>
          <div style={{ height: '300px' }}>
            <Line data={dailyChartData} options={chartOptions} />
          </div>
        </div>
      )}
      
      {data.subject_stats.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 text-gray-700">Study Time by Subject</h3>
          <div style={{ height: '300px' }}>
            <Bar data={subjectChartData} options={barOptions} />
          </div>
        </div>
      )}
    </div>
  );
}
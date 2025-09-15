"use client";

import React from 'react';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, TooltipItem } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

interface HabitCompletionProps {
  data: {
    daily_completion: Array<{
      date: string;
      completed_habits: number;
      completion_rate: number;
    }>;
    weekday_completion: Array<{
      weekday: number;
      weekday_name: string;
      completion_count: number;
    }>;
    habit_stats: Array<{
      habit_name: string;
      completion_count: number;
    }>;
  };
}

export default function HabitCompletionChart({ data }: HabitCompletionProps) {
  const weekdayData = {
    labels: data.weekday_completion
      .sort((a, b) => a.weekday - b.weekday)
      .map(item => item.weekday_name.slice(0, 3)),
    datasets: [
      {
        label: 'Completions by Weekday',
        data: data.weekday_completion
          .sort((a, b) => a.weekday - b.weekday)
          .map(item => item.completion_count),
        backgroundColor: [
          '#033625ff', '#361904ff', '#eab20841', '#033315ff', 
          '#3B82F6', '#8B5CF6', '#ec489a57'
        ],
        borderWidth: 2,
        borderColor: '#fff',
      }
    ]
  };

  const habitData = {
    labels: data.habit_stats.map(item => item.habit_name),
    datasets: [
      {
        label: 'Completion Count',
        data: data.habit_stats.map(item => item.completion_count),
        backgroundColor: 'rgba(43, 7, 71, 0.8)',
        borderColor: 'rgba(18, 6, 88, 1)',
        borderWidth: 1,
        borderRadius: 4,
      }
    ]
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: TooltipItem<'doughnut'>) {
            return `${context.label}: ${context.parsed} completions`;
          }
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
            return `${context.parsed.y} completions`;
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

  if (data.weekday_completion.length === 0 && data.habit_stats.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <p>No habit data available for the selected period.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {data.weekday_completion.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 text-gray-700">Completion by Weekday</h3>
          <div style={{ height: '300px' }}>
            <Doughnut data={weekdayData} options={doughnutOptions} />
          </div>
        </div>
      )}
      
      {data.habit_stats.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 text-gray-700">Habit Performance</h3>
          <div style={{ height: '300px' }}>
            <Bar data={habitData} options={barOptions} />
          </div>
        </div>
      )}
    </div>
  );
}
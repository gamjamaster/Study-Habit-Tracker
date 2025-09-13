"use client";

import React from 'react';
import { Scatter } from 'react-chartjs-2';
import { Chart as ChartJS, LinearScale, PointElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(LinearScale, PointElement, Tooltip, Legend);

interface CorrelationProps {
  data: {
    correlation_data: Array<{
      date: string;
      study_minutes: number;
      habit_count: number;
    }>;
  };
}

export default function CorrelationChart({ data }: CorrelationProps) {
  const scatterData = {
    datasets: [
      {
        label: 'Study Minutes vs Habits Completed',
        data: data.correlation_data.map(item => ({
          x: item.study_minutes,
          y: item.habit_count
        })),
        backgroundColor: 'rgba(139, 92, 246, 0.6)',
        borderColor: 'rgb(139, 92, 246)',
        pointRadius: 8,
        pointHoverRadius: 10,
        pointBorderWidth: 2,
        pointBorderColor: '#fff',
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `Study: ${context.parsed.x} min, Habits: ${context.parsed.y}`;
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Study Minutes',
          font: {
            size: 14,
            weight: 'bold' as const,
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        }
      },
      y: {
        title: {
          display: true,
          text: 'Habits Completed',
          font: {
            size: 14,
            weight: 'bold' as const,
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        }
      }
    }
  };

  // Calculate correlation coefficient
  const calculateCorrelation = () => {
    const validData = data.correlation_data.filter(item => 
      item.study_minutes > 0 && item.habit_count > 0
    );
    
    if (validData.length < 2) return 0;
    
    const n = validData.length;
    const sumX = validData.reduce((sum, item) => sum + item.study_minutes, 0);
    const sumY = validData.reduce((sum, item) => sum + item.habit_count, 0);
    const sumXY = validData.reduce((sum, item) => sum + (item.study_minutes * item.habit_count), 0);
    const sumXX = validData.reduce((sum, item) => sum + (item.study_minutes * item.study_minutes), 0);
    const sumYY = validData.reduce((sum, item) => sum + (item.habit_count * item.habit_count), 0);
    
    const numerator = (n * sumXY) - (sumX * sumY);
    const denominator = Math.sqrt(((n * sumXX) - (sumX * sumX)) * ((n * sumYY) - (sumY * sumY)));
    
    return denominator === 0 ? 0 : numerator / denominator;
  };

  const correlation = calculateCorrelation();
  const correlationText = correlation > 0.7 ? 'Strong Positive' : 
                         correlation > 0.3 ? 'Moderate Positive' : 
                         correlation > -0.3 ? 'Weak' : 
                         correlation > -0.7 ? 'Moderate Negative' : 'Strong Negative';

  if (data.correlation_data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <p>No correlation data available.</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ height: '400px' }}>
        <Scatter data={scatterData} options={options} />
      </div>
      
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-purple-50 rounded-lg">
          <h4 className="font-semibold text-purple-700 mb-2">Correlation Coefficient</h4>
          <p className="text-2xl font-bold text-purple-800">
            {correlation.toFixed(3)}
          </p>
          <p className="text-sm text-purple-600 mt-1">
            {correlationText} Correlation
          </p>
        </div>
        
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-gray-700 mb-2">Interpretation</h4>
          <p className="text-sm text-gray-600">
            {correlation > 0.3 
              ? "There's a positive relationship between study time and habit completion. More study time tends to correlate with better habit consistency."
              : correlation < -0.3 
              ? "There's a negative relationship - longer study sessions might be affecting habit completion."
              : "The relationship between study time and habit completion is weak or inconsistent."
            }
          </p>
        </div>
      </div>
    </div>
  );
}
'use client';

import { useState, useEffect, useRef } from 'react';
import { PlayIcon, PauseIcon, StopIcon, ClockIcon } from '@heroicons/react/24/solid';

interface Subject {
  id: number;
  name: string;
}

export default function Timer() {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [saving, setSaving] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch subjects
  useEffect(() => {
    fetchSubjects();
  }, []);

  // Prevent page scrolling while on the timer page
  useEffect(() => {
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
    };
  }, []);

  // Timer logic
  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        setTime(prevTime => prevTime + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isPaused]);

  const fetchSubjects = async () => {
    try {
      const response = await fetch('http://localhost:8000/subjects/');
      if (response.ok) {
        const data = await response.json();
        setSubjects(data);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const startTimer = () => {
    if (!selectedSubject) {
      alert('Please select a subject first!');
      return;
    }
    setIsRunning(true);
    setIsPaused(false);
  };

  const pauseTimer = () => {
    setIsPaused(true);
  };

  const resumeTimer = () => {
    setIsPaused(false);
  };

  const stopTimer = () => {
    setIsRunning(false);
    setIsPaused(false);
  };

  const saveSession = async () => {
    if (!selectedSubject || time === 0) {
      alert('Please select a subject and have a valid session!');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('http://localhost:8000/study-sessions/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject_id: parseInt(selectedSubject),
          duration: time,
        }),
      });

      if (response.ok) {
        alert('Study session saved successfully!');
        setTime(0);
        setSelectedSubject('');
      } else {
        alert('Failed to save session');
      }
    } catch (error) {
      console.error('Error saving session:', error);
      alert('Error saving session');
    } finally {
      setSaving(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 left-60 bg-black flex flex-col items-center justify-center overflow-hidden">
      {/* Main Timer Circle */}
      <div className="relative mb-2">
        {/* Outer Ring */}
        <div className="w-[220px] h-[220px] rounded-full border-[3px] border-gray-700 bg-gradient-to-br from-gray-900 to-black shadow-xl relative">
          
          {/* Time Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-2xl font-mono font-light text-white mb-2 tracking-wider">
              {formatTime(time)}
            </div>
            
            {/* Status Indicator */}
            <div className="flex items-center space-x-2">
              <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                isRunning && !isPaused
                  ? 'bg-gray-200 animate-pulse shadow'
                  : isPaused
                  ? 'bg-gray-400 shadow'
                  : 'bg-gray-600'
              }`}></div>
              <span className="text-gray-400 text-xs font-medium">
                {isRunning ? (isPaused ? "PAUSED" : "RUNNING") : "READY"}
              </span>
            </div>
          </div>

          {/* Minute Markers */}
      {[...Array(60)].map((_, i) => (
            <div
              key={i}
              className={`absolute rounded-full ${
        i % 5 === 0 ? 'w-0.5 h-3 bg-white' : 'w-0.5 h-1.5 bg-gray-500'
              }`}
              style={{
                left: '50%',
                top: '50%',
        transform: `translate(-50%, -50%) rotate(${i * 6}deg) translateY(-105px)`,
        transformOrigin: '50% 105px'
              }}
            />
          ))}

          {/* Numbers */}
          {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((num, i) => (
            <div
              key={num}
              className="absolute text-white font-bold text-sm"
              style={{
                left: '50%',
                top: '50%',
                transform: `translate(-50%, -50%) rotate(${i * 30}deg) translateY(-90px) rotate(${-i * 30}deg)`,
                transformOrigin: '50% 90px'
              }}
            >
              {num}
            </div>
          ))}

          {/* Progress Ring */}
          <div className="absolute inset-0 rounded-full">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 220 220">
              <circle
                cx="110"
                cy="110"
                r="106"
                fill="none"
                stroke="rgba(75, 85, 99, 0.3)"
                strokeWidth="3"
              />
              <circle
                cx="110"
                cy="110"
                r="106"
                fill="none"
                stroke={isRunning && !isPaused ? "#e5e7eb" : isPaused ? "#9ca3af" : "rgba(75, 85, 99, 0.6)"}
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 106}`}
                strokeDashoffset={`${2 * Math.PI * 106 * (1 - (time % 60) / 60)}`}
                className="transition-all duration-1000 ease-in-out"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Controls Section */}
  <div className="flex flex-col items-center space-y-2">
        {/* Subject Selection */}
        <div className="relative">
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
    className="bg-gray-900 border-2 border-gray-700 rounded-xl px-4 py-2 text-white text-sm font-medium appearance-none cursor-pointer hover:border-gray-600 focus:border-white focus:outline-none transition-all duration-300 min-w-[240px] text-center"
            disabled={isRunning}
          >
            <option value="" className="bg-gray-900">Select Subject</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id.toString()} className="bg-gray-900">
                {subject.name}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Control Buttons */}
    <div className="flex flex-wrap justify-center gap-2">
          {!isRunning ? (
            <button
              onClick={startTimer}
      className="group flex items-center px-6 py-2 bg-white text-black rounded-full font-bold text-sm transition-all duration-300 hover:bg-gray-200 hover:scale-105 shadow-lg hover:shadow-xl"
            >
      <PlayIcon className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
              START
            </button>
          ) : (
            <>
              {isPaused ? (
                <button
                  onClick={resumeTimer}
      className="group flex items-center px-6 py-2 bg-white text-black rounded-full font-bold text-sm transition-all duration-300 hover:bg-gray-200 hover:scale-105 shadow-lg hover:shadow-xl"
                >
      <PlayIcon className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                  RESUME
                </button>
              ) : (
                <button
                  onClick={pauseTimer}
      className="group flex items-center px-6 py-2 bg-gray-800 text-white rounded-full font-bold text-sm transition-all duration-300 hover:bg-gray-700 hover:scale-105 shadow-lg hover:shadow-xl border-2 border-gray-600"
                >
      <PauseIcon className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                  PAUSE
                </button>
              )}
              <button
                onClick={stopTimer}
        className="group flex items-center px-6 py-2 bg-gray-800 text-white rounded-full font-bold text-sm transition-all duration-300 hover:bg-gray-700 hover:scale-105 shadow-lg hover:shadow-xl border-2 border-gray-600"
              >
        <StopIcon className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                STOP
              </button>
            </>
          )}

          {/* Save Button */}
          {time > 0 && !isRunning && (
            <button
              onClick={saveSession}
              disabled={saving}
              className="group flex items-center px-6 py-2 bg-gray-900 text-white rounded-full font-bold text-sm transition-all duration-300 hover:bg-gray-800 hover:scale-105 shadow-lg hover:shadow-xl border-2 border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <ClockIcon className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" />
              {saving ? "SAVING..." : "SAVE"}
            </button>
          )}
        </div>

  {/* Notes section removed as requested */}
      </div>
    </div>
  );
}

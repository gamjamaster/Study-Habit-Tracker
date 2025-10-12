'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { PlayIcon, PauseIcon, StopIcon, ClockIcon } from '@heroicons/react/24/solid';
import { API_ENDPOINTS } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

interface Subject {
  id: number;
  name: string;
}

function TimerContent() {
  const { session } = useAuth();
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [saving, setSaving] = useState(false);
  const [isStopping, setIsStopping] = useState(false); // Prevent double-click on Stop
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load timer state from localStorage on component mount
  useEffect(() => {
    const savedTimerState = localStorage.getItem('timerState');
    if (savedTimerState) {
      try {
        const { time: savedTime, isRunning: savedIsRunning, isPaused: savedIsPaused, selectedSubject: savedSubject } = JSON.parse(savedTimerState);
        setTime(savedTime || 0);
        setIsRunning(savedIsRunning || false);
        setIsPaused(savedIsPaused || false);
        setSelectedSubject(savedSubject || '');
      } catch (error) {
        console.error('Error loading timer state from localStorage:', error);
      }
    }
  }, []);

  // Save timer state to localStorage whenever it changes
  useEffect(() => {
    const timerState = {
      time,
      isRunning,
      isPaused,
      selectedSubject
    };
    localStorage.setItem('timerState', JSON.stringify(timerState));
  }, [time, isRunning, isPaused, selectedSubject]);

  // Define fetchSubjects function
  const fetchSubjects = useCallback(async () => {
    if (!session?.access_token) return;

    try {
      const response = await fetch(API_ENDPOINTS.SUBJECTS, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setSubjects(data);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  }, [session]);

  // Fetch subjects
  useEffect(() => {
    if (session?.access_token) {
      fetchSubjects();
    }
  }, [session, fetchSubjects]);  // Prevent page scrolling while on the timer page
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

  const stopTimer = async () => {
    if (isStopping) return; // Prevent double-click

    setIsStopping(true);
    try {
      // Automatically save session if it's longer than 1 minute and subject is selected
      if (time >= 60 && selectedSubject) {
        if (!session) {
          alert('Please log in to save your session.');
          return;
        }

        const response = await fetch(API_ENDPOINTS.STUDY_SESSIONS, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            subject_id: parseInt(selectedSubject),
            duration_minutes: Math.floor(time / 60), // 초를 분으로 변환
          }),
        });

        if (response.ok) {
          // Show success message for automatic save
          alert(`Study session automatically saved! (${Math.floor(time / 60)} minutes)`);
        } else {
          const errorData = await response.json();
          console.error('Server error:', errorData);
          alert('Failed to save session automatically: ' + (errorData.detail || 'Unknown error'));
        }
      }

      // Reset timer state
      setIsRunning(false);
      setIsPaused(false);
      setTime(0);
      setSelectedSubject('');
      // Clear timer state from localStorage when stopped
      localStorage.removeItem('timerState');
    } catch (error) {
      console.error('Error in stopTimer:', error);
      alert('Error stopping timer: Network error');
    } finally {
      setIsStopping(false);
    }
  };

  const saveSession = async () => {
    if (!selectedSubject || time === 0) {
      alert('Please select a subject and have a valid session!');
      return;
    }

    if (Math.floor(time / 60) < 1) {
      alert("Study sessions must be at least 1 minute long.");
      return;
    }

    if (!session?.access_token) {
      alert('Authentication required. Please log in.');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(API_ENDPOINTS.STUDY_SESSIONS, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subject_id: parseInt(selectedSubject),
          duration_minutes: Math.floor(time / 60), // 초를 분으로 변환
        }),
      });

      if (response.ok) {
        alert('Study session saved successfully!');
        setTime(0);
        setSelectedSubject('');
        // Clear timer state from localStorage after saving
        localStorage.removeItem('timerState');
      } else {
        const errorData = await response.json();
        console.error('Server error:', errorData);
        alert('Failed to save session: ' + (errorData.detail || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error saving session:', error);
      alert('Error saving session: Network error');
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
    <div className="fixed inset-0 lg:left-60 bg-gradient-to-br from-gray-900 to-black flex items-center justify-center px-4 py-8">
      <div className="flex flex-col items-center">
        {/* Main Timer Circle */}
        <div className="relative mb-6 sm:mb-8">
          {/* Outer Ring */}
          <div className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 lg:w-[280px] lg:h-[280px] rounded-full border-2 sm:border-[3px] border-gray-700 bg-gradient-to-br from-gray-800 to-black shadow-2xl relative">
          
          {/* Time Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-mono font-light text-white mb-2 sm:mb-3 tracking-wider">
              {formatTime(time)}
            </div>
            
            {/* Status Indicator */}
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all duration-300 ${
                isRunning && !isPaused
                  ? 'bg-blue-400 animate-pulse shadow'
                  : isPaused
                  ? 'bg-yellow-400 shadow'
                  : 'bg-gray-500'
              }`}></div>
              <span className="text-gray-300 text-xs sm:text-sm font-medium">
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
      <div className="flex flex-col items-center space-y-4 sm:space-y-6 w-full max-w-md mx-auto">
        {/* Subject Selection */}
        <div className="relative w-full">
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full bg-gray-800 border-2 border-gray-600 rounded-xl px-4 py-3 text-white text-sm sm:text-base font-medium appearance-none cursor-pointer hover:border-gray-500 focus:border-blue-400 focus:outline-none transition-all duration-300 text-center"
            disabled={isRunning}
          >
            <option value="" className="bg-gray-800">Select Subject</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id.toString()} className="bg-gray-800">
                {subject.name}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-6 sm:mb-8">
          {!isRunning ? (
            <button
              onClick={startTimer}
              className="group flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-full font-bold text-sm sm:text-base transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <PlayIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">START</span>
            </button>
          ) : (
            <>
              {isPaused ? (
                <button
                  onClick={resumeTimer}
                  className="group flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-green-500 hover:bg-green-600 text-white rounded-full font-bold text-sm sm:text-base transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <PlayIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 group-hover:scale-110 transition-transform" />
                  <span className="hidden sm:inline">RESUME</span>
                </button>
              ) : (
                <button
                  onClick={pauseTimer}
                  className="group flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full font-bold text-sm sm:text-base transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <PauseIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 group-hover:scale-110 transition-transform" />
                  <span className="hidden sm:inline">PAUSE</span>
                </button>
              )}
              <button
                onClick={stopTimer}
                disabled={isStopping}
                className="group flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-red-500 hover:bg-red-600 text-white rounded-full font-bold text-sm sm:text-base transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <StopIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline">{isStopping ? 'STOPPING...' : 'STOP'}</span>
              </button>
            </>
          )}

          {/* Save Button */}
          {time > 0 && !isRunning && (
            <button
              onClick={saveSession}
              disabled={saving}
              className="group flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-full font-bold text-sm sm:text-base transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <ClockIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 group-hover:rotate-12 transition-transform" />
              <span className="hidden sm:inline">{saving ? "SAVING..." : "SAVE"}</span>
              <span className="sm:hidden">{saving ? "..." : "💾"}</span>
            </button>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}

export default function Timer() {
  return (
    <ProtectedRoute>
      <TimerContent />
    </ProtectedRoute>
  );
}

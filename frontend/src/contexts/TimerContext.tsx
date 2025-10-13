'use client';

import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';

interface TimerContextType {
  time: number;
  isRunning: boolean;
  isPaused: boolean;
  selectedSubject: string;
  startTimer: () => void;
  pauseTimer: () => void;
  stopTimer: () => void;
  setSelectedSubject: (subject: string) => void;
  resetTimer: () => void;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export function TimerProvider({ children }: { children: ReactNode }) {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [startTimestamp, setStartTimestamp] = useState<number | null>(null); // Track when timer started
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load timer state from localStorage on mount
  useEffect(() => {
    const savedTimerState = localStorage.getItem('timerState');
    if (savedTimerState) {
      try {
        const { 
          time: savedTime, 
          isRunning: savedIsRunning, 
          isPaused: savedIsPaused, 
          selectedSubject: savedSubject,
          startTimestamp: savedStartTimestamp
        } = JSON.parse(savedTimerState);
        
        // Calculate actual elapsed time if timer was running
        if (savedIsRunning && !savedIsPaused && savedStartTimestamp) {
          const now = Date.now();
          const totalElapsed = Math.floor((now - savedStartTimestamp) / 1000);
          setTime(totalElapsed);
          setStartTimestamp(savedStartTimestamp);
        } else {
          setTime(savedTime || 0);
          setStartTimestamp(savedStartTimestamp || null);
        }
        
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
      selectedSubject,
      startTimestamp
    };
    localStorage.setItem('timerState', JSON.stringify(timerState));
  }, [time, isRunning, isPaused, selectedSubject, startTimestamp]);

  // Timer interval - runs in background and calculates accurate time
  useEffect(() => {
    if (isRunning && !isPaused && startTimestamp) {
      // Calculate accurate time every second based on start timestamp
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const elapsed = Math.floor((now - startTimestamp) / 1000);
        setTime(elapsed);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isPaused, startTimestamp]);

  const startTimer = () => {
    // Only set start timestamp if timer is being started fresh
    if (!isRunning || isPaused) {
      if (!startTimestamp) {
        setStartTimestamp(Date.now());
      }
    }
    setIsRunning(true);
    setIsPaused(false);
  };

  const pauseTimer = () => {
    setIsPaused(true);
  };

  const stopTimer = () => {
    setIsRunning(false);
    setIsPaused(false);
  };

  const resetTimer = () => {
    setTime(0);
    setIsRunning(false);
    setIsPaused(false);
    setSelectedSubject('');
    setStartTimestamp(null);
    localStorage.removeItem('timerState');
  };

  return (
    <TimerContext.Provider
      value={{
        time,
        isRunning,
        isPaused,
        selectedSubject,
        startTimer,
        pauseTimer,
        stopTimer,
        setSelectedSubject,
        resetTimer
      }}
    >
      {children}
    </TimerContext.Provider>
  );
}

export function useTimer() {
  const context = useContext(TimerContext);
  if (context === undefined) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
}

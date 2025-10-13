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
          lastUpdated
        } = JSON.parse(savedTimerState);
        
        // Calculate elapsed time if timer was running
        if (savedIsRunning && !savedIsPaused && lastUpdated) {
          const elapsed = Math.floor((Date.now() - lastUpdated) / 1000);
          setTime((savedTime || 0) + elapsed);
        } else {
          setTime(savedTime || 0);
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
      lastUpdated: Date.now()
    };
    localStorage.setItem('timerState', JSON.stringify(timerState));
  }, [time, isRunning, isPaused, selectedSubject]);

  // Timer interval - runs in background
  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        setTime(prevTime => prevTime + 1);
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
  }, [isRunning, isPaused]);

  const startTimer = () => {
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

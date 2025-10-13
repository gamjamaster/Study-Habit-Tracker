'use client';

import { createContext, useContext, useState, useEffect, useRef, ReactNode, useCallback, useMemo } from 'react';

interface TimerContextType {
  getTime: () => number; // 함수로 변경하여 불필요한 리렌더링 방지
  isRunning: boolean;
  isPaused: boolean;
  selectedSubject: string;
  startTimer: () => void;
  pauseTimer: () => void;
  stopTimer: () => void;
  setSelectedSubject: (subject: string) => void;
  resetTimer: () => void;
  startTimestamp: number | null;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export function TimerProvider({ children }: { children: ReactNode }) {
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [startTimestamp, setStartTimestamp] = useState<number | null>(null);
  const [, setForceUpdate] = useState(0); // Sidebar 업데이트용
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load timer state from localStorage on mount
  useEffect(() => {
    const savedTimerState = localStorage.getItem('timerState');
    if (savedTimerState) {
      try {
        const { 
          isRunning: savedIsRunning, 
          isPaused: savedIsPaused, 
          selectedSubject: savedSubject,
          startTimestamp: savedStartTimestamp
        } = JSON.parse(savedTimerState);
        
        setIsRunning(savedIsRunning || false);
        setIsPaused(savedIsPaused || false);
        setSelectedSubject(savedSubject || '');
        setStartTimestamp(savedStartTimestamp || null);
      } catch (error) {
        console.error('Error loading timer state from localStorage:', error);
      }
    }
  }, []);

  // Save timer state to localStorage - 중요한 변경사항만 저장
  useEffect(() => {
    const timerState = {
      isRunning,
      isPaused,
      selectedSubject,
      startTimestamp
    };
    localStorage.setItem('timerState', JSON.stringify(timerState));
  }, [isRunning, isPaused, selectedSubject, startTimestamp]); // time 제거!

  // 시간 계산 함수 - 호출할 때만 계산
  const getTime = useCallback((): number => {
    if (startTimestamp && isRunning && !isPaused) {
      const now = Date.now();
      return Math.floor((now - startTimestamp) / 1000);
    }
    return 0;
  }, [startTimestamp, isRunning, isPaused]);

  // Timer interval - Sidebar 업데이트용으로만 사용 (1초에 1번)
  useEffect(() => {
    if (isRunning && !isPaused && startTimestamp) {
      intervalRef.current = setInterval(() => {
        setForceUpdate(prev => prev + 1); // 이것만으로 Sidebar가 업데이트됨
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

  const startTimer = useCallback(() => {
    // Only set start timestamp if timer is being started fresh
    if (!isRunning || isPaused) {
      if (!startTimestamp) {
        setStartTimestamp(Date.now());
      }
    }
    setIsRunning(true);
    setIsPaused(false);
  }, [isRunning, isPaused, startTimestamp]);

  const pauseTimer = useCallback(() => {
    setIsPaused(true);
  }, []);

  const stopTimer = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
  }, []);

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    setSelectedSubject('');
    setStartTimestamp(null);
    localStorage.removeItem('timerState');
  }, []);

  const value = useMemo(() => ({
    getTime,
    isRunning,
    isPaused,
    selectedSubject,
    startTimer,
    pauseTimer,
    stopTimer,
    setSelectedSubject,
    resetTimer,
    startTimestamp
  }), [getTime, isRunning, isPaused, selectedSubject, startTimestamp, startTimer, pauseTimer, stopTimer, resetTimer]);

  return (
    <TimerContext.Provider value={value}>
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

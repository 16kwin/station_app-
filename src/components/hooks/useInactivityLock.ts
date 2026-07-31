// hooks/useInactivityLock.ts
import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '../../services/AuthContext';
import ConstantInfo from '../../info/ConstantInfo';

export const useInactivityLock = () => {
  const { isAuth, isLocked, setLocked } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const lockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isWarningShownRef = useRef(false);

  const clearAllTimers = () => {
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
      warningTimerRef.current = null;
    }
    if (lockTimerRef.current) {
      clearTimeout(lockTimerRef.current);
      lockTimerRef.current = null;
    }
  };

  const startTimers = useCallback(() => {
    if (!isAuth || isLocked) return;

    clearAllTimers();
    isWarningShownRef.current = false;

    // Таймер показа предупреждения (основной_таймаут - время_предупреждения)
    warningTimerRef.current = setTimeout(() => {
      isWarningShownRef.current = true;
      setShowWarning(true);
    }, ConstantInfo.inactivityTimeout - ConstantInfo.warningTimeout);

    // Таймер блокировки (основной таймаут)
    lockTimerRef.current = setTimeout(() => {
      if (isAuth && !isLocked) {
        setLocked(true);
        setShowWarning(false);
        isWarningShownRef.current = false;
      }
    }, ConstantInfo.inactivityTimeout);
  }, [isAuth, isLocked]);

  const handleActivity = useCallback(() => {
    // Если предупреждение уже показано — игнорируем активность
    if (isWarningShownRef.current) return;
    // Иначе сбрасываем таймеры
    startTimers();
  }, [startTimers]);

  const handleCloseWarning = useCallback(() => {
    setShowWarning(false);
    isWarningShownRef.current = false;
    startTimers();
  }, [startTimers]);

  useEffect(() => {
    if (!isAuth || isLocked) {
      clearAllTimers();
      setShowWarning(false);
      isWarningShownRef.current = false;
      return;
    }

    startTimers();

    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'click', 'touchstart'];
    
    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      clearAllTimers();
    };
  }, [isAuth, isLocked, startTimers, handleActivity]);

  return { showWarning, setShowWarning: handleCloseWarning };
};
import React, { useState, useEffect, useRef } from 'react';
import { Task } from '../types';

interface FocusModeProps {
  task: Task;
  onClose: () => void;
  onComplete: (id: number) => void;
  onUpdateTime: (id: number, timeData: Partial<Task>) => void;
}

function FocusMode({ task, onClose, onComplete, onUpdateTime }: FocusModeProps) {
  const [isTracking, setIsTracking] = useState<boolean>(task.isTracking || false);
  const [timeSpent, setTimeSpent] = useState<number>(task.timeSpent || 0);
  const [showPomodoro, setShowPomodoro] = useState<boolean>(task.pomodoroActive || false);
  const [pomodoroTime, setPomodoroTime] = useState<number>(task.pomodoroTime || 25 * 60);
  const [pomodoroMode, setPomodoroMode] = useState<'work' | 'break'>(task.pomodoroMode || 'work');

  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pomodoroIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeSpentRef = useRef<number>(timeSpent);

  // Format time as HH:MM:SS
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${minutes}:${String(secs).padStart(2, '0')}`;
  };

  // Format date
  const formatDate = (): string => {
    if (!task.dueDate) return 'No due date';

    const [year, month, day] = task.dueDate.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric' };
    const dateStr = date.toLocaleDateString('en-US', options);

    if (task.dueTime) {
      return `${dateStr} at ${task.dueTime}`;
    }
    return dateStr;
  };

  // Start/stop time tracking
  const toggleTracking = (): void => {
    if (isTracking) {
      // Stop tracking
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      onUpdateTime(task.id, { timeSpent });
      setIsTracking(false);
    } else {
      // Start tracking
      setIsTracking(true);
      timerIntervalRef.current = setInterval(() => {
        setTimeSpent(prev => {
          const newTime = prev + 1;
          return newTime;
        });
      }, 1000);
    }
  };

  // Reset time tracking
  const resetTime = (): void => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setTimeSpent(0);
    setIsTracking(false);
    onUpdateTime(task.id, { timeSpent: 0 });
  };

  // Toggle Pomodoro timer
  const togglePomodoro = (): void => {
    setShowPomodoro(!showPomodoro);
    if (showPomodoro && pomodoroIntervalRef.current) {
      clearInterval(pomodoroIntervalRef.current);
      pomodoroIntervalRef.current = null;
    }
  };

  // Start/stop Pomodoro
  const togglePomodoroTimer = (): void => {
    if (pomodoroIntervalRef.current) {
      // Stop Pomodoro
      clearInterval(pomodoroIntervalRef.current);
      pomodoroIntervalRef.current = null;
    } else {
      // Start Pomodoro (also tracks total time spent)
      pomodoroIntervalRef.current = setInterval(() => {
        // Increment timeSpent during work sessions
        if (pomodoroMode === 'work') {
          setTimeSpent(prev => prev + 1);
        }

        setPomodoroTime(prev => {
          if (prev <= 1) {
            // Timer finished
            if (pomodoroIntervalRef.current) {
              clearInterval(pomodoroIntervalRef.current);
              pomodoroIntervalRef.current = null;
            }

            // Switch modes
            if (pomodoroMode === 'work') {
              setPomodoroMode('break');
              return 5 * 60; // 5 minute break
            } else {
              setPomodoroMode('work');
              return 25 * 60; // 25 minute work session
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  // Reset Pomodoro
  const resetPomodoro = (): void => {
    if (pomodoroIntervalRef.current) {
      clearInterval(pomodoroIntervalRef.current);
      pomodoroIntervalRef.current = null;
    }
    setPomodoroMode('work');
    setPomodoroTime(25 * 60);
  };

  // Handle close - save time and pomodoro state before closing
  const handleClose = (): void => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    if (pomodoroIntervalRef.current) {
      clearInterval(pomodoroIntervalRef.current);
    }

    // Save both time tracking and pomodoro state
    onUpdateTime(task.id, {
      timeSpent,
      pomodoroTime: showPomodoro ? pomodoroTime : null,
      pomodoroMode: showPomodoro ? pomodoroMode : null,
      pomodoroActive: showPomodoro
    });

    onClose();
  };

  // Handle complete
  const handleComplete = (): void => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      onUpdateTime(task.id, { timeSpent });
    }
    onComplete(task.id);
    onClose();
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        handleClose();
      } else if (e.key === ' ') {
        e.preventDefault();
        if (showPomodoro) {
          togglePomodoroTimer();
        } else {
          toggleTracking();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [showPomodoro, timeSpent]);

  // Keep ref in sync with timeSpent
  useEffect(() => {
    timeSpentRef.current = timeSpent;
  }, [timeSpent]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      if (pomodoroIntervalRef.current) {
        clearInterval(pomodoroIntervalRef.current);
      }
      // Save final time spent using ref
      if (timeSpentRef.current > 0) {
        onUpdateTime(task.id, { timeSpent: timeSpentRef.current });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Get priority color
  const getPriorityColor = (): string => {
    switch (task.priority) {
      case 'high': return '#ff6b6b';
      case 'medium': return '#ffd93d';
      case 'low': return '#6bcf7f';
      default: return '#999';
    }
  };

  return (
    <div className="focus-mode-overlay">
      <div className="focus-mode-container">
        {/* Close button */}
        <button className="focus-close-button" onClick={handleClose} title="Exit Focus Mode (ESC)">
          ×
        </button>

        {/* Priority badge */}
        <div
          className="focus-priority-badge"
          style={{ backgroundColor: getPriorityColor() }}
        >
          {task.priority} priority
        </div>

        {/* Task title */}
        <h1 className="focus-task-title">{task.text}</h1>

        {/* Due date */}
        <p className="focus-due-date">{formatDate()}</p>

        {/* Category */}
        {task.category && (
          <span className="focus-category">{task.category}</span>
        )}

        {/* Pomodoro toggle */}
        <div className="focus-mode-toggle">
          <button
            className={`toggle-button ${showPomodoro ? 'active' : ''}`}
            onClick={togglePomodoro}
          >
            {showPomodoro ? '⏱️ Time Tracking' : '🍅 Pomodoro'}
          </button>
        </div>

        {/* Time tracking or Pomodoro */}
        {!showPomodoro ? (
          <div className="focus-time-section">
            <div className="focus-time-display">
              {formatTime(timeSpent)}
            </div>
            <div className="focus-time-controls">
              <button
                className={`focus-timer-button ${isTracking ? 'stop' : 'start'}`}
                onClick={toggleTracking}
                title="Space to start/stop"
              >
                {isTracking ? '⏸ Pause' : '▶ Start'}
              </button>
              {timeSpent > 0 && (
                <button className="focus-reset-button" onClick={resetTime}>
                  Reset
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="focus-pomodoro-section">
            <div className={`focus-pomodoro-mode ${pomodoroMode}`}>
              {pomodoroMode === 'work' ? '💼 Work Session' : '☕ Break Time'}
            </div>
            <div className="focus-pomodoro-display">
              {formatTime(pomodoroTime)}
            </div>
            <div className="focus-pomodoro-controls">
              <button
                className={`focus-timer-button ${pomodoroIntervalRef.current ? 'stop' : 'start'}`}
                onClick={togglePomodoroTimer}
                title="Space to start/stop"
              >
                {pomodoroIntervalRef.current ? '⏸ Pause' : '▶ Start'}
              </button>
              <button className="focus-reset-button" onClick={resetPomodoro}>
                Reset
              </button>
            </div>
          </div>
        )}

        {/* Complete button */}
        <button className="focus-complete-button" onClick={handleComplete}>
          ✓ Mark Complete
        </button>

        {/* Keyboard shortcuts hint */}
        <div className="focus-shortcuts">
          <span>ESC to exit</span>
          <span>•</span>
          <span>SPACE to start/stop</span>
        </div>
      </div>
    </div>
  );
}

export default FocusMode;

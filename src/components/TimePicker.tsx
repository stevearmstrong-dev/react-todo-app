import React, { useState, useEffect, useRef } from 'react';

interface TimePickerProps {
  selectedTime?: string;
  onSelectTime: (time: string) => void;
}

const HOURS = Array.from({ length: 12 }, (_, index) => index + 1);
const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

const TimePicker: React.FC<TimePickerProps> = ({ selectedTime, onSelectTime }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hour, setHour] = useState(12);
  const [minute, setMinute] = useState(0);
  const [period, setPeriod] = useState<'AM' | 'PM'>('AM');
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!selectedTime) return;
    const [hours, minutes] = selectedTime.split(':').map(Number);
    const nextPeriod: 'AM' | 'PM' = hours >= 12 ? 'PM' : 'AM';
    const normalizedHour = hours % 12 || 12;

    setHour(normalizedHour);
    setMinute(minutes || 0);
    setPeriod(nextPeriod);
  }, [selectedTime]);

  useEffect(() => {
    const handleClick = (event: MouseEvent): void => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClick);
    }
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  const formatDisplay = (): string => {
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${String(minute).padStart(2, '0')} ${period}`;
  };

  const applySelection = (): void => {
    let hours = hour % 12;
    if (period === 'PM') hours += 12;
    const timeString = `${String(hours).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    onSelectTime(timeString);
    setIsOpen(false);
  };

  const clearSelection = (): void => {
    onSelectTime('');
    setIsOpen(false);
  };

  return (
    <div className="time-picker-wrapper" ref={wrapperRef}>
      <button className="time-trigger" type="button" onClick={() => setIsOpen((open) => !open)}>
        <span className="time-icon">🕐</span>
        <span className="time-display">{selectedTime ? formatDisplay() : 'Select time'}</span>
        <span className="time-arrow">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="time-dropdown compact">
          <div className="time-picker-header">
            <span className="time-picker-title">Pick a time</span>
          </div>
          <div className="time-picker-body">
            <div className="compact-clock">
              <svg className="clock-face" viewBox="0 0 160 160">
                <defs>
                  <linearGradient id="clockGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#73ABFF', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: '#5A8FE6', stopOpacity: 1 }} />
                  </linearGradient>
                </defs>
                <circle cx="80" cy="80" r="70" fill="none" stroke="rgba(115, 171, 255, 0.2)" strokeWidth="2" />
                {HOURS.map((value) => {
                  const angle = ((value % 12) / 12) * 2 * Math.PI - Math.PI / 2;
                  const radius = 52;
                  const x = 80 + radius * Math.cos(angle);
                  const y = 80 + radius * Math.sin(angle);
                  const isSelected = hour === value;

                  return (
                    <g key={value}>
                      <circle
                        cx={x}
                        cy={y}
                        r="13"
                        className={`clock-number ${isSelected ? 'selected' : ''}`}
                        onClick={() => setHour(value)}
                      />
                      <text
                        x={x}
                        y={y}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className={`clock-text ${isSelected ? 'selected' : ''}`}
                        pointerEvents="none"
                      >
                        {value}
                      </text>
                    </g>
                  );
                })}
              </svg>
              <div className="period-toggle-clock">
                <button
                  type="button"
                  className={`period-btn ${period === 'AM' ? 'selected' : ''}`}
                  onClick={() => setPeriod('AM')}
                >
                  AM
                </button>
                <button
                  type="button"
                  className={`period-btn ${period === 'PM' ? 'selected' : ''}`}
                  onClick={() => setPeriod('PM')}
                >
                  PM
                </button>
              </div>
            </div>
            <div className="minute-stack">
              <span className="minute-label">Minutes</span>
              <div className="minute-grid compact">
                {MINUTES.map((m) => (
                  <button
                    key={m}
                    type="button"
                    className={`minute-btn ${minute === m ? 'selected' : ''}`}
                    onClick={() => setMinute(m)}
                  >
                    {String(m).padStart(2, '0')}
                  </button>
                ))}
              </div>
              <div className="time-current-selection">
                {hour}:{String(minute).padStart(2, '0')} {period}
              </div>
            </div>
          </div>
          <div className="time-picker-actions">
            <button type="button" className="time-clear-btn" onClick={clearSelection}>
              Clear
            </button>
            <button type="button" className="time-apply-btn" onClick={applySelection}>
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimePicker;

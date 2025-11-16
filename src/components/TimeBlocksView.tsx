import React, { useState } from 'react';
import { Task } from '../types';

interface TimeBlocksViewProps {
  tasks: Task[];
  onUpdateTask: (id: number, updates: Partial<Task>) => void;
  onTaskClick: (task: Task) => void;
}

function TimeBlocksView({ tasks, onUpdateTask, onTaskClick }: TimeBlocksViewProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedDate] = useState<Date>(new Date());

  // Get unscheduled tasks (no scheduledStart)
  const unscheduledTasks = tasks.filter(
    (task) => !task.completed && !task.scheduledStart
  );

  // Get scheduled tasks for today
  const scheduledTasks = tasks.filter((task) => {
    if (!task.scheduledStart) return false;
    const taskDate = new Date(task.scheduledStart);
    return (
      taskDate.toDateString() === selectedDate.toDateString() &&
      !task.completed
    );
  });

  // Generate hourly time slots (8 AM - 8 PM)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 20; hour++) {
      slots.push({
        hour,
        label: hour > 12 ? `${hour - 12}:00 PM` : `${hour}:00 AM`,
        time: `${hour}:00`,
      });
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Schedule a task at a specific time
  const scheduleTask = (task: Task, hour: number) => {
    const startTime = new Date(selectedDate);
    startTime.setHours(hour, 0, 0, 0);

    onUpdateTask(task.id, {
      scheduledStart: startTime.toISOString(),
      scheduledDuration: 60, // Default 1 hour
    });

    setSelectedTask(null);
  };

  // Unschedule a task
  const unscheduleTask = (task: Task) => {
    onUpdateTask(task.id, {
      scheduledStart: undefined,
      scheduledDuration: undefined,
    });
  };

  // Get task scheduled at a specific hour
  const getTaskAtHour = (hour: number) => {
    return scheduledTasks.find((task) => {
      if (!task.scheduledStart) return false;
      const taskHour = new Date(task.scheduledStart).getHours();
      return taskHour === hour;
    });
  };

  // Format date for display
  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    };
    return date.toLocaleDateString('en-US', options);
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return '#ff6b6b';
      case 'medium':
        return '#ffd93d';
      case 'low':
        return '#6bcf7f';
      default:
        return '#999';
    }
  };

  return (
    <div className="time-blocks-container">
      <div className="time-blocks-header">
        <h2>🕒 Time Blocks</h2>
        <p className="time-blocks-date">{formatDate(selectedDate)}</p>
      </div>

      <div className="time-blocks-content">
        {/* Left: Unscheduled Tasks */}
        <div className="unscheduled-tasks">
          <h3>Unscheduled Tasks ({unscheduledTasks.length})</h3>
          {unscheduledTasks.length === 0 ? (
            <p className="empty-state">All tasks are scheduled! 🎉</p>
          ) : (
            <div className="task-list">
              {unscheduledTasks.map((task) => (
                <div
                  key={task.id}
                  className={`unscheduled-task ${
                    selectedTask?.id === task.id ? 'selected' : ''
                  }`}
                  onClick={() => setSelectedTask(task)}
                >
                  <div
                    className="task-priority-indicator"
                    style={{ backgroundColor: getPriorityColor(task.priority) }}
                  />
                  <div className="task-content">
                    <div className="task-text">{task.text}</div>
                    {task.category && (
                      <span className="task-category">{task.category}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          {selectedTask && (
            <div className="schedule-hint">
              👆 Click a time slot to schedule "{selectedTask.text}"
            </div>
          )}
        </div>

        {/* Right: Timeline */}
        <div className="timeline-view">
          <h3>Today's Schedule</h3>
          <div className="timeline">
            {timeSlots.map((slot) => {
              const taskAtSlot = getTaskAtHour(slot.hour);

              return (
                <div key={slot.hour} className="time-slot">
                  <div className="time-label">{slot.label}</div>
                  <div
                    className={`time-content ${
                      selectedTask && !taskAtSlot ? 'available' : ''
                    }`}
                    onClick={() => {
                      if (selectedTask && !taskAtSlot) {
                        scheduleTask(selectedTask, slot.hour);
                      }
                    }}
                  >
                    {taskAtSlot ? (
                      <div
                        className="time-block"
                        style={{
                          borderLeft: `4px solid ${getPriorityColor(
                            taskAtSlot.priority
                          )}`,
                        }}
                      >
                        <div className="time-block-header">
                          <span className="time-block-title">
                            {taskAtSlot.text}
                          </span>
                          <button
                            className="time-block-remove"
                            onClick={(e) => {
                              e.stopPropagation();
                              unscheduleTask(taskAtSlot);
                            }}
                            title="Unschedule"
                          >
                            ×
                          </button>
                        </div>
                        <div className="time-block-meta">
                          {taskAtSlot.category && (
                            <span className="block-category">
                              {taskAtSlot.category}
                            </span>
                          )}
                          <span className="block-duration">
                            {taskAtSlot.scheduledDuration || 60} min
                          </span>
                          <button
                            className="block-focus-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              onTaskClick(taskAtSlot);
                            }}
                          >
                            🎯 Focus
                          </button>
                        </div>
                      </div>
                    ) : selectedTask ? (
                      <div className="time-slot-placeholder">
                        Click to schedule here
                      </div>
                    ) : (
                      <div className="time-slot-empty">—</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TimeBlocksView;

import React, { useMemo, useState } from 'react';
import { Task } from '../types';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface UpcomingViewProps {
  tasks: Task[];
  onToggleComplete: (taskId: number) => void;
  onDeleteTask: (taskId: number) => void;
  onAddTask: (taskData: Partial<Task>) => void;
  onTaskDrop: (payload: {
    taskId: number;
    sourceDate: string;
    targetDate: string;
    targetIndex: number;
  }) => void;
  onFocus?: (task: Task) => void;
}

const DAYS_TO_SHOW = 7;

const getStartOfDay = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const parseTaskDate = (task: Task): Date | null => {
  if (!task.dueDate) return null;
  const [year, month, day] = task.dueDate.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const deriveDisplayTime = (task: Task): string => {
  if (task.dueTime) {
    const [hours, minutes] = task.dueTime.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }

  if (task.scheduledStart) {
    const date = new Date(task.scheduledStart);
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }

  return 'All day';
};

const formatDayLabel = (date: Date, today: Date): string => {
  const diffDays = Math.round((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  return date.toLocaleDateString('en-US', { weekday: 'long' });
};

const formatFullDate = (date: Date): string =>
  date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

const getDayKey = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const UpcomingView: React.FC<UpcomingViewProps> = ({
  tasks,
  onToggleComplete,
  onDeleteTask,
  onAddTask,
  onTaskDrop,
  onFocus,
}) => {
  const today = getStartOfDay(new Date());
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const [activeComposer, setActiveComposer] = useState<string | null>(null);
  const [newTaskValues, setNewTaskValues] = useState<Record<string, string>>({});

  const days = useMemo(() => {
    return Array.from({ length: DAYS_TO_SHOW }, (_, index) => {
      const date = new Date(today);
      date.setDate(date.getDate() + index);
      return date;
    });
  }, [today]);

  const tasksByDay = useMemo(() => {
    const groups: Record<string, Task[]> = {};

    tasks.forEach((task) => {
      const taskDate = parseTaskDate(task);
      if (!taskDate) return;
      if (taskDate < today) return;

      const key = task.dueDate as string;
      if (!groups[key]) groups[key] = [];
      groups[key].push(task);
    });

    Object.keys(groups).forEach((key) => {
      groups[key] = groups[key]
        .slice()
        .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    });

    return groups;
  }, [tasks, today]);

  const handleAddTask = (dayKey: string): void => {
    const value = (newTaskValues[dayKey] || '').trim();
    if (!value) return;
    const existing = tasksByDay[dayKey]?.length || 0;
    onAddTask({
      text: value,
      dueDate: dayKey,
      sortOrder: existing,
    });
    setNewTaskValues((prev) => ({ ...prev, [dayKey]: '' }));
    setActiveComposer(null);
  };

  const handleDragEnd = (event: DragEndEvent): void => {
    const { active, over } = event;
    if (!over) return;

    const taskId = active.data.current?.taskId as number | undefined;
    const sourceDay = active.data.current?.dayKey as string | undefined;
    if (!taskId || !sourceDay) return;

    let targetDay = sourceDay;
    let targetIndex: number | null = null;

    if (over.data?.current?.type === 'task') {
      targetDay = over.data.current.dayKey;
      const overTaskId = over.data.current.taskId as number;
      const targetTasks = (tasksByDay[targetDay] || []).filter((task) => task.id !== taskId);
      const idx = targetTasks.findIndex((task) => task.id === overTaskId);
      targetIndex = idx >= 0 ? idx : targetTasks.length;
    } else if (over.data?.current?.type === 'day') {
      targetDay = over.data.current.dayKey;
    } else {
      return;
    }

    const finalIndex = targetIndex ?? ((tasksByDay[targetDay] || []).filter((task) => task.id !== taskId).length);
    onTaskDrop({
      taskId,
      sourceDate: sourceDay,
      targetDate: targetDay,
      targetIndex: finalIndex,
    });
  };

  const hasUpcomingTasks = Object.keys(tasksByDay).length > 0;

  return (
    <div className="upcoming-view">
      <div className="upcoming-header">
        <div>
          <h2>Upcoming</h2>
          <p>Review the road ahead, just like Todoist.</p>
        </div>
      </div>

      {!hasUpcomingTasks && (
        <div className="upcoming-empty">
          <div className="upcoming-empty-icon">🌤️</div>
          <h3>No future tasks scheduled</h3>
          <p>Add due dates to populate this view.</p>
        </div>
      )}

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="upcoming-days">
          {days.map((day) => {
            const dayKey = getDayKey(day);
            const dayTasks = tasksByDay[dayKey] || [];

            return (
              <UpcomingDayColumn
                key={dayKey}
                dayKey={dayKey}
                label={formatDayLabel(day, today)}
                displayDate={formatFullDate(day)}
                tasks={dayTasks}
                onToggleComplete={onToggleComplete}
                onDeleteTask={onDeleteTask}
                onFocus={onFocus}
                onAddTask={handleAddTask}
                inputValue={newTaskValues[dayKey] || ''}
                onInputChange={(val) => setNewTaskValues((prev) => ({ ...prev, [dayKey]: val }))}
                isComposerOpen={activeComposer === dayKey}
                openComposer={() => setActiveComposer(dayKey)}
                closeComposer={() => setActiveComposer(null)}
              />
            );
          })}
        </div>
      </DndContext>
    </div>
  );
};

interface UpcomingDayColumnProps {
  dayKey: string;
  label: string;
  displayDate: string;
  tasks: Task[];
  inputValue: string;
  isComposerOpen: boolean;
  onToggleComplete: (taskId: number) => void;
  onDeleteTask: (taskId: number) => void;
  onFocus?: (task: Task) => void;
  onAddTask: (dayKey: string) => void;
  onInputChange: (value: string) => void;
  openComposer: () => void;
  closeComposer: () => void;
}

const UpcomingDayColumn: React.FC<UpcomingDayColumnProps> = ({
  dayKey,
  label,
  displayDate,
  tasks,
  inputValue,
  isComposerOpen,
  onToggleComplete,
  onDeleteTask,
  onFocus,
  onAddTask,
  onInputChange,
  openComposer,
  closeComposer,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `day-${dayKey}`,
    data: { type: 'day', dayKey },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (inputValue.trim()) {
      onAddTask(dayKey);
    }
  };

  return (
    <div className="upcoming-day">
      <div className="upcoming-day-header">
        <div>
          <p className="upcoming-day-label">{label}</p>
          <h3 className="upcoming-day-date">{displayDate}</h3>
        </div>
        <span className="upcoming-day-count">{tasks.length}</span>
      </div>

      <div
        className={`upcoming-day-schedule ${isOver ? 'drop-highlight' : ''}`}
        ref={setNodeRef}
      >
        <SortableContext
          items={tasks.map((task) => `task-${task.id}`)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.length === 0 ? (
            <div className="upcoming-day-empty">
              <p>No tasks scheduled</p>
            </div>
          ) : (
            tasks.map((task) => (
              <SortableTaskRow
                key={task.id}
                task={task}
                dayKey={dayKey}
                onToggleComplete={onToggleComplete}
                onDeleteTask={onDeleteTask}
                onFocus={onFocus}
              />
            ))
          )}
        </SortableContext>
      </div>

      <div className="upcoming-add-task">
        {isComposerOpen ? (
          <form className="upcoming-add-form" onSubmit={handleSubmit}>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => onInputChange(e.target.value)}
              placeholder="Add a task"
              autoFocus
            />
            <div className="upcoming-add-actions">
              <button type="submit">Add</button>
              <button type="button" onClick={closeComposer}>
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button type="button" className="upcoming-add-link" onClick={openComposer}>
            + Add task
          </button>
        )}
      </div>
    </div>
  );
};

interface SortableTaskRowProps {
  task: Task;
  dayKey: string;
  onToggleComplete: (taskId: number) => void;
  onDeleteTask: (taskId: number) => void;
  onFocus?: (task: Task) => void;
}

const SortableTaskRow: React.FC<SortableTaskRowProps> = ({
  task,
  dayKey,
  onToggleComplete,
  onDeleteTask,
  onFocus,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `task-${task.id}`,
    data: { type: 'task', dayKey, taskId: task.id },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      className={`upcoming-task ${isDragging ? 'dragging' : ''}`}
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <div className="upcoming-task-time">{deriveDisplayTime(task)}</div>
      <div className="upcoming-task-card">
        <div className="upcoming-task-header">
          <span className="upcoming-task-title">{task.text}</span>
          <div className="upcoming-task-actions">
            {onFocus && !task.completed && (
              <button
                className="upcoming-task-btn"
                onClick={() => onFocus(task)}
                title="Focus mode"
                type="button"
              >
                🎯
              </button>
            )}
            <button
              className="upcoming-task-btn"
              onClick={() => onToggleComplete(task.id)}
              title={task.completed ? 'Mark incomplete' : 'Mark complete'}
              type="button"
            >
              {task.completed ? '↺' : '✓'}
            </button>
            <button
              className="upcoming-task-btn danger"
              onClick={() => onDeleteTask(task.id)}
              title="Delete"
              type="button"
            >
              ✕
            </button>
          </div>
        </div>
        <div className="upcoming-task-meta">
          <span className={`priority-chip priority-${task.priority}`}>
            {task.priority.toUpperCase()}
          </span>
          {task.category && <span className="category-chip">{task.category}</span>}
          {task.scheduledDuration && (
            <span className="duration-chip">{task.scheduledDuration} min</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default UpcomingView;

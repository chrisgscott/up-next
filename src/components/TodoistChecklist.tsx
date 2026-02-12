'use client';

import { CalendarEvent } from '@/lib/calendar';
import { Circle } from 'lucide-react';

interface TodoistChecklistProps {
  tasks: CalendarEvent[];
}

export function TodoistChecklist({ tasks }: TodoistChecklistProps) {
  if (tasks.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display text-2xl tracking-wide text-zinc-400">TASKS</h3>
        <span className="text-sm text-zinc-600">{tasks.length} tasks</span>
      </div>

      <div className="space-y-2">
        {tasks.map((task, index) => (
          <div
            key={`task-${task.calendarId}-${task.id}`}
            className="task-item p-3 md:p-4 flex items-center gap-3 animate-slide-in"
            style={{
              opacity: 0,
              animationDelay: `${400 + index * 50}ms`
            }}
          >
            <Circle
              size={20}
              className="text-zinc-600 shrink-0"
              strokeWidth={2}
            />
            <span className="text-zinc-300 text-sm md:text-base leading-snug">
              {task.summary}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

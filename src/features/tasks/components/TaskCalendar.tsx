'use client';

import { useLocale } from 'next-intl';
import { useState } from 'react';
import type { Task } from '@/lib/types';

const PRIORITY_DOT: Record<string, string> = {
  low: 'bg-slate-400',
  medium: 'bg-amber-500',
  high: 'bg-red-500'
};

export function TaskCalendar({ tasks, onTaskClick }: { tasks: Task[]; onTaskClick: (t: Task) => void }) {
  const locale = useLocale();
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const INTL: Record<string, string> = { uz: 'uz-UZ', ru: 'ru-RU', en: 'en-GB' };
  const intlLocale = INTL[locale] ?? locale;
  const monthLabel = new Intl.DateTimeFormat(intlLocale, { month: 'long', year: 'numeric' }).format(cursor);

  // Monday-first grid
  const firstWeekday = (cursor.getDay() + 6) % 7;
  const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
  const cells: (Date | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(cursor.getFullYear(), cursor.getMonth(), i + 1))
  ];

  const weekdays = Array.from({ length: 7 }, (_, i) =>
    new Intl.DateTimeFormat(intlLocale, { weekday: 'short' }).format(new Date(2024, 0, i + 1))
  );

  const tasksByDay = new Map<string, Task[]>();
  for (const task of tasks) {
    if (!task.due_date) continue;
    const d = new Date(task.due_date);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    tasksByDay.set(key, [...(tasksByDay.get(key) ?? []), task]);
  }

  const today = new Date();
  const isToday = (d: Date) =>
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate();

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold capitalize text-slate-900">{monthLabel}</h2>
        <div className="flex gap-1">
          <button
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
            aria-label="Previous month"
          >
            ‹
          </button>
          <button
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
            aria-label="Next month"
          >
            ›
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg bg-slate-200 text-center">
        {weekdays.map((day) => (
          <div key={day} className="bg-slate-50 py-1.5 text-[11px] font-medium uppercase text-slate-500">
            {day}
          </div>
        ))}
        {cells.map((date, i) => {
          const dayTasks = date
            ? tasksByDay.get(`${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`) ?? []
            : [];
          return (
            <div key={i} className="min-h-20 bg-white p-1 text-left align-top">
              {date && (
                <>
                  <span
                    className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                      isToday(date) ? 'bg-brand-600 font-semibold text-white' : 'text-slate-600'
                    }`}
                  >
                    {date.getDate()}
                  </span>
                  <div className="mt-0.5 space-y-0.5">
                    {dayTasks.slice(0, 3).map((task) => (
                      <button
                        key={task.id}
                        onClick={() => onTaskClick(task)}
                        className="flex w-full items-center gap-1 truncate rounded px-1 py-0.5 text-left text-[11px] text-slate-700 hover:bg-slate-50"
                        title={task.title}
                      >
                        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${PRIORITY_DOT[task.priority]}`} />
                        <span className={`truncate ${task.status === 'completed' ? 'line-through opacity-50' : ''}`}>
                          {task.title}
                        </span>
                      </button>
                    ))}
                    {dayTasks.length > 3 && (
                      <p className="px-1 text-[10px] text-slate-400">+{dayTasks.length - 3}</p>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

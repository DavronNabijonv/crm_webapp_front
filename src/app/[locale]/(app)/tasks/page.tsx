'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import { Link } from '@/i18n/navigation';
import { Badge, STATUS_COLORS } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import { TaskCalendar } from '@/features/tasks/components/TaskCalendar';
import { TaskFormModal } from '@/features/tasks/components/TaskFormModal';
import { useDeleteTask, useTasks, useToggleTask } from '@/features/tasks/hooks';
import { formatDateTime, isOverdue } from '@/lib/format';
import type { Task } from '@/lib/types';

export default function TasksPage() {
  const t = useTranslations();
  const locale = useLocale();

  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [showCompleted, setShowCompleted] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);

  const tasks = useTasks(showCompleted ? {} : { status: 'pending' });
  const toggle = useToggleTask();
  const deleteTask = useDeleteTask();

  const openEdit = (task: Task) => {
    setEditing(task);
    setFormOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-slate-900">{t('tasks.title')}</h1>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-slate-300 p-0.5">
            {(['list', 'calendar'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                  view === v ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {t(`tasks.${v}View`)}
              </button>
            ))}
          </div>
          <Button
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            {t('tasks.addTask')}
          </Button>
        </div>
      </div>

      <label className="flex w-fit cursor-pointer items-center gap-2 text-sm text-slate-600">
        <input
          type="checkbox"
          checked={showCompleted}
          onChange={(e) => setShowCompleted(e.target.checked)}
          className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
        />
        {t('tasks.showCompleted')}
      </label>

      {tasks.isPending ? (
        <LoadingState />
      ) : tasks.isError ? (
        <ErrorState onRetry={() => void tasks.refetch()} />
      ) : tasks.data.items.length === 0 ? (
        <EmptyState message={t('tasks.empty')} />
      ) : view === 'calendar' ? (
        <TaskCalendar tasks={tasks.data.items} onTaskClick={openEdit} />
      ) : (
        <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
          {tasks.data.items.map((task) => {
            const overdue = task.status === 'pending' && isOverdue(task.due_date);
            return (
              <li key={task.id} className="flex items-center gap-3 px-4 py-3">
                <input
                  type="checkbox"
                  checked={task.status === 'completed'}
                  onChange={(e) => toggle.mutate({ id: task.id, completed: e.target.checked })}
                  className="h-5 w-5 shrink-0 rounded-full border-slate-300 text-brand-600 focus:ring-brand-500"
                  aria-label={t('tasks.markComplete')}
                />
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-sm font-medium ${
                      task.status === 'completed'
                        ? 'text-slate-400 line-through'
                        : 'text-slate-900'
                    }`}
                  >
                    {task.title}
                  </p>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-slate-400">
                    <span className={overdue ? 'font-medium text-red-600' : ''}>
                      {overdue && `${t('common.overdue')} · `}
                      {task.due_date ? formatDateTime(locale, task.due_date) : t('tasks.noDue')}
                    </span>
                    <span>· {task.assignee.full_name}</span>
                    {task.contact && (
                      <Link
                        href={`/contacts/${task.contact.id}`}
                        className="text-brand-600 hover:underline"
                      >
                        {task.contact.first_name} {task.contact.last_name}
                      </Link>
                    )}
                    {task.deal && (
                      <Link href={`/deals/${task.deal.id}`} className="text-brand-600 hover:underline">
                        {task.deal.title}
                      </Link>
                    )}
                  </p>
                </div>
                <Badge color={STATUS_COLORS[task.priority]}>
                  {t(`enums.priority.${task.priority}`)}
                </Badge>
                <div className="flex shrink-0 gap-1">
                  <Button size="sm" variant="ghost" onClick={() => openEdit(task)}>
                    {t('common.edit')}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      if (window.confirm(t('tasks.deleteConfirm'))) deleteTask.mutate(task.id);
                    }}
                  >
                    {t('common.delete')}
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <TaskFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        task={editing}
      />
    </div>
  );
}

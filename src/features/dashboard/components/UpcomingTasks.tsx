'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Badge, STATUS_COLORS } from '@/components/ui/Badge';
import { formatDateTime, isOverdue } from '@/lib/format';
import type { Task } from '@/lib/types';

export function UpcomingTasks({ tasks }: { tasks: Task[] }) {
  const t = useTranslations();
  const locale = useLocale();

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900">{t('dashboard.upcomingTasks')}</h2>
        <Link href="/tasks" className="text-xs font-medium text-brand-600 hover:text-brand-700">
          {t('common.viewAll')}
        </Link>
      </div>
      {tasks.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-400">{t('dashboard.noUpcoming')}</p>
      ) : (
        <ul className="space-y-2.5">
          {tasks.map((task) => {
            const overdue = isOverdue(task.due_date);
            return (
              <li key={task.id} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-800">{task.title}</p>
                  <p className={`text-xs ${overdue ? 'font-medium text-red-600' : 'text-slate-400'}`}>
                    {overdue && `${t('common.overdue')} · `}
                    {formatDateTime(locale, task.due_date)}
                  </p>
                </div>
                <Badge color={STATUS_COLORS[task.priority]}>
                  {t(`enums.priority.${task.priority}`)}
                </Badge>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

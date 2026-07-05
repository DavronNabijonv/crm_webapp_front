'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Avatar } from '@/components/ui/Avatar';
import { formatDateTime } from '@/lib/format';
import type { Activity } from '@/lib/types';

type TFunc = (key: string, values?: Record<string, string | number>) => string;

export function activityMessage(t: TFunc, activity: Activity): string {
  const p = activity.payload;
  switch (activity.type) {
    case 'deal_created':
    case 'deal_won':
    case 'deal_lost':
      return t(`activity.${activity.type}`, { title: p.deal_title ?? '' });
    case 'deal_stage_changed':
      return t('activity.deal_stage_changed', {
        title: p.deal_title ?? '',
        stage: p.to_stage ? t(`stages.${p.to_stage}`) : ''
      });
    case 'note_added':
      return t('activity.note_added', { preview: p.preview ?? '' });
    case 'task_created':
    case 'task_completed':
      return t(`activity.${activity.type}`, { title: p.task_title ?? '' });
    case 'file_uploaded':
      return t('activity.file_uploaded', { filename: p.filename ?? '' });
    default:
      return t(`activity.${activity.type}`);
  }
}

export function ActivityFeed({ activities, title }: { activities: Activity[]; title?: string }) {
  const t = useTranslations();
  const locale = useLocale();

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <h2 className="mb-3 text-sm font-semibold text-slate-900">
        {title ?? t('dashboard.recentActivity')}
      </h2>
      {activities.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-400">{t('dashboard.noActivity')}</p>
      ) : (
        <ul className="space-y-3">
          {activities.map((activity) => (
            <li key={activity.id} className="flex items-start gap-3">
              <Avatar name={activity.actor.full_name} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-slate-700">
                  <span className="font-medium text-slate-900">{activity.actor.full_name}</span>{' '}
                  {activityMessage(t, activity)}
                </p>
                <p className="mt-0.5 text-xs text-slate-400">
                  {formatDateTime(locale, activity.created_at)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

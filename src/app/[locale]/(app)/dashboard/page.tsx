'use client';

import { useTranslations } from 'next-intl';
import { useDashboard } from '@/features/dashboard/hooks';
import { KpiCards } from '@/features/dashboard/components/KpiCards';
import { FunnelChart } from '@/features/dashboard/components/FunnelChart';
import { ActivityFeed } from '@/features/dashboard/components/ActivityFeed';
import { UpcomingTasks } from '@/features/dashboard/components/UpcomingTasks';
import { ErrorState, LoadingState } from '@/components/ui/States';

export default function DashboardPage() {
  const t = useTranslations('dashboard');
  const { data, isPending, isError, refetch } = useDashboard();

  if (isPending) return <LoadingState />;
  if (isError) return <ErrorState onRetry={() => void refetch()} />;

  return (
    <div className="space-y-4 lg:space-y-5">
      <h1 className="text-xl font-semibold text-slate-900">{t('title')}</h1>
      <KpiCards kpis={data.kpis} />
      <div className="grid gap-4 lg:grid-cols-2 lg:gap-5">
        <FunnelChart funnel={data.funnel} />
        <UpcomingTasks tasks={data.upcoming_tasks} />
      </div>
      <ActivityFeed activities={data.recent_activity} />
    </div>
  );
}

'use client';

import { useLocale, useTranslations } from 'next-intl';
import { formatCompact } from '@/lib/format';
import type { DashboardSummary } from '@/lib/types';

export function KpiCards({ kpis }: { kpis: DashboardSummary['kpis'] }) {
  const t = useTranslations('dashboard');
  const locale = useLocale();

  const cards = [
    { label: t('totalContacts'), value: String(kpis.total_contacts) },
    { label: t('openDeals'), value: String(kpis.open_deals) },
    { label: t('wonThisMonth'), value: String(kpis.won_this_month) },
    { label: t('revenueThisMonth'), value: formatCompact(locale, kpis.revenue_this_month) }
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
      {cards.map((card) => (
        <div key={card.label} className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{card.label}</p>
          <p className="mt-1.5 text-2xl font-semibold text-slate-900">{card.value}</p>
        </div>
      ))}
    </div>
  );
}

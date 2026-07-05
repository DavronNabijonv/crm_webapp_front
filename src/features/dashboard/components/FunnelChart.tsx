'use client';

import { useLocale, useTranslations } from 'next-intl';
import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { formatCompact } from '@/lib/format';
import type { DashboardSummary } from '@/lib/types';
import { CHART, TOOLTIP_STYLE } from '../chart-theme';

export function FunnelChart({ funnel }: { funnel: DashboardSummary['funnel'] }) {
  const t = useTranslations();
  const locale = useLocale();

  const data = funnel.map((row, i) => ({
    ...row,
    label: t(`stages.${row.stage}`),
    fill: CHART.funnelRamp[Math.min(i, CHART.funnelRamp.length - 1)]
  }));

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <h2 className="mb-3 text-sm font-semibold text-slate-900">{t('dashboard.funnel')}</h2>
      {data.length === 0 ? (
        <p className="py-10 text-center text-sm text-slate-400">{t('dashboard.funnelEmpty')}</p>
      ) : (
        <ResponsiveContainer width="100%" height={Math.max(160, data.length * 52)}>
          <BarChart data={data} layout="vertical" margin={{ left: 0, right: 44, top: 0, bottom: 0 }}>
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="label"
              width={110}
              tickLine={false}
              axisLine={false}
              tick={{ fill: CHART.axisText, fontSize: 12 }}
            />
            <Tooltip
              cursor={{ fill: 'rgba(148, 163, 184, 0.08)' }}
              contentStyle={TOOLTIP_STYLE}
              formatter={(value: number) => [
                `${value} · ${formatCompact(locale, data.find((d) => d.count === value)?.value ?? 0)}`,
                t('dashboard.funnel')
              ]}
            />
            <Bar dataKey="count" barSize={22} radius={[0, 4, 4, 0]}>
              {data.map((entry) => (
                <Cell key={entry.stage} fill={entry.fill} />
              ))}
              <LabelList
                dataKey="count"
                position="right"
                style={{ fill: '#52514e', fontSize: 12, fontWeight: 600 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

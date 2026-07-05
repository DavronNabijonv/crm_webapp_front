'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { Button } from '@/components/ui/Button';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import { CHART, TOOLTIP_STYLE } from '@/features/dashboard/chart-theme';
import { downloadDealsCsv, useConversionReport, useWonLostReport } from '@/features/reports/hooks';

export default function ReportsPage() {
  const t = useTranslations();
  const locale = useLocale();
  const wonLost = useWonLostReport(6);
  const conversion = useConversionReport();
  const [exporting, setExporting] = useState(false);

  const INTL: Record<string, string> = { uz: 'uz-UZ', ru: 'ru-RU', en: 'en-GB' };
  const monthLabel = (ym: string) => {
    const [y, m] = ym.split('-').map(Number);
    return new Intl.DateTimeFormat(INTL[locale] ?? locale, {
      month: 'short',
      year: '2-digit'
    }).format(new Date(y, m - 1, 1));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-slate-900">{t('reports.title')}</h1>
        <Button
          variant="secondary"
          loading={exporting}
          onClick={async () => {
            setExporting(true);
            try {
              await downloadDealsCsv();
            } finally {
              setExporting(false);
            }
          }}
        >
          {t('reports.exportCsv')}
        </Button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="mb-3 text-sm font-semibold text-slate-900">{t('reports.wonLost')}</h2>
        {wonLost.isPending ? (
          <LoadingState />
        ) : wonLost.isError ? (
          <ErrorState onRetry={() => void wonLost.refetch()} />
        ) : wonLost.data.length === 0 ? (
          <EmptyState message={t('reports.empty')} />
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={wonLost.data.map((d) => ({ ...d, label: monthLabel(d.month) }))}
              margin={{ top: 8, right: 8, left: -18, bottom: 0 }}
              barGap={2}
            >
              <CartesianGrid vertical={false} stroke={CHART.grid} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={{ stroke: CHART.baseline }}
                tick={{ fill: CHART.axisText, fontSize: 12 }}
              />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                tick={{ fill: CHART.axisText, fontSize: 12 }}
              />
              <Tooltip cursor={{ fill: 'rgba(148, 163, 184, 0.08)' }} contentStyle={TOOLTIP_STYLE} />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 12, color: '#52514e' }}
              />
              <Bar
                dataKey="won"
                name={t('reports.won')}
                fill={CHART.won}
                barSize={14}
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="lost"
                name={t('reports.lost')}
                fill={CHART.lost}
                barSize={14}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="mb-3 text-sm font-semibold text-slate-900">{t('reports.conversion')}</h2>
        {conversion.isPending ? (
          <LoadingState />
        ) : conversion.isError ? (
          <ErrorState onRetry={() => void conversion.refetch()} />
        ) : conversion.data.length === 0 ? (
          <EmptyState message={t('reports.empty')} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-3 py-2 font-medium">{t('reports.stage')}</th>
                  <th className="px-3 py-2 font-medium">{t('reports.reached')}</th>
                  <th className="w-1/2 px-3 py-2 font-medium">{t('reports.conversionRate')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {conversion.data.map((row) => (
                  <tr key={row.stage}>
                    <td className="px-3 py-2.5 font-medium text-slate-800">
                      {t(`stages.${row.stage}`)}
                    </td>
                    <td className="px-3 py-2.5 tabular-nums text-slate-600">{row.reached}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-brand-500"
                            style={{ width: `${Math.min(100, row.conversion)}%` }}
                          />
                        </div>
                        <span className="w-12 text-right text-xs tabular-nums text-slate-600">
                          {row.conversion}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

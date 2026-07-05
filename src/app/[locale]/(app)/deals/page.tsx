'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import { Badge, STATUS_COLORS } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Input } from '@/components/ui/Input';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import { DealFormModal } from '@/features/deals/components/DealFormModal';
import { KanbanBoard } from '@/features/deals/components/KanbanBoard';
import { useDeals, useStages } from '@/features/deals/hooks';
import { formatDate, formatMoney } from '@/lib/format';
import type { Deal } from '@/lib/types';

export default function DealsPage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();

  const [view, setView] = useState<'board' | 'list'>('board');
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);

  const stages = useStages();
  const deals = useDeals({ search });

  const columns: Column<Deal>[] = [
    {
      key: 'title',
      header: t('deals.dealTitle'),
      render: (d) => <span className="font-medium text-slate-900">{d.title}</span>
    },
    {
      key: 'value',
      header: t('deals.value'),
      render: (d) => (
        <span className="font-medium text-slate-700">
          {formatMoney(locale, d.value, d.currency)}
        </span>
      )
    },
    {
      key: 'stage',
      header: t('deals.stage'),
      render: (d) => <Badge color={STATUS_COLORS[d.status]}>{t(`stages.${d.stage.key}`)}</Badge>
    },
    {
      key: 'contact',
      header: t('deals.contact'),
      desktopOnly: true,
      render: (d) => (
        <span className="text-slate-600">
          {d.contact.first_name} {d.contact.last_name}
        </span>
      )
    },
    {
      key: 'owner',
      header: t('deals.owner'),
      desktopOnly: true,
      render: (d) => <span className="text-slate-600">{d.owner.full_name}</span>
    },
    {
      key: 'close',
      header: t('deals.expectedClose'),
      desktopOnly: true,
      render: (d) => (
        <span className="text-slate-500">{formatDate(locale, d.expected_close_date)}</span>
      )
    }
  ];

  const isLoading = deals.isPending || stages.isPending;
  const isError = deals.isError || stages.isError;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-slate-900">{t('deals.title')}</h1>
        <div className="flex items-center gap-2">
          <div className="hidden rounded-lg border border-slate-300 p-0.5 md:flex">
            {(['board', 'list'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                  view === v ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {t(`deals.${v}`)}
              </button>
            ))}
          </div>
          <Button onClick={() => setFormOpen(true)}>{t('deals.addDeal')}</Button>
        </div>
      </div>

      <Input
        placeholder={t('deals.searchPlaceholder')}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-xs"
      />

      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState onRetry={() => void deals.refetch()} />
      ) : deals.data.items.length === 0 ? (
        <EmptyState message={search ? t('common.noResults') : t('deals.empty')} />
      ) : (
        <>
          {/* Kanban is desktop-first; mobile always gets the list */}
          <div className={view === 'board' ? 'hidden md:block' : 'hidden'}>
            <KanbanBoard stages={stages.data ?? []} deals={deals.data.items} />
          </div>
          <div className={view === 'board' ? 'md:hidden' : ''}>
            <DataTable
              columns={columns}
              rows={deals.data.items}
              rowKey={(d) => d.id}
              onRowClick={(d) => router.push(`/deals/${d.id}`)}
            />
          </div>
        </>
      )}

      <DealFormModal open={formOpen} onClose={() => setFormOpen(false)} />
    </div>
  );
}

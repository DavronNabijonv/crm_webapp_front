'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { Link, useRouter } from '@/i18n/navigation';
import { Badge, STATUS_COLORS } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { ErrorState, LoadingState } from '@/components/ui/States';
import { DealFormModal } from '@/features/deals/components/DealFormModal';
import { useDeal, useDealHistory, useDeleteDeal } from '@/features/deals/hooks';
import { NotesTimeline } from '@/features/notes/components/NotesTimeline';
import { formatDate, formatDateTime, formatMoney } from '@/lib/format';

export default function DealDetailPage() {
  const t = useTranslations();
  const locale = useLocale();
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const deal = useDeal(id);
  const history = useDealHistory(id);
  const deleteDeal = useDeleteDeal();

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (deal.isPending) return <LoadingState />;
  if (deal.isError) return <ErrorState onRetry={() => void deal.refetch()} />;

  const d = deal.data;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-slate-900">{d.title}</h1>
            <Badge color={STATUS_COLORS[d.status]}>{t(`stages.${d.stage.key}`)}</Badge>
          </div>
          <p className="mt-1 text-lg font-semibold text-brand-700">
            {formatMoney(locale, d.value, d.currency)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setEditOpen(true)}>
            {t('common.edit')}
          </Button>
          <Button variant="danger" onClick={() => setDeleteOpen(true)}>
            {t('common.delete')}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">{t('deals.contact')}</dt>
                <dd>
                  <Link
                    href={`/contacts/${d.contact.id}`}
                    className="font-medium text-brand-600 hover:text-brand-700"
                  >
                    {d.contact.first_name} {d.contact.last_name}
                  </Link>
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">{t('deals.owner')}</dt>
                <dd className="text-slate-700">{d.owner.full_name}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">{t('deals.expectedClose')}</dt>
                <dd className="text-slate-700">{formatDate(locale, d.expected_close_date)}</dd>
              </div>
              {d.closed_at && (
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">{t('deals.closedAt')}</dt>
                  <dd className="text-slate-700">{formatDate(locale, d.closed_at)}</dd>
                </div>
              )}
            </dl>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h2 className="mb-3 text-sm font-semibold text-slate-900">{t('deals.history')}</h2>
            {history.isPending ? (
              <LoadingState />
            ) : (history.data ?? []).length === 0 ? (
              <p className="text-sm text-slate-400">{t('deals.historyEmpty')}</p>
            ) : (
              <ol className="relative space-y-4 border-l border-slate-200 pl-4">
                {(history.data ?? []).map((entry) => (
                  <li key={entry.id} className="relative">
                    <span className="absolute -left-[21.5px] top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-brand-500" />
                    <p className="text-sm text-slate-700">
                      {entry.from_stage ? (
                        <>
                          {t(`stages.${entry.from_stage.key}`)}
                          <span className="mx-1 text-slate-400">→</span>
                        </>
                      ) : null}
                      <span className="font-medium">{t(`stages.${entry.to_stage.key}`)}</span>
                    </p>
                    <p className="text-xs text-slate-400">
                      {formatDateTime(locale, entry.changed_at)}{' '}
                      {t('deals.movedBy', { name: entry.changed_by.full_name })}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h2 className="mb-3 text-sm font-semibold text-slate-900">{t('notes.title')}</h2>
            <NotesTimeline parent={{ deal_id: id }} />
          </div>
        </div>
      </div>

      <DealFormModal open={editOpen} onClose={() => setEditOpen(false)} deal={d} />
      <ConfirmDialog
        open={deleteOpen}
        message={t('deals.deleteConfirm')}
        loading={deleteDeal.isPending}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={() => deleteDeal.mutate(id, { onSuccess: () => router.push('/deals') })}
      />
    </div>
  );
}

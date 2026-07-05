'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { Link, useRouter } from '@/i18n/navigation';
import { Avatar } from '@/components/ui/Avatar';
import { Badge, STATUS_COLORS } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import { Tabs } from '@/components/ui/Tabs';
import { ActivityFeed } from '@/features/dashboard/components/ActivityFeed';
import { ContactFormModal } from '@/features/contacts/components/ContactFormModal';
import { useContact, useContactDeals, useDeleteContact } from '@/features/contacts/hooks';
import { AttachmentsPanel } from '@/features/notes/components/AttachmentsPanel';
import { NotesTimeline } from '@/features/notes/components/NotesTimeline';
import { useActivities } from '@/features/notes/hooks';
import { formatDate, formatMoney } from '@/lib/format';

export default function ContactDetailPage() {
  const t = useTranslations();
  const locale = useLocale();
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const contact = useContact(id);
  const deals = useContactDeals(id);
  const activities = useActivities({ contact_id: id });
  const deleteContact = useDeleteContact();

  const [tab, setTab] = useState('notes');
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (contact.isPending) return <LoadingState />;
  if (contact.isError) return <ErrorState onRetry={() => void contact.refetch()} />;

  const c = contact.data;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar name={`${c.first_name} ${c.last_name}`} />
          <div>
            <h1 className="text-xl font-semibold text-slate-900">
              {c.first_name} {c.last_name}
            </h1>
            <p className="text-sm text-slate-500">
              {[c.position, c.company?.name].filter(Boolean).join(' · ') || '—'}
            </p>
          </div>
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
        <div className="space-y-4 lg:col-span-1">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">{t('contacts.status')}</dt>
                <dd>
                  <Badge color={STATUS_COLORS[c.status]}>
                    {t(`enums.contactStatus.${c.status}`)}
                  </Badge>
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">{t('contacts.email')}</dt>
                <dd className="truncate font-medium text-slate-800">{c.email ?? '—'}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">{t('contacts.phone')}</dt>
                <dd className="font-medium text-slate-800">{c.phone ?? '—'}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">{t('contacts.source')}</dt>
                <dd className="text-slate-700">{t(`enums.contactSource.${c.source}`)}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">{t('contacts.owner')}</dt>
                <dd className="text-slate-700">{c.owner.full_name}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">{t('contacts.created')}</dt>
                <dd className="text-slate-700">{formatDate(locale, c.created_at)}</dd>
              </div>
              {c.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {c.tags.map((tag) => (
                    <Badge key={tag.id} color={tag.color}>
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              )}
            </dl>
          </div>
        </div>

        <div className="lg:col-span-2">
          <Tabs
            tabs={[
              { id: 'notes', label: t('contacts.tabNotes') },
              { id: 'deals', label: t('contacts.tabDeals') },
              { id: 'activity', label: t('contacts.tabActivity') },
              { id: 'files', label: t('contacts.tabFiles') }
            ]}
            active={tab}
            onChange={setTab}
          />
          <div className="mt-4">
            {tab === 'notes' && <NotesTimeline parent={{ contact_id: id }} />}
            {tab === 'deals' &&
              (deals.isPending ? (
                <LoadingState />
              ) : (deals.data ?? []).length === 0 ? (
                <EmptyState message={t('contacts.noDeals')} />
              ) : (
                <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
                  {(deals.data ?? []).map((deal) => (
                    <li key={deal.id}>
                      <Link
                        href={`/deals/${deal.id}`}
                        className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-slate-50"
                      >
                        <div>
                          <p className="text-sm font-medium text-slate-800">{deal.title}</p>
                          <p className="text-xs text-slate-400">
                            {formatMoney(locale, deal.value, deal.currency)}
                          </p>
                        </div>
                        <Badge color={STATUS_COLORS[deal.status]}>
                          {t(`stages.${deal.stage.key}`)}
                        </Badge>
                      </Link>
                    </li>
                  ))}
                </ul>
              ))}
            {tab === 'activity' && (
              <ActivityFeed activities={activities.data ?? []} title={t('contacts.tabActivity')} />
            )}
            {tab === 'files' && <AttachmentsPanel contactId={id} />}
          </div>
        </div>
      </div>

      <ContactFormModal open={editOpen} onClose={() => setEditOpen(false)} contact={c} />
      <ConfirmDialog
        open={deleteOpen}
        message={t('contacts.deleteConfirm')}
        loading={deleteContact.isPending}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={() =>
          deleteContact.mutate(id, {
            onSuccess: () => router.push('/contacts')
          })
        }
      />
    </div>
  );
}

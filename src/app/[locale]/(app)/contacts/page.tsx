'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import { Badge, STATUS_COLORS } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import { useAuth } from '@/features/auth/AuthProvider';
import { ContactFormModal } from '@/features/contacts/components/ContactFormModal';
import { CsvImportModal } from '@/features/contacts/components/CsvImportModal';
import { useContacts, useTags } from '@/features/contacts/hooks';
import { useUsers } from '@/features/team/hooks';
import { formatDate } from '@/lib/format';
import type { Contact } from '@/lib/types';

export default function ContactsPage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const { user } = useAuth();

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [tagId, setTagId] = useState('');
  const [ownerId, setOwnerId] = useState('');
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  const contacts = useContacts({ search, status, tag_id: tagId, owner_id: ownerId, page });
  const tags = useTags();
  const users = useUsers();

  const columns: Column<Contact>[] = [
    {
      key: 'name',
      header: t('contacts.name'),
      render: (c) => (
        <div className="flex items-center gap-2.5">
          <Avatar name={`${c.first_name} ${c.last_name}`} size="sm" />
          <div>
            <p className="font-medium text-slate-900">
              {c.first_name} {c.last_name}
            </p>
            <p className="text-xs text-slate-400">{c.position ?? ''}</p>
          </div>
        </div>
      )
    },
    {
      key: 'company',
      header: t('contacts.company'),
      desktopOnly: true,
      render: (c) => <span className="text-slate-600">{c.company?.name ?? '—'}</span>
    },
    {
      key: 'status',
      header: t('contacts.status'),
      render: (c) => (
        <Badge color={STATUS_COLORS[c.status]}>{t(`enums.contactStatus.${c.status}`)}</Badge>
      )
    },
    {
      key: 'tags',
      header: t('contacts.tags'),
      desktopOnly: true,
      render: (c) => (
        <div className="flex flex-wrap gap-1">
          {c.tags.map((tag) => (
            <Badge key={tag.id} color={tag.color}>
              {tag.name}
            </Badge>
          ))}
        </div>
      )
    },
    {
      key: 'owner',
      header: t('contacts.owner'),
      desktopOnly: true,
      render: (c) => <span className="text-slate-600">{c.owner.full_name}</span>
    },
    {
      key: 'created',
      header: t('contacts.created'),
      desktopOnly: true,
      render: (c) => <span className="text-slate-500">{formatDate(locale, c.created_at)}</span>
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-slate-900">{t('contacts.title')}</h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setImportOpen(true)}>
            {t('contacts.importCsv')}
          </Button>
          <Button onClick={() => setFormOpen(true)}>{t('contacts.addContact')}</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:max-w-3xl">
        <Input
          placeholder={t('contacts.searchPlaceholder')}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="col-span-2 sm:col-span-1"
        />
        <Select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          placeholder={`${t('contacts.status')}: ${t('common.all')}`}
          options={(['lead', 'active', 'inactive'] as const).map((s) => ({
            value: s,
            label: t(`enums.contactStatus.${s}`)
          }))}
        />
        <Select
          value={tagId}
          onChange={(e) => {
            setTagId(e.target.value);
            setPage(1);
          }}
          placeholder={`${t('contacts.tag')}: ${t('common.all')}`}
          options={(tags.data ?? []).map((tag) => ({ value: tag.id, label: tag.name }))}
        />
        {user?.role !== 'agent' && (
          <Select
            value={ownerId}
            onChange={(e) => {
              setOwnerId(e.target.value);
              setPage(1);
            }}
            placeholder={`${t('contacts.owner')}: ${t('common.all')}`}
            options={(users.data ?? []).map((u) => ({ value: u.id, label: u.full_name }))}
          />
        )}
      </div>

      {contacts.isPending ? (
        <LoadingState />
      ) : contacts.isError ? (
        <ErrorState onRetry={() => void contacts.refetch()} />
      ) : contacts.data.items.length === 0 ? (
        <EmptyState
          message={search || status || tagId ? t('common.noResults') : t('contacts.empty')}
        />
      ) : (
        <DataTable
          columns={columns}
          rows={contacts.data.items}
          rowKey={(c) => c.id}
          onRowClick={(c) => router.push(`/contacts/${c.id}`)}
          pagination={{
            page,
            pageSize: contacts.data.page_size,
            total: contacts.data.total,
            onPageChange: setPage
          }}
        />
      )}

      <ContactFormModal open={formOpen} onClose={() => setFormOpen(false)} />
      <CsvImportModal open={importOpen} onClose={() => setImportOpen(false)} />
    </div>
  );
}

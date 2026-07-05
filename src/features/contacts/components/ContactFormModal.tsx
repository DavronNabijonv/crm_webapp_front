'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { useAuth } from '@/features/auth/AuthProvider';
import { useUsers } from '@/features/team/hooks';
import type { Contact } from '@/lib/types';
import { contactFormSchema } from '../schemas';
import { useCompanies, useSaveContact, useTags } from '../hooks';

interface Props {
  open: boolean;
  onClose: () => void;
  contact?: Contact | null;
}

export function ContactFormModal({ open, onClose, contact }: Props) {
  const t = useTranslations();
  const { user } = useAuth();
  const companies = useCompanies();
  const tags = useTags();
  const users = useUsers();
  const save = useSaveContact(contact?.id);

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    position: '',
    status: 'lead',
    source: 'website',
    company_id: '',
    owner_id: '',
    tag_ids: [] as string[]
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    if (open) {
      setForm({
        first_name: contact?.first_name ?? '',
        last_name: contact?.last_name ?? '',
        email: contact?.email ?? '',
        phone: contact?.phone ?? '',
        position: contact?.position ?? '',
        status: contact?.status ?? 'lead',
        source: contact?.source ?? 'website',
        company_id: contact?.company?.id ?? '',
        owner_id: contact?.owner.id ?? '',
        tag_ids: contact?.tags.map((tg) => tg.id) ?? []
      });
      setErrors({});
      setServerError('');
    }
  }, [open, contact]);

  const set = (key: string, value: string | string[]) => setForm((f) => ({ ...f, [key]: value }));

  const canReassign = user?.role !== 'agent';

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={contact ? t('contacts.editContact') : t('contacts.addContact')}
      wide
    >
      <form
        className="grid grid-cols-1 gap-4 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          const parsed = contactFormSchema.safeParse({
            ...form,
            company_id: form.company_id || null,
            owner_id: form.owner_id || null
          });
          if (!parsed.success) {
            const fe = parsed.error.flatten().fieldErrors;
            setErrors({
              first_name: fe.first_name ? t('validation.required') : '',
              email: fe.email ? t('validation.invalidEmail') : ''
            });
            return;
          }
          setErrors({});
          save.mutate(
            { ...parsed.data, email: parsed.data.email || null },
            {
              onSuccess: onClose,
              onError: (err) => setServerError(err.message)
            }
          );
        }}
      >
        <Input
          label={t('contacts.firstName')}
          value={form.first_name}
          onChange={(e) => set('first_name', e.target.value)}
          error={errors.first_name || undefined}
        />
        <Input
          label={t('contacts.lastName')}
          value={form.last_name}
          onChange={(e) => set('last_name', e.target.value)}
        />
        <Input
          label={t('contacts.email')}
          type="email"
          value={form.email}
          onChange={(e) => set('email', e.target.value)}
          error={errors.email || undefined}
        />
        <Input
          label={t('contacts.phone')}
          value={form.phone}
          onChange={(e) => set('phone', e.target.value)}
        />
        <Input
          label={t('contacts.position')}
          value={form.position}
          onChange={(e) => set('position', e.target.value)}
        />
        <Select
          label={t('contacts.company')}
          value={form.company_id}
          onChange={(e) => set('company_id', e.target.value)}
          placeholder="—"
          options={(companies.data ?? []).map((c) => ({ value: c.id, label: c.name }))}
        />
        <Select
          label={t('contacts.status')}
          value={form.status}
          onChange={(e) => set('status', e.target.value)}
          options={(['lead', 'active', 'inactive'] as const).map((s) => ({
            value: s,
            label: t(`enums.contactStatus.${s}`)
          }))}
        />
        <Select
          label={t('contacts.source')}
          value={form.source}
          onChange={(e) => set('source', e.target.value)}
          options={(['website', 'referral', 'cold_call', 'social', 'import'] as const).map((s) => ({
            value: s,
            label: t(`enums.contactSource.${s}`)
          }))}
        />
        {canReassign && (
          <Select
            label={t('contacts.owner')}
            value={form.owner_id}
            onChange={(e) => set('owner_id', e.target.value)}
            placeholder="—"
            options={(users.data ?? []).map((u) => ({ value: u.id, label: u.full_name }))}
          />
        )}
        <div className="sm:col-span-2">
          <p className="mb-1 block text-sm font-medium text-slate-700">{t('contacts.tags')}</p>
          <div className="flex flex-wrap gap-2">
            {(tags.data ?? []).map((tag) => {
              const selected = form.tag_ids.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() =>
                    set(
                      'tag_ids',
                      selected
                        ? form.tag_ids.filter((id) => id !== tag.id)
                        : [...form.tag_ids, tag.id]
                    )
                  }
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                    selected
                      ? 'border-brand-600 bg-brand-50 text-brand-700'
                      : 'border-slate-300 text-slate-500 hover:border-slate-400'
                  }`}
                >
                  {tag.name}
                </button>
              );
            })}
          </div>
        </div>
        {serverError && <p className="text-sm text-red-600 sm:col-span-2">{serverError}</p>}
        <div className="flex justify-end gap-2 sm:col-span-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" loading={save.isPending}>
            {t('common.save')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

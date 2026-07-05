'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { useAuth } from '@/features/auth/AuthProvider';
import { useContacts } from '@/features/contacts/hooks';
import { useUsers } from '@/features/team/hooks';
import type { Deal } from '@/lib/types';
import { dealFormSchema } from '../schemas';
import { useSaveDeal, useStages } from '../hooks';

interface Props {
  open: boolean;
  onClose: () => void;
  deal?: Deal | null;
  defaultContactId?: string;
}

export function DealFormModal({ open, onClose, deal, defaultContactId }: Props) {
  const t = useTranslations();
  const { user } = useAuth();
  const stages = useStages();
  const contacts = useContacts({ page: 1 });
  const users = useUsers();
  const save = useSaveDeal(deal?.id);

  const [form, setForm] = useState({
    title: '',
    value: '0',
    currency: 'UZS',
    contact_id: '',
    stage_id: '',
    owner_id: '',
    expected_close_date: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    if (open) {
      setForm({
        title: deal?.title ?? '',
        value: deal?.value ?? '0',
        currency: deal?.currency ?? 'UZS',
        contact_id: deal?.contact.id ?? defaultContactId ?? '',
        stage_id: deal?.stage.id ?? '',
        owner_id: deal?.owner.id ?? '',
        expected_close_date: deal?.expected_close_date ?? ''
      });
      setErrors({});
      setServerError('');
    }
  }, [open, deal, defaultContactId]);

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  return (
    <Modal open={open} onClose={onClose} title={deal ? t('deals.editDeal') : t('deals.addDeal')} wide>
      <form
        className="grid grid-cols-1 gap-4 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          const parsed = dealFormSchema.safeParse({
            ...form,
            stage_id: form.stage_id || null,
            owner_id: form.owner_id || null,
            expected_close_date: form.expected_close_date || null
          });
          if (!parsed.success) {
            const fe = parsed.error.flatten().fieldErrors;
            setErrors({
              title: fe.title ? t('validation.required') : '',
              value: fe.value ? t('validation.positiveNumber') : '',
              contact_id: fe.contact_id ? t('validation.required') : ''
            });
            return;
          }
          setErrors({});
          save.mutate(parsed.data, { onSuccess: onClose, onError: (err) => setServerError(err.message) });
        }}
      >
        <Input
          label={t('deals.dealTitle')}
          value={form.title}
          onChange={(e) => set('title', e.target.value)}
          error={errors.title || undefined}
          className="sm:col-span-2"
        />
        <Input
          label={t('deals.value')}
          type="number"
          min="0"
          step="any"
          value={form.value}
          onChange={(e) => set('value', e.target.value)}
          error={errors.value || undefined}
        />
        <Select
          label={t('deals.currency')}
          value={form.currency}
          onChange={(e) => set('currency', e.target.value)}
          options={['UZS', 'USD', 'EUR'].map((c) => ({ value: c, label: c }))}
        />
        <Select
          label={t('deals.contact')}
          value={form.contact_id}
          onChange={(e) => set('contact_id', e.target.value)}
          placeholder="—"
          error={errors.contact_id || undefined}
          options={(contacts.data?.items ?? []).map((c) => ({
            value: c.id,
            label: `${c.first_name} ${c.last_name}`
          }))}
        />
        <Select
          label={t('deals.stage')}
          value={form.stage_id}
          onChange={(e) => set('stage_id', e.target.value)}
          placeholder="—"
          options={(stages.data ?? []).map((s) => ({ value: s.id, label: t(`stages.${s.key}`) }))}
        />
        {user?.role !== 'agent' && (
          <Select
            label={t('deals.owner')}
            value={form.owner_id}
            onChange={(e) => set('owner_id', e.target.value)}
            placeholder="—"
            options={(users.data ?? []).map((u) => ({ value: u.id, label: u.full_name }))}
          />
        )}
        <Input
          label={t('deals.expectedClose')}
          type="date"
          value={form.expected_close_date}
          onChange={(e) => set('expected_close_date', e.target.value)}
        />
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

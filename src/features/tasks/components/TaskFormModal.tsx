'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { useAuth } from '@/features/auth/AuthProvider';
import { useContacts } from '@/features/contacts/hooks';
import { useDeals } from '@/features/deals/hooks';
import { useUsers } from '@/features/team/hooks';
import type { Task } from '@/lib/types';
import { taskFormSchema } from '../schemas';
import { useSaveTask } from '../hooks';

interface Props {
  open: boolean;
  onClose: () => void;
  task?: Task | null;
}

export function TaskFormModal({ open, onClose, task }: Props) {
  const t = useTranslations();
  const { user } = useAuth();
  const users = useUsers();
  const contacts = useContacts({ page: 1 });
  const deals = useDeals();
  const save = useSaveTask(task?.id);

  const [form, setForm] = useState({
    title: '',
    description: '',
    due_date: '',
    priority: 'medium',
    assignee_id: '',
    contact_id: '',
    deal_id: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      setForm({
        title: task?.title ?? '',
        description: task?.description ?? '',
        due_date: task?.due_date ? task.due_date.slice(0, 16) : '',
        priority: task?.priority ?? 'medium',
        assignee_id: task?.assignee.id ?? '',
        contact_id: task?.contact?.id ?? '',
        deal_id: task?.deal?.id ?? ''
      });
      setErrors({});
    }
  }, [open, task]);

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  return (
    <Modal open={open} onClose={onClose} title={task ? t('tasks.editTask') : t('tasks.addTask')} wide>
      <form
        className="grid grid-cols-1 gap-4 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          const parsed = taskFormSchema.safeParse({
            ...form,
            due_date: form.due_date ? new Date(form.due_date).toISOString() : null,
            assignee_id: form.assignee_id || null,
            contact_id: form.contact_id || null,
            deal_id: form.deal_id || null
          });
          if (!parsed.success) {
            setErrors({ title: t('validation.required') });
            return;
          }
          setErrors({});
          save.mutate(
            { ...parsed.data, description: parsed.data.description || null },
            { onSuccess: onClose }
          );
        }}
      >
        <Input
          label={t('tasks.taskTitle')}
          value={form.title}
          onChange={(e) => set('title', e.target.value)}
          error={errors.title || undefined}
          className="sm:col-span-2"
        />
        <Textarea
          label={`${t('tasks.description')} (${t('common.optional')})`}
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          className="sm:col-span-2"
        />
        <Input
          label={t('tasks.dueDate')}
          type="datetime-local"
          value={form.due_date}
          onChange={(e) => set('due_date', e.target.value)}
        />
        <Select
          label={t('tasks.priority')}
          value={form.priority}
          onChange={(e) => set('priority', e.target.value)}
          options={(['low', 'medium', 'high'] as const).map((p) => ({
            value: p,
            label: t(`enums.priority.${p}`)
          }))}
        />
        {user?.role !== 'agent' && (
          <Select
            label={t('tasks.assignee')}
            value={form.assignee_id}
            onChange={(e) => set('assignee_id', e.target.value)}
            placeholder="—"
            options={(users.data ?? []).map((u) => ({ value: u.id, label: u.full_name }))}
          />
        )}
        <Select
          label={`${t('tasks.linkContact')} (${t('common.optional')})`}
          value={form.contact_id}
          onChange={(e) => set('contact_id', e.target.value)}
          placeholder="—"
          options={(contacts.data?.items ?? []).map((c) => ({
            value: c.id,
            label: `${c.first_name} ${c.last_name}`
          }))}
        />
        <Select
          label={`${t('tasks.linkDeal')} (${t('common.optional')})`}
          value={form.deal_id}
          onChange={(e) => set('deal_id', e.target.value)}
          placeholder="—"
          options={(deals.data?.items ?? []).map((d) => ({ value: d.id, label: d.title }))}
        />
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

'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { Badge, STATUS_COLORS } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { ErrorState, LoadingState } from '@/components/ui/States';
import { useAuth } from '@/features/auth/AuthProvider';
import {
  useCreateInvitation,
  useInvitations,
  useRevokeInvitation,
  useTeam,
  useUpdateMember
} from '@/features/team/hooks';
import { formatDate } from '@/lib/format';
import type { Role } from '@/lib/types';

export default function TeamPage() {
  const t = useTranslations();
  const locale = useLocale();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const team = useTeam();
  const invitations = useInvitations();
  const createInvite = useCreateInvitation();
  const revokeInvite = useRevokeInvitation();
  const updateMember = useUpdateMember();

  const [inviteOpen, setInviteOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('agent');
  const [inviteError, setInviteError] = useState('');
  const [copiedId, setCopiedId] = useState('');

  if (team.isPending) return <LoadingState />;
  if (team.isError) return <ErrorState onRetry={() => void team.refetch()} />;

  const inviteUrl = (token: string) =>
    `${window.location.origin}/${locale}/accept-invite/${token}`;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-slate-900">{t('team.title')}</h1>
        {isAdmin && <Button onClick={() => setInviteOpen(true)}>{t('team.invite')}</Button>}
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3 font-medium">{t('team.member')}</th>
              <th className="px-4 py-3 font-medium">{t('team.role')}</th>
              <th className="hidden px-4 py-3 font-medium md:table-cell">{t('team.status')}</th>
              <th className="hidden px-4 py-3 font-medium md:table-cell">{t('team.joined')}</th>
              {isAdmin && <th className="px-4 py-3 font-medium">{t('common.actions')}</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(team.data ?? []).map((member) => (
              <tr key={member.id}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <Avatar name={member.full_name} size="sm" />
                    <div>
                      <p className="font-medium text-slate-900">{member.full_name}</p>
                      <p className="text-xs text-slate-400">{member.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  {isAdmin && member.id !== user?.id ? (
                    <Select
                      value={member.role}
                      onChange={(e) =>
                        updateMember.mutate({ id: member.id, role: e.target.value as Role })
                      }
                      options={(['admin', 'manager', 'agent'] as const).map((r) => ({
                        value: r,
                        label: t(`enums.roles.${r}`)
                      }))}
                      className="w-32"
                    />
                  ) : (
                    <Badge color={STATUS_COLORS[member.role]}>
                      {t(`enums.roles.${member.role}`)}
                    </Badge>
                  )}
                </td>
                <td className="hidden px-4 py-3 md:table-cell">
                  <Badge color={member.is_active ? 'green' : 'gray'}>
                    {member.is_active ? t('team.active') : t('team.inactive')}
                  </Badge>
                </td>
                <td className="hidden px-4 py-3 text-slate-500 md:table-cell">
                  {formatDate(locale, member.created_at)}
                </td>
                {isAdmin && (
                  <td className="px-4 py-3">
                    {member.id !== user?.id && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          updateMember.mutate({ id: member.id, is_active: !member.is_active })
                        }
                      >
                        {member.is_active ? t('team.deactivate') : t('team.activate')}
                      </Button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isAdmin && (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="mb-3 text-sm font-semibold text-slate-900">{t('team.pendingInvites')}</h2>
          {(invitations.data ?? []).length === 0 ? (
            <p className="text-sm text-slate-400">{t('team.noPending')}</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {(invitations.data ?? []).map((inv) => (
                <li key={inv.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{inv.email}</p>
                    <p className="text-xs text-slate-400">
                      {t(`enums.roles.${inv.role}`)} · {t('team.expires', { date: formatDate(locale, inv.expires_at) })}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        void navigator.clipboard.writeText(inviteUrl(inv.token));
                        setCopiedId(inv.id);
                        setTimeout(() => setCopiedId(''), 2000);
                      }}
                    >
                      {copiedId === inv.id ? t('team.copied') : t('team.copyLink')}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => revokeInvite.mutate(inv.id)}>
                      {t('team.revoke')}
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <Modal open={inviteOpen} onClose={() => setInviteOpen(false)} title={t('team.invite')}>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            setInviteError('');
            createInvite.mutate(
              { email, role },
              {
                onSuccess: () => {
                  setInviteOpen(false);
                  setEmail('');
                  setRole('agent');
                },
                onError: (err) => setInviteError(err.message)
              }
            );
          }}
        >
          <Input
            label={t('team.email')}
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Select
            label={t('team.role')}
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            options={(['admin', 'manager', 'agent'] as const).map((r) => ({
              value: r,
              label: t(`enums.roles.${r}`)
            }))}
          />
          {inviteError && <p className="text-sm text-red-600">{inviteError}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setInviteOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" loading={createInvite.isPending}>
              {t('team.sendInvite')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

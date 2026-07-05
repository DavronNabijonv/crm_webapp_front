'use client';

import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import { api } from '@/lib/api-client';
import { useAuth } from '@/features/auth/AuthProvider';
import { acceptInviteSchema } from '@/features/auth/schemas';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ErrorState, LoadingState } from '@/components/ui/States';

export default function AcceptInvitePage() {
  const t = useTranslations('auth');
  const tv = useTranslations('validation');
  const te = useTranslations('enums.roles');
  const { token } = useParams<{ token: string }>();
  const { acceptInvite } = useAuth();
  const router = useRouter();

  const invite = useQuery({
    queryKey: ['invitation', token],
    queryFn: () => api<{ email: string; role: 'admin' | 'manager' | 'agent' }>(`/auth/invitations/${token}`),
    retry: false
  });

  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ full_name?: string; password?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  if (invite.isPending) return <LoadingState />;
  if (invite.isError) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <ErrorState message={t('invalidInvite')} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-semibold text-slate-900">{t('acceptTitle')}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {t('acceptSubtitle', { role: te(invite.data.role) })}
          </p>
        </div>
        <form
          className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          onSubmit={async (e) => {
            e.preventDefault();
            const parsed = acceptInviteSchema.safeParse({ full_name: fullName, password });
            if (!parsed.success) {
              const fe = parsed.error.flatten().fieldErrors;
              setErrors({
                full_name: fe.full_name ? tv('minLength', { min: 2 }) : undefined,
                password: fe.password ? tv('minLength', { min: 8 }) : undefined
              });
              return;
            }
            setErrors({});
            setSubmitting(true);
            try {
              await acceptInvite(token, parsed.data.full_name, parsed.data.password);
              router.push('/dashboard');
            } catch (err) {
              setServerError(err instanceof Error ? err.message : 'Error');
            } finally {
              setSubmitting(false);
            }
          }}
        >
          <Input label={t('email')} value={invite.data.email} disabled />
          <Input
            label={t('fullName')}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            error={errors.full_name}
          />
          <Input
            label={t('password')}
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
          />
          {serverError && <p className="text-sm text-red-600">{serverError}</p>}
          <Button type="submit" loading={submitting} className="w-full">
            {t('join')}
          </Button>
        </form>
      </div>
    </div>
  );
}

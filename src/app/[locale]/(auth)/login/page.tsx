'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useAuth } from '@/features/auth/AuthProvider';
import { loginSchema } from '@/features/auth/schemas';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';

const DEMO_ACCOUNTS = [
  { email: 'admin@demo.crm', key: 'demoAdmin' },
  { email: 'manager@demo.crm', key: 'demoManager' },
  { email: 'agent@demo.crm', key: 'demoAgent' }
] as const;

export default function LoginPage() {
  const t = useTranslations('auth');
  const tv = useTranslations('validation');
  const tc = useTranslations('common');
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function submit(emailValue: string, passwordValue: string) {
    const parsed = loginSchema.safeParse({ email: emailValue, password: passwordValue });
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      setErrors({
        email: fieldErrors.email ? tv('invalidEmail') : undefined,
        password: fieldErrors.password ? tv('required') : undefined
      });
      return;
    }
    setErrors({});
    setServerError('');
    setSubmitting(true);
    try {
      await login(parsed.data.email, parsed.data.password);
      router.push('/dashboard');
    } catch {
      setServerError(t('invalidCredentials'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4">
      <div className="absolute right-4 top-4">
        <LanguageSwitcher />
      </div>
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-xl font-bold text-white">
            N
          </span>
          <h1 className="text-xl font-semibold text-slate-900">{t('title')}</h1>
          <p className="mt-1 text-sm text-slate-500">{t('subtitle')}</p>
        </div>
        <form
          className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          onSubmit={(e) => {
            e.preventDefault();
            void submit(email, password);
          }}
        >
          <Input
            label={t('email')}
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
          />
          <Input
            label={t('password')}
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
          />
          {serverError && <p className="text-sm text-red-600">{serverError}</p>}
          <Button type="submit" loading={submitting} className="w-full">
            {t('signIn')}
          </Button>
        </form>

        <div className="mt-6 rounded-2xl border border-dashed border-brand-200 bg-brand-50/50 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-700">
            {t('demoAccounts')}
          </p>
          <div className="space-y-1.5">
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.email}
                type="button"
                onClick={() => {
                  setEmail(acc.email);
                  setPassword('demo1234');
                  void submit(acc.email, 'demo1234');
                }}
                className="flex w-full items-center justify-between rounded-lg bg-white px-3 py-2 text-left text-sm shadow-sm transition-colors hover:bg-brand-50"
                disabled={submitting}
              >
                <span className="font-medium text-slate-700">{acc.email}</span>
                <span className="text-xs text-slate-400">{t(acc.key)}</span>
              </button>
            ))}
          </div>
        </div>
        <p className="mt-4 text-center text-xs text-slate-400">{tc('appName')} · demo1234</p>
      </div>
    </div>
  );
}

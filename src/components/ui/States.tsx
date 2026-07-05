'use client';

import { useTranslations } from 'next-intl';
import { Button } from './Button';
import { Spinner } from './Spinner';

/** Consistent loading / error / empty states used by every list view. */

export function LoadingState() {
  const t = useTranslations('common');
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-400">
      <Spinner className="h-8 w-8 text-brand-500" />
      <p className="text-sm">{t('loading')}</p>
    </div>
  );
}

export function ErrorState({ onRetry, message }: { onRetry?: () => void; message?: string }) {
  const t = useTranslations('common');
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16">
      <p className="text-sm text-red-600">{message ?? t('error')}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          {t('retry')}
        </Button>
      )}
    </div>
  );
}

export function EmptyState({ message, action }: { message?: string; action?: React.ReactNode }) {
  const t = useTranslations('common');
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <svg className="h-10 w-10 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-3.5a1 1 0 00-.8.4l-1.4 1.87a1 1 0 01-.8.4h-3a1 1 0 01-.8-.4L8.3 13.4a1 1 0 00-.8-.4H4"
        />
      </svg>
      <p className="text-sm text-slate-500">{message ?? t('empty')}</p>
      {action}
    </div>
  );
}

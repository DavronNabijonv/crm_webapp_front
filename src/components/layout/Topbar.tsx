'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useAuth } from '@/features/auth/AuthProvider';
import { Avatar } from '@/components/ui/Avatar';
import { Badge, STATUS_COLORS } from '@/components/ui/Badge';
import { LanguageSwitcher } from './LanguageSwitcher';

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const t = useTranslations();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:pl-6">
      <button
        onClick={onMenuClick}
        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
        aria-label="Menu"
      >
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
          <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <div className="hidden lg:block" />
      <div className="flex items-center gap-3">
        <LanguageSwitcher />
        {user && (
          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-slate-50"
            >
              <Avatar name={user.full_name} size="sm" />
              <span className="hidden text-sm font-medium text-slate-700 sm:block">
                {user.full_name}
              </span>
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
                <div className="border-b border-slate-100 px-3 py-2">
                  <p className="truncate text-sm font-medium text-slate-900">{user.email}</p>
                  <div className="mt-1">
                    <Badge color={STATUS_COLORS[user.role]}>{t(`enums.roles.${user.role}`)}</Badge>
                  </div>
                </div>
                <button
                  onClick={async () => {
                    await logout();
                    router.push('/login');
                  }}
                  className="mt-1 w-full rounded-lg px-3 py-2 text-left text-sm text-slate-600 hover:bg-slate-50"
                >
                  {t('common.logout')}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

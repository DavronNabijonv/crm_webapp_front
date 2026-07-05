import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['uz', 'ru', 'en'],
  defaultLocale: 'uz',
  localePrefix: 'always',
  localeCookie: {
    // Persist the visitor's language choice across sessions
    maxAge: 60 * 60 * 24 * 365
  }
});

export type Locale = (typeof routing.locales)[number];

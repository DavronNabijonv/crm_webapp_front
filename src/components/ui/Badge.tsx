import clsx from 'clsx';
import type { ReactNode } from 'react';

const COLOR_CLASSES: Record<string, string> = {
  gray: 'bg-slate-100 text-slate-700',
  red: 'bg-red-100 text-red-700',
  amber: 'bg-amber-100 text-amber-800',
  green: 'bg-emerald-100 text-emerald-700',
  blue: 'bg-blue-100 text-blue-700',
  purple: 'bg-purple-100 text-purple-700',
  cyan: 'bg-cyan-100 text-cyan-700'
};

export function Badge({ color = 'gray', children }: { color?: string; children: ReactNode }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        COLOR_CLASSES[color] ?? COLOR_CLASSES.gray
      )}
    >
      {children}
    </span>
  );
}

/** Semantic color mapping for domain enums. */
export const STATUS_COLORS: Record<string, string> = {
  lead: 'amber',
  active: 'green',
  inactive: 'gray',
  open: 'blue',
  won: 'green',
  lost: 'red',
  pending: 'blue',
  completed: 'green',
  low: 'gray',
  medium: 'amber',
  high: 'red',
  admin: 'purple',
  manager: 'blue',
  agent: 'gray'
};

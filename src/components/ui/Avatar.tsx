import { initials } from '@/lib/format';

const PALETTE = [
  'bg-brand-100 text-brand-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-800',
  'bg-purple-100 text-purple-700',
  'bg-cyan-100 text-cyan-700',
  'bg-rose-100 text-rose-700'
];

export function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' }) {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) | 0;
  const color = PALETTE[Math.abs(hash) % PALETTE.length];
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold ${color} ${
        size === 'sm' ? 'h-7 w-7 text-[11px]' : 'h-9 w-9 text-sm'
      }`}
      title={name}
    >
      {initials(name)}
    </span>
  );
}

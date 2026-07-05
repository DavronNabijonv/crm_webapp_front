'use client';

import { useDraggable } from '@dnd-kit/core';
import { useLocale } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { Avatar } from '@/components/ui/Avatar';
import { formatDate, formatMoney } from '@/lib/format';
import type { Deal } from '@/lib/types';

export function KanbanCard({ deal, overlay = false }: { deal: Deal; overlay?: boolean }) {
  const locale = useLocale();
  const router = useRouter();
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: deal.id,
    data: { deal },
    disabled: overlay
  });

  return (
    <div
      ref={overlay ? undefined : setNodeRef}
      {...(overlay ? {} : { ...attributes, ...listeners })}
      onClick={() => {
        if (!isDragging && !overlay) router.push(`/deals/${deal.id}`);
      }}
      className={`cursor-grab rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition-shadow hover:shadow ${
        isDragging ? 'opacity-40' : ''
      } ${overlay ? 'rotate-2 shadow-lg' : ''}`}
    >
      <p className="text-sm font-medium leading-snug text-slate-900">{deal.title}</p>
      <p className="mt-1 text-sm font-semibold text-brand-700">
        {formatMoney(locale, deal.value, deal.currency)}
      </p>
      <div className="mt-2 flex items-center justify-between">
        <span className="truncate text-xs text-slate-500">
          {deal.contact.first_name} {deal.contact.last_name}
        </span>
        <div className="flex items-center gap-1.5">
          {deal.expected_close_date && (
            <span className="text-[11px] text-slate-400">
              {formatDate(locale, deal.expected_close_date)}
            </span>
          )}
          <Avatar name={deal.owner.full_name} size="sm" />
        </div>
      </div>
    </div>
  );
}

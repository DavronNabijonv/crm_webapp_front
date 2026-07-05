'use client';

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent
} from '@dnd-kit/core';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import { formatCompact } from '@/lib/format';
import type { Deal, Stage } from '@/lib/types';
import { useMoveDealStage } from '../hooks';
import { KanbanCard } from './KanbanCard';

function KanbanColumn({ stage, deals }: { stage: Stage; deals: Deal[] }) {
  const t = useTranslations();
  const locale = useLocale();
  const { setNodeRef, isOver } = useDroppable({ id: stage.id });

  const totalValue = deals.reduce((sum, d) => sum + parseFloat(d.value), 0);

  return (
    <div
      ref={setNodeRef}
      className={`flex w-64 shrink-0 flex-col rounded-xl border p-2 transition-colors ${
        isOver ? 'border-brand-300 bg-brand-50/60' : 'border-slate-200 bg-slate-100/60'
      }`}
    >
      <div className="flex items-center justify-between px-2 py-1.5">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-600">
          {t(`stages.${stage.key}`)}
          <span className="ml-1.5 rounded-full bg-slate-200 px-1.5 py-0.5 text-[10px] text-slate-600">
            {deals.length}
          </span>
        </h3>
        <span className="text-[11px] text-slate-400">{formatCompact(locale, totalValue)}</span>
      </div>
      <div className="flex min-h-24 flex-1 flex-col gap-2 overflow-y-auto p-1">
        {deals.map((deal) => (
          <KanbanCard key={deal.id} deal={deal} />
        ))}
      </div>
    </div>
  );
}

export function KanbanBoard({ stages, deals }: { stages: Stage[]; deals: Deal[] }) {
  const move = useMoveDealStage();
  const [activeDeal, setActiveDeal] = useState<Deal | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  function onDragStart(event: DragStartEvent) {
    setActiveDeal((event.active.data.current?.deal as Deal) ?? null);
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveDeal(null);
    const dealId = String(event.active.id);
    const overStageId = event.over ? String(event.over.id) : null;
    const deal = deals.find((d) => d.id === dealId);
    if (!deal || !overStageId || deal.stage.id === overStageId) return;
    move.mutate({ dealId, stageId: overStageId });
  }

  return (
    <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <div className="flex gap-3 overflow-x-auto pb-3">
        {stages.map((stage) => (
          <KanbanColumn
            key={stage.id}
            stage={stage}
            deals={deals.filter((d) => d.stage.id === stage.id)}
          />
        ))}
      </div>
      <DragOverlay>{activeDeal && <KanbanCard deal={activeDeal} overlay />}</DragOverlay>
    </DndContext>
  );
}

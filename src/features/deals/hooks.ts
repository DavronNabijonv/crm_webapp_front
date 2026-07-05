'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { Deal, Page, Stage, StageHistoryEntry } from '@/lib/types';
import type { DealFormInput } from './schemas';

export function useStages() {
  return useQuery({
    queryKey: ['stages'],
    queryFn: () => api<Stage[]>('/stages'),
    staleTime: Infinity
  });
}

export function useDeals(filters: { search?: string; owner_id?: string } = {}) {
  return useQuery({
    queryKey: ['deals', filters],
    queryFn: () => api<Page<Deal>>('/deals', { params: { ...filters, page_size: 500 } })
  });
}

export function useDeal(id: string) {
  return useQuery({ queryKey: ['deals', id], queryFn: () => api<Deal>(`/deals/${id}`) });
}

export function useDealHistory(id: string) {
  return useQuery({
    queryKey: ['deals', id, 'history'],
    queryFn: () => api<StageHistoryEntry[]>(`/deals/${id}/history`)
  });
}

export function useSaveDeal(id?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: DealFormInput) =>
      id
        ? api<Deal>(`/deals/${id}`, { method: 'PATCH', body: input })
        : api<Deal>('/deals', { method: 'POST', body: input }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['deals'] });
      void qc.invalidateQueries({ queryKey: ['dashboard'] });
    }
  });
}

export function useDeleteDeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api(`/deals/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['deals'] });
      void qc.invalidateQueries({ queryKey: ['dashboard'] });
    }
  });
}

/**
 * Kanban stage move with optimistic update: the card jumps to the target
 * column immediately and rolls back if the server rejects the change.
 */
export function useMoveDealStage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ dealId, stageId }: { dealId: string; stageId: string }) =>
      api<Deal>(`/deals/${dealId}`, { method: 'PATCH', body: { stage_id: stageId } }),
    onMutate: async ({ dealId, stageId }) => {
      await qc.cancelQueries({ queryKey: ['deals'] });
      const stages = qc.getQueryData<Stage[]>(['stages']);
      const previous = qc.getQueriesData<Page<Deal>>({ queryKey: ['deals'] });
      qc.setQueriesData<Page<Deal>>({ queryKey: ['deals'] }, (old) => {
        if (!old?.items) return old;
        return {
          ...old,
          items: old.items.map((deal) => {
            if (deal.id !== dealId) return deal;
            const stage = stages?.find((s) => s.id === stageId);
            return stage ? { ...deal, stage } : deal;
          })
        };
      });
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      ctx?.previous?.forEach(([key, data]) => qc.setQueryData(key, data));
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: ['deals'] });
      void qc.invalidateQueries({ queryKey: ['dashboard'] });
    }
  });
}

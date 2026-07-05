'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { Page, Task } from '@/lib/types';
import type { TaskFormInput } from './schemas';

export interface TaskFilters {
  status?: string;
  assignee_id?: string;
  contact_id?: string;
  deal_id?: string;
  due_from?: string;
  due_to?: string;
}

export function useTasks(filters: TaskFilters = {}) {
  return useQuery({
    queryKey: ['tasks', filters],
    queryFn: () => api<Page<Task>>('/tasks', { params: { ...filters, page_size: 200 } })
  });
}

export function useSaveTask(id?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: TaskFormInput) =>
      id
        ? api<Task>(`/tasks/${id}`, { method: 'PATCH', body: input })
        : api<Task>('/tasks', { method: 'POST', body: input }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['tasks'] });
      void qc.invalidateQueries({ queryKey: ['dashboard'] });
    }
  });
}

export function useToggleTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) =>
      api<Task>(`/tasks/${id}`, {
        method: 'PATCH',
        body: { status: completed ? 'completed' : 'pending' }
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['tasks'] });
      void qc.invalidateQueries({ queryKey: ['dashboard'] });
    }
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api(`/tasks/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['tasks'] });
      void qc.invalidateQueries({ queryKey: ['dashboard'] });
    }
  });
}

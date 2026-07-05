'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { Activity, Attachment, Note } from '@/lib/types';

type Parent = { contact_id?: string; deal_id?: string };

export function useNotes(parent: Parent) {
  return useQuery({
    queryKey: ['notes', parent],
    queryFn: () => api<Note[]>('/notes', { params: parent })
  });
}

export function useAddNote(parent: Parent) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: string) => api<Note>('/notes', { method: 'POST', body: { body, ...parent } }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['notes', parent] });
      void qc.invalidateQueries({ queryKey: ['activities'] });
    }
  });
}

export function useDeleteNote(parent: Parent) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api(`/notes/${id}`, { method: 'DELETE' }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['notes', parent] })
  });
}

export function useActivities(parent: Parent & { limit?: number } = {}) {
  return useQuery({
    queryKey: ['activities', parent],
    queryFn: () => api<Activity[]>('/activities', { params: parent })
  });
}

export function useAttachments(contactId: string) {
  return useQuery({
    queryKey: ['attachments', contactId],
    queryFn: () => api<Attachment[]>(`/contacts/${contactId}/attachments`)
  });
}

export function useUploadAttachment(contactId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return api<Attachment>(`/contacts/${contactId}/attachments`, { method: 'POST', formData });
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['attachments', contactId] })
  });
}

export function useDeleteAttachment(contactId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api(`/attachments/${id}`, { method: 'DELETE' }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['attachments', contactId] })
  });
}

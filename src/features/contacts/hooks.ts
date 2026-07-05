'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type {
  Company,
  Contact,
  CsvImportResult,
  Deal,
  Page,
  Tag
} from '@/lib/types';
import type { ContactFormInput } from './schemas';

export interface ContactFilters {
  search?: string;
  status?: string;
  tag_id?: string;
  owner_id?: string;
  page?: number;
}

export function useContacts(filters: ContactFilters) {
  return useQuery({
    queryKey: ['contacts', filters],
    queryFn: () =>
      api<Page<Contact>>('/contacts', {
        params: { ...filters, page: filters.page ?? 1, page_size: 20 }
      })
  });
}

export function useContact(id: string) {
  return useQuery({
    queryKey: ['contacts', id],
    queryFn: () => api<Contact>(`/contacts/${id}`)
  });
}

export function useContactDeals(id: string) {
  return useQuery({
    queryKey: ['contacts', id, 'deals'],
    queryFn: () => api<Deal[]>(`/contacts/${id}/deals`)
  });
}

export function useCompanies() {
  return useQuery({ queryKey: ['companies'], queryFn: () => api<Company[]>('/companies') });
}

export function useTags() {
  return useQuery({ queryKey: ['tags'], queryFn: () => api<Tag[]>('/tags') });
}

export function useSaveContact(id?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ContactFormInput) =>
      id
        ? api<Contact>(`/contacts/${id}`, { method: 'PATCH', body: input })
        : api<Contact>('/contacts', { method: 'POST', body: input }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['contacts'] });
      void qc.invalidateQueries({ queryKey: ['dashboard'] });
    }
  });
}

export function useDeleteContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api(`/contacts/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['contacts'] });
      void qc.invalidateQueries({ queryKey: ['dashboard'] });
    }
  });
}

export function useImportCsv() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return api<CsvImportResult>('/contacts/import-csv', { method: 'POST', formData });
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['contacts'] })
  });
}

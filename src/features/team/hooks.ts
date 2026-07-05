'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { Invitation, Role, User } from '@/lib/types';

export function useUsers() {
  return useQuery({ queryKey: ['users'], queryFn: () => api<User[]>('/users') });
}

export function useTeam() {
  return useQuery({ queryKey: ['team'], queryFn: () => api<User[]>('/team') });
}

export function useInvitations() {
  return useQuery({
    queryKey: ['invitations'],
    queryFn: () => api<Invitation[]>('/team/invitations')
  });
}

export function useCreateInvitation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { email: string; role: Role }) =>
      api<Invitation>('/team/invitations', { method: 'POST', body: input }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['invitations'] })
  });
}

export function useRevokeInvitation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api(`/team/invitations/${id}`, { method: 'DELETE' }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['invitations'] })
  });
}

export function useUpdateMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string; role?: Role; is_active?: boolean }) =>
      api<User>(`/team/${id}`, { method: 'PATCH', body }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['team'] });
      void qc.invalidateQueries({ queryKey: ['users'] });
    }
  });
}

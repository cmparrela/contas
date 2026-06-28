'use client';

import { useAuth } from '@clerk/nextjs';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { InviteConnectionInput } from '@contas/shared';
import { acceptConnection, inviteConnection, listConnections, rejectConnection } from '../api/connections';

export function useConnections() {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ['connections'] as const,
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      return listConnections(token);
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useInviteConnection() {
  const { getToken } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (body: InviteConnectionInput) => {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      return inviteConnection(token, body);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['connections'] });
    },
  });
}

export function useAcceptConnection() {
  const { getToken } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      return acceptConnection(token, id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['connections'] });
    },
  });
}

export function useRejectConnection() {
  const { getToken } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      return rejectConnection(token, id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['connections'] });
    },
  });
}

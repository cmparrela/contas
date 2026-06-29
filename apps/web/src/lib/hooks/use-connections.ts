'use client';

import { useAuth } from '@clerk/nextjs';
import type { InviteConnectionInput } from '@contas/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  acceptConnection,
  inviteConnection,
  listConnections,
  rejectConnection,
} from '../api/connections';
import { requireToken } from '../require-token';

export function useConnections() {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ['connections'] as const,
    queryFn: async () => {
      const token = await requireToken(getToken);
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
      const token = await requireToken(getToken);
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
      const token = await requireToken(getToken);
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
      const token = await requireToken(getToken);
      return rejectConnection(token, id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['connections'] });
    },
  });
}

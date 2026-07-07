'use client';

import { useAuth } from '@clerk/nextjs';
import type { CreateTagInput, UpdateTagInput } from '@contas/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createTag, deleteTag, listTags, updateTag } from '../api/tags';
import { requireToken } from '../require-token';

export function useTags() {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ['tags'] as const,
    queryFn: async () => {
      const token = await requireToken(getToken);
      return listTags(token);
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateTag() {
  const { getToken } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (body: CreateTagInput) => {
      const token = await requireToken(getToken);
      return createTag(token, body);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tags'] });
    },
  });
}

export function useUpdateTag() {
  const { getToken } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, body }: { id: string; body: UpdateTagInput }) => {
      const token = await requireToken(getToken);
      return updateTag(token, id, body);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tags'] });
    },
  });
}

export function useDeleteTag() {
  const { getToken } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const token = await requireToken(getToken);
      return deleteTag(token, id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tags'] });
      qc.invalidateQueries({ queryKey: ['bills'] });
      qc.invalidateQueries({ queryKey: ['month'] });
    },
  });
}

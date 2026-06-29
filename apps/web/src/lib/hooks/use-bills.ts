'use client';

import { useAuth } from '@clerk/nextjs';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateBillInput, UpdateBillInput } from '@contas/shared';
import { requireToken } from '../require-token';
import { createBill, deleteBill, listBills, updateBill } from '../api/bills';

export function useBills() {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ['bills'] as const,
    queryFn: async () => {
      const token = await requireToken(getToken);
      return listBills(token);
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateBill() {
  const { getToken } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (body: CreateBillInput) => {
      const token = await requireToken(getToken);
      return createBill(token, body);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bills'] });
    },
  });
}

export function useUpdateBill() {
  const { getToken } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, body }: { id: string; body: UpdateBillInput }) => {
      const token = await requireToken(getToken);
      return updateBill(token, id, body);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bills'] });
    },
  });
}

export function useDeleteBill() {
  const { getToken } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const token = await requireToken(getToken);
      return deleteBill(token, id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bills'] });
    },
  });
}

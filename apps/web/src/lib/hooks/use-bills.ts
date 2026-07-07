'use client';

import { useAuth } from '@clerk/nextjs';
import type { BillResponse, CreateBillInput, UpdateBillInput } from '@contas/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createBill, deleteBill, listBills, reorderBills, updateBill } from '../api/bills';
import { requireToken } from '../require-token';

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
      qc.invalidateQueries({ queryKey: ['month'] });
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
      qc.invalidateQueries({ queryKey: ['month'] });
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
      qc.invalidateQueries({ queryKey: ['month'] });
    },
  });
}

export function useReorderBills() {
  const { getToken } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (orderedIds: string[]) => {
      const token = await requireToken(getToken);
      return reorderBills(token, orderedIds);
    },
    onMutate: async (orderedIds: string[]) => {
      await qc.cancelQueries({ queryKey: ['bills'] });
      const previous = qc.getQueryData<BillResponse[]>(['bills']);

      if (previous) {
        const byId = new Map(previous.map((bill) => [bill._id, bill]));
        const reordered = orderedIds
          .map((id) => byId.get(id))
          .filter((bill): bill is BillResponse => Boolean(bill));
        const untouched = previous.filter((bill) => !orderedIds.includes(bill._id));
        qc.setQueryData<BillResponse[]>(['bills'], [...reordered, ...untouched]);
      }

      return { previous };
    },
    onError: (_err, _orderedIds, context) => {
      if (context?.previous) {
        qc.setQueryData(['bills'], context.previous);
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['bills'] });
      qc.invalidateQueries({ queryKey: ['month'] });
    },
  });
}

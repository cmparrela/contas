'use client';

import { useAuth } from '@clerk/nextjs';
import type { UpdateMonthlyBillInput } from '@contas/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { confirmSharedPayment, getMonth, markSharedPaid, updateMonthlyBill } from '../api/months';
import { requireToken } from '../require-token';

export function useMonth(year: number, month: number) {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ['month', year, month] as const,
    queryFn: async () => {
      const token = await requireToken(getToken);
      return getMonth(token, year, month);
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useUpdateMonthlyBill(year: number, month: number) {
  const { getToken } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ billId, body }: { billId: string; body: UpdateMonthlyBillInput }) => {
      const token = await requireToken(getToken);
      return updateMonthlyBill(token, year, month, billId, body);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['month', year, month] });
    },
  });
}

export function useMarkSharedPaid(year: number, month: number) {
  const { getToken } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (billId: string) => {
      const token = await requireToken(getToken);
      return markSharedPaid(token, year, month, billId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['month', year, month] });
    },
  });
}

export function useConfirmSharedPayment(year: number, month: number) {
  const { getToken } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (billId: string) => {
      const token = await requireToken(getToken);
      return confirmSharedPayment(token, year, month, billId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['month', year, month] });
    },
  });
}

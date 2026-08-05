'use client';

import { useAuth } from '@clerk/nextjs';
import type { UpdateMonthlyBillInput } from '@contas/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { MonthResponse } from '../api/months';
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

async function cancelAndSnapshotMonth(qc: ReturnType<typeof useQueryClient>, key: unknown[]) {
  await qc.cancelQueries({ queryKey: key });
  return qc.getQueryData<MonthResponse>(key);
}

function patchMonthlyBill(
  previous: MonthResponse | undefined,
  billId: string,
  patch: (mb: MonthResponse['monthlyBills'][number]) => MonthResponse['monthlyBills'][number],
): MonthResponse | undefined {
  if (!previous) return previous;
  return {
    ...previous,
    monthlyBills: previous.monthlyBills.map((mb) => (mb.billId === billId ? patch(mb) : mb)),
  };
}

export function useUpdateMonthlyBill(year: number, month: number) {
  const { getToken } = useAuth();
  const qc = useQueryClient();
  const key = ['month', year, month];

  return useMutation({
    mutationFn: async ({ billId, body }: { billId: string; body: UpdateMonthlyBillInput }) => {
      const token = await requireToken(getToken);
      return updateMonthlyBill(token, year, month, billId, body);
    },
    onMutate: async ({ billId, body }) => {
      const previous = await cancelAndSnapshotMonth(qc, key);
      if (body.paid !== undefined) {
        qc.setQueryData<MonthResponse>(
          key,
          patchMonthlyBill(previous, billId, (mb) => ({
            ...mb,
            paidAt: body.paid ? new Date().toISOString() : undefined,
          })),
        );
      }
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) qc.setQueryData(key, context.previous);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: key });
    },
  });
}

export function useMarkSharedPaid(year: number, month: number) {
  const { getToken } = useAuth();
  const qc = useQueryClient();
  const key = ['month', year, month];

  return useMutation({
    mutationFn: async ({ billId, value }: { billId: string; value: boolean }) => {
      const token = await requireToken(getToken);
      return markSharedPaid(token, year, month, billId, value);
    },
    onMutate: async ({ billId, value }) => {
      const previous = await cancelAndSnapshotMonth(qc, key);
      qc.setQueryData<MonthResponse>(
        key,
        patchMonthlyBill(previous, billId, (mb) => ({
          ...mb,
          sharedData: mb.sharedData && {
            ...mb.sharedData,
            otherPaidAt: value ? new Date().toISOString() : undefined,
          },
        })),
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) qc.setQueryData(key, context.previous);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: key });
    },
  });
}

export function useConfirmSharedPayment(year: number, month: number) {
  const { getToken } = useAuth();
  const qc = useQueryClient();
  const key = ['month', year, month];

  return useMutation({
    mutationFn: async ({ billId, value }: { billId: string; value: boolean }) => {
      const token = await requireToken(getToken);
      return confirmSharedPayment(token, year, month, billId, value);
    },
    onMutate: async ({ billId, value }) => {
      const previous = await cancelAndSnapshotMonth(qc, key);
      qc.setQueryData<MonthResponse>(
        key,
        patchMonthlyBill(previous, billId, (mb) => ({
          ...mb,
          sharedData: mb.sharedData && {
            ...mb.sharedData,
            payerConfirmedAt: value ? new Date().toISOString() : undefined,
          },
        })),
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) qc.setQueryData(key, context.previous);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: key });
    },
  });
}

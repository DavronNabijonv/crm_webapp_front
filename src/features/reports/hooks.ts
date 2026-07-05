'use client';

import { useQuery } from '@tanstack/react-query';
import { api, apiDownload } from '@/lib/api-client';
import type { ConversionRow, WonLostPoint } from '@/lib/types';

export function useWonLostReport(months = 6) {
  return useQuery({
    queryKey: ['reports', 'won-lost', months],
    queryFn: () => api<WonLostPoint[]>('/reports/won-lost', { params: { months } })
  });
}

export function useConversionReport() {
  return useQuery({
    queryKey: ['reports', 'conversion'],
    queryFn: () => api<ConversionRow[]>('/reports/conversion')
  });
}

export function downloadDealsCsv() {
  return apiDownload('/reports/export.csv', 'deals_report.csv');
}

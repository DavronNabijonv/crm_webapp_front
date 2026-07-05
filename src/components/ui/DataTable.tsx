'use client';

import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import { Button } from './Button';

export interface Column<T> {
  key: string;
  header: ReactNode;
  render: (row: T) => ReactNode;
  className?: string;
  /** hide on small screens */
  desktopOnly?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  pagination?: { page: number; pageSize: number; total: number; onPageChange: (p: number) => void };
}

export function DataTable<T>({ columns, rows, rowKey, onRowClick, pagination }: DataTableProps<T>) {
  const t = useTranslations('common');
  const pages = pagination ? Math.max(1, Math.ceil(pagination.total / pagination.pageSize)) : 1;

  return (
    <div>
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 font-medium ${col.desktopOnly ? 'hidden md:table-cell' : ''} ${col.className ?? ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr
                key={rowKey(row)}
                className={onRowClick ? 'cursor-pointer transition-colors hover:bg-slate-50' : ''}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-4 py-3 ${col.desktopOnly ? 'hidden md:table-cell' : ''} ${col.className ?? ''}`}
                  >
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pagination && pages > 1 && (
        <div className="mt-3 flex items-center justify-between text-sm text-slate-500">
          <span>{t('page', { page: pagination.page, pages })}</span>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => pagination.onPageChange(pagination.page - 1)}
            >
              {t('prev')}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={pagination.page >= pages}
              onClick={() => pagination.onPageChange(pagination.page + 1)}
            >
              {t('next')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

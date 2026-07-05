'use client';

import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import type { CsvImportResult } from '@/lib/types';
import { useImportCsv } from '../hooks';

export function CsvImportModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useTranslations();
  const importCsv = useImportCsv();
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<CsvImportResult | null>(null);

  const close = () => {
    setFile(null);
    setResult(null);
    onClose();
  };

  return (
    <Modal open={open} onClose={close} title={t('contacts.importCsv')}>
      <p className="mb-4 text-xs text-slate-500">{t('contacts.csvHint')}</p>
      <input
        ref={fileRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
      />
      <div className="flex items-center gap-3">
        <Button type="button" variant="secondary" onClick={() => fileRef.current?.click()}>
          {t('contacts.chooseFile')}
        </Button>
        <span className="truncate text-sm text-slate-600">{file?.name ?? '—'}</span>
      </div>
      {result && (
        <div className="mt-4 rounded-lg bg-slate-50 p-3 text-sm">
          <p className="font-medium text-slate-800">
            {t('contacts.importResult', { imported: result.imported, skipped: result.skipped })}
          </p>
          {result.errors.length > 0 && (
            <ul className="mt-2 max-h-32 space-y-1 overflow-y-auto text-xs text-slate-500">
              {result.errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          )}
        </div>
      )}
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="secondary" onClick={close}>
          {t('common.close')}
        </Button>
        <Button
          disabled={!file}
          loading={importCsv.isPending}
          onClick={() => file && importCsv.mutate(file, { onSuccess: setResult })}
        >
          {t('contacts.import')}
        </Button>
      </div>
    </Modal>
  );
}

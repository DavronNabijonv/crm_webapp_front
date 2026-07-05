'use client';

import { useTranslations } from 'next-intl';
import { Button } from './Button';
import { Modal } from './Modal';

interface ConfirmDialogProps {
  open: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export function ConfirmDialog({ open, message, onConfirm, onCancel, loading }: ConfirmDialogProps) {
  const t = useTranslations('common');
  return (
    <Modal open={open} onClose={onCancel} title={t('confirmDeleteTitle')}>
      <p className="text-sm text-slate-600">{message}</p>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel}>
          {t('cancel')}
        </Button>
        <Button variant="danger" onClick={onConfirm} loading={loading}>
          {t('delete')}
        </Button>
      </div>
    </Modal>
  );
}

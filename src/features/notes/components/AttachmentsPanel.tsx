'use client';

import { useTranslations } from 'next-intl';
import { useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/States';
import { apiDownload } from '@/lib/api-client';
import { useAttachments, useDeleteAttachment, useUploadAttachment } from '../hooks';

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function AttachmentsPanel({ contactId }: { contactId: string }) {
  const t = useTranslations();
  const attachments = useAttachments(contactId);
  const upload = useUploadAttachment(contactId);
  const remove = useDeleteAttachment(contactId);
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-4">
      <input
        ref={fileRef}
        type="file"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) upload.mutate(file);
          e.target.value = '';
        }}
      />
      <Button variant="secondary" loading={upload.isPending} onClick={() => fileRef.current?.click()}>
        {t('files.upload')}
      </Button>

      {attachments.isPending ? (
        <LoadingState />
      ) : (attachments.data ?? []).length === 0 ? (
        <p className="py-6 text-center text-sm text-slate-400">{t('files.empty')}</p>
      ) : (
        <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
          {(attachments.data ?? []).map((file) => (
            <li key={file.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-800">{file.filename}</p>
                <p className="text-xs text-slate-400">
                  {formatSize(file.size_bytes)} · {file.uploaded_by.full_name}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => void apiDownload(`/attachments/${file.id}/download`, file.filename)}
                >
                  {t('files.download')}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    if (window.confirm(t('files.deleteConfirm'))) remove.mutate(file.id);
                  }}
                >
                  {t('common.delete')}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

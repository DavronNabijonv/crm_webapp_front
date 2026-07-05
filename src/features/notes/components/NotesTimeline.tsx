'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Input';
import { LoadingState } from '@/components/ui/States';
import { formatDateTime } from '@/lib/format';
import { useAddNote, useDeleteNote, useNotes } from '../hooks';

type Parent = { contact_id?: string; deal_id?: string };

export function NotesTimeline({ parent }: { parent: Parent }) {
  const t = useTranslations();
  const locale = useLocale();
  const notes = useNotes(parent);
  const addNote = useAddNote(parent);
  const deleteNote = useDeleteNote(parent);
  const [body, setBody] = useState('');

  return (
    <div className="space-y-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!body.trim()) return;
          addNote.mutate(body.trim(), { onSuccess: () => setBody('') });
        }}
      >
        <Textarea
          placeholder={t('notes.placeholder')}
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        <div className="mt-2 flex justify-end">
          <Button type="submit" size="sm" loading={addNote.isPending} disabled={!body.trim()}>
            {t('notes.add')}
          </Button>
        </div>
      </form>

      {notes.isPending ? (
        <LoadingState />
      ) : (notes.data ?? []).length === 0 ? (
        <p className="py-6 text-center text-sm text-slate-400">{t('notes.empty')}</p>
      ) : (
        <ul className="space-y-4">
          {(notes.data ?? []).map((note) => (
            <li key={note.id} className="flex gap-3">
              <Avatar name={note.author.full_name} size="sm" />
              <div className="min-w-0 flex-1 rounded-xl bg-slate-50 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-medium text-slate-700">{note.author.full_name}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">
                      {formatDateTime(locale, note.created_at)}
                    </span>
                    <button
                      onClick={() => {
                        if (window.confirm(t('notes.deleteConfirm'))) deleteNote.mutate(note.id);
                      }}
                      className="text-slate-300 hover:text-red-500"
                      aria-label={t('common.delete')}
                    >
                      <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482 41.03 41.03 0 00-2.365-.298V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
                <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{note.body}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

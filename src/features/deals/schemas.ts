import { z } from 'zod';

export const dealFormSchema = z.object({
  title: z.string().min(1),
  value: z.coerce.number().min(0),
  currency: z.enum(['UZS', 'USD', 'EUR']),
  contact_id: z.string().uuid(),
  stage_id: z.string().uuid().optional().nullable(),
  owner_id: z.string().uuid().optional().nullable(),
  expected_close_date: z.string().optional().nullable()
});

export interface DealFormInput {
  title?: string;
  value?: number;
  currency?: string;
  contact_id?: string;
  stage_id?: string | null;
  owner_id?: string | null;
  expected_close_date?: string | null;
}

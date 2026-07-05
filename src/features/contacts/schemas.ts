import { z } from 'zod';

export const contactFormSchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().optional().default(''),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().max(50).optional(),
  position: z.string().max(120).optional(),
  status: z.enum(['lead', 'active', 'inactive']),
  source: z.enum(['website', 'referral', 'cold_call', 'social', 'import']),
  company_id: z.string().uuid().optional().nullable(),
  owner_id: z.string().uuid().optional().nullable(),
  tag_ids: z.array(z.string().uuid()).default([])
});

export type ContactFormInput = {
  first_name: string;
  last_name?: string;
  email?: string | null;
  phone?: string | null;
  position?: string | null;
  status: string;
  source: string;
  company_id?: string | null;
  owner_id?: string | null;
  tag_ids?: string[];
};

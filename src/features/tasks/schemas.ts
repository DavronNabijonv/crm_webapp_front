import { z } from 'zod';

export const taskFormSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  due_date: z.string().optional().nullable(),
  priority: z.enum(['low', 'medium', 'high']),
  assignee_id: z.string().uuid().optional().nullable(),
  contact_id: z.string().uuid().optional().nullable(),
  deal_id: z.string().uuid().optional().nullable()
});

export interface TaskFormInput {
  title?: string;
  description?: string | null;
  due_date?: string | null;
  priority?: string;
  status?: string;
  assignee_id?: string | null;
  contact_id?: string | null;
  deal_id?: string | null;
}

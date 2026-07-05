// Shared API types — mirror backend pydantic schemas

export type Role = 'admin' | 'manager' | 'agent';
export type ContactStatus = 'lead' | 'active' | 'inactive';
export type ContactSource = 'website' | 'referral' | 'cold_call' | 'social' | 'import';
export type DealStatus = 'open' | 'won' | 'lost';
export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'pending' | 'completed';
export type StageKey = 'new' | 'contacted' | 'proposal' | 'negotiation' | 'won' | 'lost';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  locale: string;
  is_active: boolean;
  created_at: string;
}

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}

export interface Company {
  id: string;
  name: string;
  industry: string | null;
  website: string | null;
  phone: string | null;
  city: string | null;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  position: string | null;
  status: ContactStatus;
  source: ContactSource;
  company_id: string | null;
  company: Company | null;
  owner: User;
  tags: Tag[];
  created_at: string;
  updated_at: string;
}

export interface Stage {
  id: string;
  key: StageKey;
  sort_order: number;
  is_won: boolean;
  is_lost: boolean;
}

export interface ContactBrief {
  id: string;
  first_name: string;
  last_name: string;
}

export interface Deal {
  id: string;
  title: string;
  value: string; // decimal serialized as string
  currency: string;
  status: DealStatus;
  expected_close_date: string | null;
  closed_at: string | null;
  contact: ContactBrief;
  stage: Stage;
  owner: User;
  created_at: string;
  updated_at: string;
}

export interface StageHistoryEntry {
  id: string;
  from_stage: Stage | null;
  to_stage: Stage;
  changed_by: User;
  changed_at: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  completed_at: string | null;
  assignee: User;
  contact: ContactBrief | null;
  deal: { id: string; title: string } | null;
  created_at: string;
}

export interface Note {
  id: string;
  body: string;
  author: User;
  contact_id: string | null;
  deal_id: string | null;
  created_at: string;
}

export type ActivityType =
  | 'contact_created'
  | 'contact_updated'
  | 'deal_created'
  | 'deal_stage_changed'
  | 'deal_won'
  | 'deal_lost'
  | 'note_added'
  | 'task_created'
  | 'task_completed'
  | 'file_uploaded';

export interface Activity {
  id: string;
  type: ActivityType;
  actor: User;
  contact_id: string | null;
  deal_id: string | null;
  task_id: string | null;
  payload: Record<string, string>;
  created_at: string;
}

export interface Attachment {
  id: string;
  contact_id: string;
  filename: string;
  mime_type: string;
  size_bytes: number;
  uploaded_by: User;
  created_at: string;
}

export interface Invitation {
  id: string;
  email: string;
  role: Role;
  token: string;
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
}

export interface DashboardSummary {
  kpis: {
    total_contacts: number;
    open_deals: number;
    open_deals_value: number;
    won_this_month: number;
    revenue_this_month: number;
  };
  funnel: { stage: StageKey; count: number; value: number }[];
  recent_activity: Activity[];
  upcoming_tasks: Task[];
}

export interface WonLostPoint {
  month: string;
  won: number;
  lost: number;
  won_value: number;
  lost_value: number;
}

export interface ConversionRow {
  stage: StageKey;
  reached: number;
  conversion: number;
}

export interface CsvImportResult {
  imported: number;
  skipped: number;
  errors: string[];
}

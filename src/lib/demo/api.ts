/**
 * DEMO MODE API — replaces the network layer when NEXT_PUBLIC_DEMO_MODE=true.
 * Every endpoint the UI calls is served from the in-browser store, so the
 * frontend runs completely standalone (no backend, no database).
 */
import { ApiError } from '../api-client';
import type {
  Activity,
  Contact,
  Deal,
  Note,
  Role,
  Stage,
  Task,
  User
} from '../types';
import { DEMO_PASSWORD, getStore, newId } from './data';

interface DemoRequest {
  method?: string;
  body?: unknown;
  formData?: FormData;
  params?: Record<string, string | number | boolean | undefined | null>;
}

const CURRENT_KEY = 'crm_demo_user_id';
const delay = () => new Promise((r) => setTimeout(r, 120 + Math.random() * 180));
const nowIso = () => new Date().toISOString();

function currentUser(): User {
  const store = getStore();
  const id = typeof window !== 'undefined' ? localStorage.getItem(CURRENT_KEY) : null;
  const user = store.users.find((u) => u.id === id);
  if (!user) throw new ApiError(401, 'Not authenticated');
  return user;
}

const isAgent = (u: User) => u.role === 'agent';

function logActivity(partial: Omit<Activity, 'id' | 'created_at'>) {
  getStore().activities.unshift({ id: newId(), created_at: nowIso(), ...partial });
}

function tokenPair(user: User) {
  if (typeof window !== 'undefined') localStorage.setItem(CURRENT_KEY, user.id);
  return {
    access_token: `demo-access-${user.id}`,
    refresh_token: `demo-refresh-${user.id}`,
    token_type: 'bearer',
    user
  };
}

function page<T>(items: T[], params: DemoRequest['params']) {
  const p = Number(params?.page ?? 1);
  const size = Number(params?.page_size ?? 20);
  return { items: items.slice((p - 1) * size, p * size), total: items.length, page: p, page_size: size };
}

function applyStageChange(deal: Deal, stage: Stage, actor: User) {
  const store = getStore();
  store.history.push({
    id: newId(),
    deal_id: deal.id,
    from_stage: deal.stage,
    to_stage: stage,
    changed_by: actor,
    changed_at: nowIso()
  });
  deal.stage = stage;
  deal.status = stage.is_won ? 'won' : stage.is_lost ? 'lost' : 'open';
  deal.closed_at = stage.is_won || stage.is_lost ? nowIso() : null;
  deal.updated_at = nowIso();
  logActivity({
    type: stage.is_won ? 'deal_won' : stage.is_lost ? 'deal_lost' : 'deal_stage_changed',
    actor,
    contact_id: deal.contact.id,
    deal_id: deal.id,
    task_id: null,
    payload: { to_stage: stage.key, deal_title: deal.title }
  });
}

function dealsCsv(deals: Deal[]): string {
  const rows = [
    ['title', 'value', 'currency', 'status', 'stage', 'contact', 'owner', 'expected_close_date', 'closed_at', 'created_at']
  ];
  for (const d of deals) {
    rows.push([
      d.title,
      d.value,
      d.currency,
      d.status,
      d.stage.key,
      `${d.contact.first_name} ${d.contact.last_name}`,
      d.owner.full_name,
      d.expected_close_date ?? '',
      d.closed_at ?? '',
      d.created_at
    ]);
  }
  return rows.map((r) => r.map((v) => (v.includes(',') ? `"${v}"` : v)).join(',')).join('\n');
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function demoApi(path: string, opts: DemoRequest = {}): Promise<any> {
  await delay();
  const store = getStore();
  const method = (opts.method ?? 'GET').toUpperCase();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const body = (opts.body ?? {}) as any;
  const params = opts.params ?? {};
  const route = `${method} ${path}`;
  const seg = path.split('/').filter(Boolean);

  // ── Auth ───────────────────────────────────────────────────────────
  if (route === 'POST /auth/login') {
    const user = store.users.find((u) => u.email === String(body.email).toLowerCase());
    if (!user || body.password !== DEMO_PASSWORD || !user.is_active) {
      throw new ApiError(401, 'Invalid email or password');
    }
    return tokenPair(user);
  }
  if (route === 'POST /auth/refresh') return tokenPair(currentUser());
  if (route === 'POST /auth/logout') {
    if (typeof window !== 'undefined') localStorage.removeItem(CURRENT_KEY);
    return undefined;
  }
  if (method === 'GET' && seg[0] === 'auth' && seg[1] === 'invitations') {
    const inv = store.invitations.find((i) => i.token === seg[2] && !i.accepted_at);
    if (!inv) throw new ApiError(404, 'Invitation not found or expired');
    return { email: inv.email, role: inv.role };
  }
  if (route === 'POST /auth/accept-invite') {
    const inv = store.invitations.find((i) => i.token === body.token && !i.accepted_at);
    if (!inv) throw new ApiError(400, 'Invitation not found or expired');
    inv.accepted_at = nowIso();
    const user: User = {
      id: newId(),
      email: inv.email,
      full_name: String(body.full_name),
      role: inv.role,
      locale: 'uz',
      is_active: true,
      created_at: nowIso()
    };
    store.users.push(user);
    return tokenPair(user);
  }

  // Everything below requires a signed-in demo user
  const me = currentUser();

  // ── Users & team ───────────────────────────────────────────────────
  if (route === 'GET /users/me') return me;
  if (route === 'PATCH /users/me') {
    if (body.full_name) me.full_name = body.full_name;
    if (body.locale) me.locale = body.locale;
    return me;
  }
  if (route === 'GET /users') return store.users.filter((u) => u.is_active);
  if (route === 'GET /team') return store.users;
  if (method === 'PATCH' && seg[0] === 'team' && seg.length === 2) {
    const member = store.users.find((u) => u.id === seg[1]);
    if (!member) throw new ApiError(404, 'User not found');
    if (body.role) member.role = body.role as Role;
    if (body.is_active !== undefined) member.is_active = Boolean(body.is_active);
    return member;
  }
  if (route === 'GET /team/invitations') return store.invitations.filter((i) => !i.accepted_at);
  if (route === 'POST /team/invitations') {
    const inv = {
      id: newId(),
      email: String(body.email).toLowerCase(),
      role: (body.role ?? 'agent') as Role,
      token: newId().replace(/-/g, ''),
      expires_at: new Date(Date.now() + 7 * 86_400_000).toISOString(),
      accepted_at: null,
      created_at: nowIso()
    };
    store.invitations.unshift(inv);
    return inv;
  }
  if (method === 'DELETE' && seg[0] === 'team' && seg[1] === 'invitations') {
    store.invitations = store.invitations.filter((i) => i.id !== seg[2]);
    return undefined;
  }

  // ── Reference data ─────────────────────────────────────────────────
  if (route === 'GET /stages') return [...store.stages].sort((a, b) => a.sort_order - b.sort_order);
  if (route === 'GET /companies') return [...store.companies].sort((a, b) => a.name.localeCompare(b.name));
  if (route === 'POST /companies') {
    const company = { id: newId(), website: null, phone: null, city: null, industry: null, ...body };
    store.companies.push(company);
    return company;
  }
  if (route === 'GET /tags') return store.tags;
  if (route === 'POST /tags') {
    const existing = store.tags.find((t) => t.name === body.name);
    if (existing) return existing;
    const tag = { id: newId(), name: String(body.name), color: String(body.color ?? 'gray') };
    store.tags.push(tag);
    return tag;
  }

  // ── Contacts ───────────────────────────────────────────────────────
  if (route === 'GET /contacts') {
    let items = store.contacts.filter((c) => !isAgent(me) || c.owner.id === me.id);
    const search = String(params.search ?? '').toLowerCase();
    if (search) {
      items = items.filter((c) =>
        `${c.first_name} ${c.last_name} ${c.email ?? ''} ${c.phone ?? ''}`.toLowerCase().includes(search)
      );
    }
    if (params.status) items = items.filter((c) => c.status === params.status);
    if (params.tag_id) items = items.filter((c) => c.tags.some((t) => t.id === params.tag_id));
    if (params.owner_id) items = items.filter((c) => c.owner.id === params.owner_id);
    items = [...items].sort((a, b) => b.created_at.localeCompare(a.created_at));
    return page(items, params);
  }
  if (route === 'POST /contacts') {
    const owner = (!isAgent(me) && store.users.find((u) => u.id === body.owner_id)) || me;
    const contact: Contact = {
      id: newId(),
      first_name: body.first_name,
      last_name: body.last_name ?? '',
      email: body.email ?? null,
      phone: body.phone ?? null,
      position: body.position ?? null,
      status: body.status ?? 'lead',
      source: body.source ?? 'website',
      company_id: body.company_id ?? null,
      company: store.companies.find((c) => c.id === body.company_id) ?? null,
      owner,
      tags: store.tags.filter((t) => (body.tag_ids ?? []).includes(t.id)),
      created_at: nowIso(),
      updated_at: nowIso()
    };
    store.contacts.unshift(contact);
    logActivity({ type: 'contact_created', actor: me, contact_id: contact.id, deal_id: null, task_id: null, payload: {} });
    return contact;
  }
  if (seg[0] === 'contacts' && seg.length >= 2 && seg[1] !== 'import-csv') {
    const contact = store.contacts.find((c) => c.id === seg[1]);
    if (!contact) throw new ApiError(404, 'Contact not found');
    if (isAgent(me) && contact.owner.id !== me.id) throw new ApiError(403, 'Not your contact');

    if (seg.length === 2 && method === 'GET') return contact;
    if (seg.length === 2 && method === 'PATCH') {
      const fields = ['first_name', 'last_name', 'email', 'phone', 'position', 'status', 'source'] as const;
      for (const f of fields) {
        if (body[f] !== undefined) (contact as unknown as Record<string, unknown>)[f] = body[f];
      }
      if (body.company_id !== undefined) {
        contact.company_id = body.company_id;
        contact.company = store.companies.find((c) => c.id === body.company_id) ?? null;
      }
      if (body.owner_id && !isAgent(me)) {
        contact.owner = store.users.find((u) => u.id === body.owner_id) ?? contact.owner;
      }
      if (body.tag_ids) contact.tags = store.tags.filter((t) => body.tag_ids.includes(t.id));
      contact.updated_at = nowIso();
      logActivity({ type: 'contact_updated', actor: me, contact_id: contact.id, deal_id: null, task_id: null, payload: {} });
      return contact;
    }
    if (seg.length === 2 && method === 'DELETE') {
      store.contacts = store.contacts.filter((c) => c.id !== contact.id);
      store.deals = store.deals.filter((d) => d.contact.id !== contact.id);
      store.notes = store.notes.filter((n) => n.contact_id !== contact.id);
      return undefined;
    }
    if (seg[2] === 'deals') {
      return store.deals
        .filter((d) => d.contact.id === contact.id)
        .sort((a, b) => b.created_at.localeCompare(a.created_at));
    }
    if (seg[2] === 'attachments' && method === 'GET') {
      return store.attachments.filter((a) => a.contact_id === contact.id);
    }
    if (seg[2] === 'attachments' && method === 'POST') {
      const file = opts.formData?.get('file') as File | null;
      const attachment = {
        id: newId(),
        contact_id: contact.id,
        filename: file?.name ?? 'file.txt',
        mime_type: file?.type || 'application/octet-stream',
        size_bytes: file?.size ?? 0,
        uploaded_by: me,
        created_at: nowIso()
      };
      store.attachments.unshift(attachment);
      logActivity({
        type: 'file_uploaded', actor: me, contact_id: contact.id, deal_id: null, task_id: null,
        payload: { filename: attachment.filename }
      });
      return attachment;
    }
  }
  if (route === 'POST /contacts/import-csv') {
    const file = opts.formData?.get('file') as File | null;
    if (!file) return { imported: 0, skipped: 0, errors: ['No file'] };
    const text = await file.text();
    const [header, ...lines] = text.split(/\r?\n/).filter(Boolean);
    const cols = header.split(',').map((h) => h.trim());
    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];
    lines.forEach((line, idx) => {
      const values = line.split(',');
      const row = Object.fromEntries(cols.map((c, i) => [c, (values[i] ?? '').trim()]));
      if (!row.first_name) {
        skipped += 1;
        errors.push(`Row ${idx + 2}: missing first_name`);
        return;
      }
      store.contacts.unshift({
        id: newId(),
        first_name: row.first_name,
        last_name: row.last_name ?? '',
        email: row.email || null,
        phone: row.phone || null,
        position: row.position || null,
        status: (['lead', 'active', 'inactive'].includes(row.status) ? row.status : 'lead') as Contact['status'],
        source: 'import',
        company_id: null,
        company: null,
        owner: me,
        tags: [],
        created_at: nowIso(),
        updated_at: nowIso()
      });
      imported += 1;
    });
    return { imported, skipped, errors: errors.slice(0, 20) };
  }

  // ── Attachments (flat routes) ──────────────────────────────────────
  if (seg[0] === 'attachments') {
    const attachment = store.attachments.find((a) => a.id === seg[1]);
    if (!attachment) throw new ApiError(404, 'Attachment not found');
    if (seg[2] === 'download') return `Demo file: ${attachment.filename}`;
    if (method === 'DELETE') {
      store.attachments = store.attachments.filter((a) => a.id !== attachment.id);
      return undefined;
    }
  }

  // ── Deals ──────────────────────────────────────────────────────────
  if (route === 'GET /deals') {
    let items = store.deals.filter((d) => !isAgent(me) || d.owner.id === me.id);
    const search = String(params.search ?? '').toLowerCase();
    if (search) items = items.filter((d) => d.title.toLowerCase().includes(search));
    if (params.owner_id) items = items.filter((d) => d.owner.id === params.owner_id);
    items = [...items].sort((a, b) => b.created_at.localeCompare(a.created_at));
    return page(items, { page_size: 500, ...params });
  }
  if (route === 'POST /deals') {
    const stage = store.stages.find((s) => s.id === body.stage_id) ?? store.stages[0];
    const contact = store.contacts.find((c) => c.id === body.contact_id);
    if (!contact) throw new ApiError(400, 'Unknown contact');
    const owner = (!isAgent(me) && store.users.find((u) => u.id === body.owner_id)) || me;
    const deal: Deal = {
      id: newId(),
      title: body.title,
      value: String(body.value ?? 0),
      currency: body.currency ?? 'UZS',
      status: 'open',
      expected_close_date: body.expected_close_date ?? null,
      closed_at: null,
      contact: { id: contact.id, first_name: contact.first_name, last_name: contact.last_name },
      stage,
      owner,
      created_at: nowIso(),
      updated_at: nowIso()
    };
    store.deals.unshift(deal);
    store.history.push({
      id: newId(), deal_id: deal.id, from_stage: null, to_stage: stage, changed_by: me, changed_at: nowIso()
    });
    logActivity({
      type: 'deal_created', actor: me, contact_id: contact.id, deal_id: deal.id, task_id: null,
      payload: { deal_title: deal.title }
    });
    return deal;
  }
  if (seg[0] === 'deals' && seg.length >= 2) {
    const deal = store.deals.find((d) => d.id === seg[1]);
    if (!deal) throw new ApiError(404, 'Deal not found');
    if (isAgent(me) && deal.owner.id !== me.id) throw new ApiError(403, 'Not your deal');

    if (seg.length === 2 && method === 'GET') return deal;
    if (seg.length === 2 && method === 'PATCH') {
      if (body.title !== undefined) deal.title = body.title;
      if (body.value !== undefined) deal.value = String(body.value);
      if (body.currency !== undefined) deal.currency = body.currency;
      if (body.expected_close_date !== undefined) deal.expected_close_date = body.expected_close_date;
      if (body.contact_id) {
        const contact = store.contacts.find((c) => c.id === body.contact_id);
        if (contact) deal.contact = { id: contact.id, first_name: contact.first_name, last_name: contact.last_name };
      }
      if (body.owner_id && !isAgent(me)) {
        deal.owner = store.users.find((u) => u.id === body.owner_id) ?? deal.owner;
      }
      if (body.stage_id && body.stage_id !== deal.stage.id) {
        const stage = store.stages.find((s) => s.id === body.stage_id);
        if (!stage) throw new ApiError(400, 'Unknown pipeline stage');
        applyStageChange(deal, stage, me);
      } else {
        deal.updated_at = nowIso();
      }
      return deal;
    }
    if (seg.length === 2 && method === 'DELETE') {
      store.deals = store.deals.filter((d) => d.id !== deal.id);
      return undefined;
    }
    if (seg[2] === 'history') {
      return store.history
        .filter((h) => h.deal_id === deal.id)
        .sort((a, b) => b.changed_at.localeCompare(a.changed_at));
    }
  }

  // ── Tasks ──────────────────────────────────────────────────────────
  if (route === 'GET /tasks') {
    let items = store.tasks.filter((t) => !isAgent(me) || t.assignee.id === me.id);
    if (params.status) items = items.filter((t) => t.status === params.status);
    if (params.contact_id) items = items.filter((t) => t.contact?.id === params.contact_id);
    if (params.deal_id) items = items.filter((t) => t.deal?.id === params.deal_id);
    items = [...items].sort((a, b) => (a.due_date ?? '9999').localeCompare(b.due_date ?? '9999'));
    return page(items, { page_size: 200, ...params });
  }
  if (route === 'POST /tasks') {
    const assignee = (!isAgent(me) && store.users.find((u) => u.id === body.assignee_id)) || me;
    const contact = store.contacts.find((c) => c.id === body.contact_id) ?? null;
    const deal = store.deals.find((d) => d.id === body.deal_id) ?? null;
    const task: Task = {
      id: newId(),
      title: body.title,
      description: body.description ?? null,
      due_date: body.due_date ?? null,
      priority: body.priority ?? 'medium',
      status: 'pending',
      completed_at: null,
      assignee,
      contact: contact ? { id: contact.id, first_name: contact.first_name, last_name: contact.last_name } : null,
      deal: deal ? { id: deal.id, title: deal.title } : null,
      created_at: nowIso()
    };
    store.tasks.unshift(task);
    logActivity({
      type: 'task_created', actor: me, contact_id: contact?.id ?? null, deal_id: deal?.id ?? null,
      task_id: task.id, payload: { task_title: task.title }
    });
    return task;
  }
  if (seg[0] === 'tasks' && seg.length === 2) {
    const task = store.tasks.find((t) => t.id === seg[1]);
    if (!task) throw new ApiError(404, 'Task not found');
    if (method === 'PATCH') {
      const fields = ['title', 'description', 'due_date', 'priority'] as const;
      for (const f of fields) {
        if (body[f] !== undefined) (task as unknown as Record<string, unknown>)[f] = body[f];
      }
      if (body.assignee_id && !isAgent(me)) {
        task.assignee = store.users.find((u) => u.id === body.assignee_id) ?? task.assignee;
      }
      if (body.status && body.status !== task.status) {
        task.status = body.status;
        task.completed_at = body.status === 'completed' ? nowIso() : null;
        if (body.status === 'completed') {
          logActivity({
            type: 'task_completed', actor: me, contact_id: task.contact?.id ?? null,
            deal_id: task.deal?.id ?? null, task_id: task.id, payload: { task_title: task.title }
          });
        }
      }
      return task;
    }
    if (method === 'DELETE') {
      store.tasks = store.tasks.filter((t) => t.id !== task.id);
      return undefined;
    }
  }

  // ── Notes & activities ─────────────────────────────────────────────
  if (route === 'GET /notes') {
    return store.notes
      .filter(
        (n) =>
          (!params.contact_id || n.contact_id === params.contact_id) &&
          (!params.deal_id || n.deal_id === params.deal_id) &&
          (params.contact_id || params.deal_id)
      )
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
  }
  if (route === 'POST /notes') {
    const note: Note = {
      id: newId(),
      body: body.body,
      author: me,
      contact_id: body.contact_id ?? null,
      deal_id: body.deal_id ?? null,
      created_at: nowIso()
    };
    store.notes.unshift(note);
    logActivity({
      type: 'note_added', actor: me, contact_id: note.contact_id, deal_id: note.deal_id,
      task_id: null, payload: { preview: note.body.slice(0, 120) }
    });
    return note;
  }
  if (seg[0] === 'notes' && method === 'DELETE') {
    store.notes = store.notes.filter((n) => n.id !== seg[1]);
    return undefined;
  }
  if (route === 'GET /activities') {
    let items = store.activities;
    if (params.contact_id) items = items.filter((a) => a.contact_id === params.contact_id);
    else if (params.deal_id) items = items.filter((a) => a.deal_id === params.deal_id);
    else if (isAgent(me)) items = items.filter((a) => a.actor.id === me.id);
    return items.slice(0, Number(params.limit ?? 30));
  }

  // ── Dashboard & reports ────────────────────────────────────────────
  if (route === 'GET /dashboard/summary') {
    const myContacts = store.contacts.filter((c) => !isAgent(me) || c.owner.id === me.id);
    const myDeals = store.deals.filter((d) => !isAgent(me) || d.owner.id === me.id);
    const myTasks = store.tasks.filter((t) => !isAgent(me) || t.assignee.id === me.id);
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const open = myDeals.filter((d) => d.status === 'open');
    const wonMonth = myDeals.filter(
      (d) => d.status === 'won' && d.closed_at && new Date(d.closed_at) >= monthStart
    );
    const funnel = store.stages
      .filter((s) => !s.is_won && !s.is_lost)
      .map((s) => {
        const inStage = open.filter((d) => d.stage.id === s.id);
        return {
          stage: s.key,
          count: inStage.length,
          value: inStage.reduce((sum, d) => sum + parseFloat(d.value), 0)
        };
      })
      .filter((f) => f.count > 0);
    const weekAhead = Date.now() + 7 * 86_400_000;
    return {
      kpis: {
        total_contacts: myContacts.length,
        open_deals: open.length,
        open_deals_value: open.reduce((s, d) => s + parseFloat(d.value), 0),
        won_this_month: wonMonth.length,
        revenue_this_month: wonMonth.reduce((s, d) => s + parseFloat(d.value), 0)
      },
      funnel,
      recent_activity: (isAgent(me)
        ? store.activities.filter((a) => a.actor.id === me.id)
        : store.activities
      ).slice(0, 10),
      upcoming_tasks: myTasks
        .filter((t) => t.status === 'pending' && t.due_date && new Date(t.due_date).getTime() <= weekAhead)
        .sort((a, b) => (a.due_date ?? '').localeCompare(b.due_date ?? ''))
        .slice(0, 8)
    };
  }
  if (route === 'GET /reports/won-lost') {
    const myDeals = store.deals.filter(
      (d) => (!isAgent(me) || d.owner.id === me.id) && d.closed_at && d.status !== 'open'
    );
    const byMonth = new Map<string, { month: string; won: number; lost: number; won_value: number; lost_value: number }>();
    for (const d of myDeals) {
      const key = d.closed_at!.slice(0, 7);
      const entry = byMonth.get(key) ?? { month: key, won: 0, lost: 0, won_value: 0, lost_value: 0 };
      if (d.status === 'won') {
        entry.won += 1;
        entry.won_value += parseFloat(d.value);
      } else {
        entry.lost += 1;
        entry.lost_value += parseFloat(d.value);
      }
      byMonth.set(key, entry);
    }
    return [...byMonth.values()].sort((a, b) => a.month.localeCompare(b.month));
  }
  if (route === 'GET /reports/conversion') {
    const myDealIds = new Set(
      store.deals.filter((d) => !isAgent(me) || d.owner.id === me.id).map((d) => d.id)
    );
    return store.stages.map((s) => {
      const reached = new Set(
        store.history.filter((h) => h.to_stage.id === s.id && myDealIds.has(h.deal_id)).map((h) => h.deal_id)
      ).size;
      return {
        stage: s.key,
        reached,
        conversion: myDealIds.size ? Math.round((reached / myDealIds.size) * 1000) / 10 : 0
      };
    });
  }
  if (route === 'GET /reports/export.csv') {
    return dealsCsv(store.deals.filter((d) => !isAgent(me) || d.owner.id === me.id));
  }

  throw new ApiError(404, `Demo mode: unhandled route ${route}`);
}

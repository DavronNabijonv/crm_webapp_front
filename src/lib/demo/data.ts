/**
 * DEMO MODE dataset — an in-browser replica of backend/seed_demo.py.
 * Used when NEXT_PUBLIC_DEMO_MODE=true so the frontend runs fully standalone
 * (e.g. deployed alone on Vercel as a marketplace preview).
 *
 * Data lives in memory for the browser session; a page reload resets it.
 */
import type {
  Activity,
  Attachment,
  Company,
  Contact,
  Deal,
  Invitation,
  Note,
  Stage,
  StageHistoryEntry,
  Tag,
  Task,
  User
} from '../types';

// Deterministic PRNG so every visitor sees the same believable dataset
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(42);
const pick = <T,>(arr: T[]): T => arr[Math.floor(rand() * arr.length)];
const int = (min: number, max: number) => min + Math.floor(rand() * (max - min + 1));

const DAY = 86_400_000;
const NOW = Date.now();
const daysAgo = (d: number) => new Date(NOW - d * DAY - rand() * 12 * 3_600_000).toISOString();
const hoursAhead = (h: number) => new Date(NOW + h * 3_600_000).toISOString();

export function newId(): string {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `id-${Math.random().toString(36).slice(2)}`;
}

// ── Fixed reference data ─────────────────────────────────────────────

export const DEMO_PASSWORD = 'demo1234';

const users: User[] = [
  { id: 'u-admin', email: 'admin@demo.crm', full_name: "Akmal Yo'ldoshev", role: 'admin', locale: 'uz', is_active: true, created_at: daysAgo(200) },
  { id: 'u-manager', email: 'manager@demo.crm', full_name: 'Мария Иванова', role: 'manager', locale: 'ru', is_active: true, created_at: daysAgo(180) },
  { id: 'u-agent', email: 'agent@demo.crm', full_name: 'Diyor Abdullayev', role: 'agent', locale: 'uz', is_active: true, created_at: daysAgo(150) },
  { id: 'u-agent2', email: 'agent2@demo.crm', full_name: 'John Miller', role: 'agent', locale: 'en', is_active: true, created_at: daysAgo(120) }
];

const stages: Stage[] = [
  { id: 's-new', key: 'new', sort_order: 1, is_won: false, is_lost: false },
  { id: 's-contacted', key: 'contacted', sort_order: 2, is_won: false, is_lost: false },
  { id: 's-proposal', key: 'proposal', sort_order: 3, is_won: false, is_lost: false },
  { id: 's-negotiation', key: 'negotiation', sort_order: 4, is_won: false, is_lost: false },
  { id: 's-won', key: 'won', sort_order: 5, is_won: true, is_lost: false },
  { id: 's-lost', key: 'lost', sort_order: 6, is_won: false, is_lost: true }
];

const tags: Tag[] = [
  { id: 't-vip', name: 'VIP', color: 'amber' },
  { id: 't-hot', name: 'Hot lead', color: 'red' },
  { id: 't-partner', name: 'Partner', color: 'blue' },
  { id: 't-export', name: 'Export', color: 'green' },
  { id: 't-retail', name: 'Retail', color: 'purple' },
  { id: 't-b2b', name: 'B2B', color: 'cyan' }
];

const COMPANY_ROWS: [string, string, string][] = [
  ['Buxoro Agro Servis', 'Agriculture', 'Bukhara'],
  ['Toshkent Textile Group', 'Manufacturing', 'Tashkent'],
  ['ООО «ТехноСфера»', 'IT Services', 'Tashkent'],
  ['Samarqand Travel', 'Tourism', 'Samarkand'],
  ['Brightline Media', 'Marketing', 'London'],
  ['ООО «СтройИнвест»', 'Construction', 'Moscow'],
  ["Ipak Yo'li Logistics", 'Logistics', 'Tashkent'],
  ['Nordwind Consulting', 'Consulting', 'Berlin'],
  ['Andijon Mebel', 'Furniture', 'Andijan'],
  ['ЗАО «МедТехника»', 'Healthcare', 'Saint Petersburg'],
  ['Silk Road Ventures', 'Finance', 'Dubai'],
  ["Farg'ona Food Distribution", 'FMCG', 'Fergana']
];

const PEOPLE: [string, string, string][] = [
  ['Jasur', 'Karimov', 'Direktor'],
  ['Dilnoza', 'Rahimova', 'Marketing menejeri'],
  ['Bobur', 'Tursunov', "Savdo bo'limi boshlig'i"],
  ['Gulnora', 'Yusupova', 'Moliyachi'],
  ['Sardor', 'Aliyev', 'IT direktor'],
  ['Malika', 'Ismoilova', 'HR menejer'],
  ['Otabek', 'Nazarov', "Ta'minot menejeri"],
  ['Zilola', 'Qodirova', 'Loyiha rahbari'],
  ['Shohruh', 'Mirzayev', 'Bosh muhandis'],
  ['Nilufar', 'Sattorova', 'Administrator'],
  ['Елена', 'Соколова', 'Коммерческий директор'],
  ['Дмитрий', 'Волков', 'Руководитель отдела продаж'],
  ['Анна', 'Кузнецова', 'Менеджер по закупкам'],
  ['Сергей', 'Морозов', 'Технический директор'],
  ['Ольга', 'Павлова', 'Главный бухгалтер'],
  ['Игорь', 'Лебедев', 'Директор по развитию'],
  ['Наталья', 'Смирнова', 'Маркетолог'],
  ['Андрей', 'Козлов', 'Владелец'],
  ['Michael', 'Reeves', 'CEO'],
  ['Sarah', 'Thompson', 'Head of Procurement'],
  ['James', 'Walker', 'Operations Manager'],
  ['Emily', 'Carter', 'Marketing Director'],
  ['David', 'Brooks', 'CTO'],
  ['Laura', 'Mitchell', 'Business Development'],
  ['Aziz', 'Hakimov', 'Founder'],
  ['Kamola', 'Ergasheva', 'Sotuv menejeri'],
  ['Виктор', 'Романов', 'Заместитель директора'],
  ['Umid', 'Xoliqov', 'Hamkorlik bo‘yicha menejer'],
  ['Rachel', 'Adams', 'Account Executive'],
  ['Тимур', 'Ахмедов', 'Продакт-менеджер']
];

const DEAL_TITLES = [
  'CRM tizimini joriy etish',
  'Yillik texnik xizmat shartnomasi',
  'Ombor avtomatlashtirish loyihasi',
  'Korporativ sayt yaratish',
  'Logistika xizmatlari shartnomasi',
  'Поставка серверного оборудования',
  'Внедрение ERP-системы',
  'Годовой контракт на рекламу',
  'Модернизация производственной линии',
  'Консалтинг по цифровизации',
  'Website redesign project',
  'Annual SaaS subscription',
  'Marketing automation rollout',
  'Cloud migration phase 1',
  'Enterprise support package',
  'Mobil ilova ishlab chiqish',
  'Обучение отдела продаж',
  'Data analytics platform',
  'Eksport hamkorligi shartnomasi',
  'Оснащение нового офиса',
  'Security audit engagement',
  "Chakana savdo tarmog'ini kengaytirish",
  'Партнёрское соглашение',
  'Hardware procurement Q4',
  'Reklama kampaniyasi — kuz mavsumi'
];

const NOTE_BODIES = [
  "Mijoz narx bo'yicha chegirma so'radi, 10% taklif qilindi.",
  "Telefon orqali gaplashdik — keyingi haftada uchrashuv belgilandi.",
  'Shartnoma loyihasi yuborildi, javob kutilmoqda.',
  "Mijoz raqobatchilar taklifini ham ko'rib chiqmoqda.",
  "Texnik talablar ro'yxati olindi, jamoaga yuborildi.",
  'Клиент запросил коммерческое предложение до пятницы.',
  'Встреча прошла успешно, обсудили этапы внедрения.',
  'Ждём согласования бюджета со стороны финансового отдела.',
  'Отправлен договор на юридическую проверку.',
  'Клиент доволен пилотным проектом, готов расширять сотрудничество.',
  'Sent follow-up email with updated pricing.',
  'Demo call went well — decision expected next week.',
  'Client asked for case studies from similar industries.',
  'Negotiating payment terms, they prefer quarterly billing.',
  'Waiting for legal review on their side.',
  "Taklif taqdimoti o'tkazildi, savollar ko'p bo'ldi.",
  'Обсудили сроки поставки — нужно уложиться до конца квартала.',
  'Introduced to their CTO, technical evaluation starts Monday.'
];

const TASK_ROWS: [string, Task['priority']][] = [
  ["Qo'ng'iroq qilish — taklif bo'yicha fikrini so'rash", 'high'],
  ['Shartnoma loyihasini tayyorlash', 'high'],
  ['Taqdimot slaydlarini yangilash', 'medium'],
  ['Hisob-faktura yuborish', 'medium'],
  ["Uchrashuvga tayyorgarlik ko'rish", 'low'],
  ['Позвонить по поводу продления контракта', 'high'],
  ['Отправить коммерческое предложение', 'high'],
  ['Подготовить презентацию для встречи', 'medium'],
  ['Согласовать сроки поставки', 'medium'],
  ['Обновить данные клиента в системе', 'low'],
  ['Follow up on proposal', 'high'],
  ['Schedule demo call', 'high'],
  ['Send updated pricing sheet', 'medium'],
  ['Prepare quarterly review deck', 'medium'],
  ['Check in after onboarding', 'low']
];

// ── Store ────────────────────────────────────────────────────────────

export interface DemoStore {
  users: User[];
  stages: Stage[];
  tags: Tag[];
  companies: Company[];
  contacts: Contact[];
  deals: Deal[];
  history: (StageHistoryEntry & { deal_id: string })[];
  tasks: Task[];
  notes: Note[];
  activities: Activity[];
  attachments: Attachment[];
  invitations: Invitation[];
}

function buildStore(): DemoStore {
  const companies: Company[] = COMPANY_ROWS.map(([name, industry, city], i) => ({
    id: `co-${i}`,
    name,
    industry,
    website: null,
    phone: `+998 9${int(0, 9)} ${int(100, 999)} ${int(10, 99)} ${int(10, 99)}`,
    city
  }));

  const activities: Activity[] = [];
  const pushActivity = (a: Omit<Activity, 'id'>) => activities.push({ id: newId(), ...a });

  const contacts: Contact[] = PEOPLE.map(([first, last, position], i) => {
    const owner = users[i % users.length];
    const created = daysAgo(int(5, 120));
    const contact: Contact = {
      id: `ct-${i}`,
      first_name: first,
      last_name: last,
      position,
      email: `contact${i}@example.com`,
      phone: `+998 9${int(0, 9)} ${int(100, 999)} ${int(10, 99)} ${int(10, 99)}`,
      status: pick(['lead', 'lead', 'active', 'active', 'active', 'inactive']),
      source: pick(['website', 'referral', 'cold_call', 'social', 'import']),
      company_id: rand() > 0.15 ? pick(companies).id : null,
      company: null,
      owner,
      tags: rand() > 0.5 ? [pick(tags)] : rand() > 0.5 ? [tags[int(0, 2)], tags[int(3, 5)]] : [],
      created_at: created,
      updated_at: created
    };
    contact.company = companies.find((c) => c.id === contact.company_id) ?? null;
    pushActivity({
      type: 'contact_created',
      actor: owner,
      contact_id: contact.id,
      deal_id: null,
      task_id: null,
      payload: {},
      created_at: created
    });
    return contact;
  });

  const openStages = stages.slice(0, 4);
  const deals: Deal[] = [];
  const history: DemoStore['history'] = [];

  DEAL_TITLES.forEach((title, i) => {
    const contact = pick(contacts);
    const currency = pick(['UZS', 'UZS', 'UZS', 'USD', 'USD', 'EUR']);
    const value =
      currency === 'UZS' ? int(5_000_000, 250_000_000) : int(1_000, 50_000);
    const createdDays = int(3, 100);
    const progress = int(0, 5);
    const walk = openStages.slice(0, Math.min(progress + 1, 4));
    const outcome = progress >= 4 ? (rand() < 0.55 ? stages[4] : stages[5]) : null;
    const finalStage = outcome ?? walk[walk.length - 1];

    const deal: Deal = {
      id: `d-${i}`,
      title,
      value: `${value}.00`,
      currency,
      status: finalStage.is_won ? 'won' : finalStage.is_lost ? 'lost' : 'open',
      expected_close_date: new Date(NOW + int(-10, 60) * DAY).toISOString().slice(0, 10),
      closed_at: null,
      contact: { id: contact.id, first_name: contact.first_name, last_name: contact.last_name },
      stage: finalStage,
      owner: contact.owner,
      created_at: daysAgo(createdDays),
      updated_at: daysAgo(Math.max(0, createdDays - 10))
    };

    let t = createdDays;
    let prev: Stage | null = null;
    for (const stage of outcome ? [...walk, outcome] : walk) {
      const at = daysAgo(Math.max(0, t));
      history.push({
        id: newId(),
        deal_id: deal.id,
        from_stage: prev,
        to_stage: stage,
        changed_by: deal.owner,
        changed_at: at
      });
      if (stage.is_won || stage.is_lost) {
        deal.closed_at = at;
        pushActivity({
          type: stage.is_won ? 'deal_won' : 'deal_lost',
          actor: deal.owner,
          contact_id: contact.id,
          deal_id: deal.id,
          task_id: null,
          payload: { to_stage: stage.key, deal_title: deal.title },
          created_at: at
        });
      } else if (prev) {
        pushActivity({
          type: 'deal_stage_changed',
          actor: deal.owner,
          contact_id: contact.id,
          deal_id: deal.id,
          task_id: null,
          payload: { to_stage: stage.key, deal_title: deal.title },
          created_at: at
        });
      }
      prev = stage;
      t -= int(2, 14);
    }
    pushActivity({
      type: 'deal_created',
      actor: deal.owner,
      contact_id: contact.id,
      deal_id: deal.id,
      task_id: null,
      payload: { deal_title: deal.title },
      created_at: deal.created_at
    });
    deals.push(deal);
  });

  const notes: Note[] = Array.from({ length: 60 }, (_, i) => {
    const body = pick(NOTE_BODIES);
    const author = pick(users);
    const created = daysAgo(int(0, 90));
    const onContact = rand() < 0.5;
    const contact = onContact ? pick(contacts) : null;
    const deal = onContact ? null : pick(deals);
    pushActivity({
      type: 'note_added',
      actor: author,
      contact_id: contact?.id ?? null,
      deal_id: deal?.id ?? null,
      task_id: null,
      payload: { preview: body.slice(0, 120) },
      created_at: created
    });
    return {
      id: `n-${i}`,
      body,
      author,
      contact_id: contact?.id ?? null,
      deal_id: deal?.id ?? null,
      created_at: created
    };
  });

  const tasks: Task[] = Array.from({ length: 40 }, (_, i) => {
    const [title, priority] = pick(TASK_ROWS);
    const assignee = pick(users);
    let due: string;
    let status: Task['status'] = 'pending';
    if (i < 8) due = daysAgo(int(1, 10)); // overdue
    else if (i < 14) due = hoursAhead(int(1, 30)); // today / tomorrow
    else if (i < 28) due = hoursAhead(int(48, 21 * 24)); // upcoming
    else {
      due = daysAgo(int(2, 30));
      status = 'completed';
    }
    const r = rand();
    const contact = r < 0.4 ? pick(contacts) : null;
    const deal = !contact && r < 0.7 ? pick(deals) : null;
    if (status === 'completed') {
      pushActivity({
        type: 'task_completed',
        actor: assignee,
        contact_id: contact?.id ?? null,
        deal_id: deal?.id ?? null,
        task_id: `tk-${i}`,
        payload: { task_title: title },
        created_at: due
      });
    }
    return {
      id: `tk-${i}`,
      title,
      description: null,
      due_date: due,
      priority,
      status,
      completed_at: status === 'completed' ? due : null,
      assignee,
      contact: contact
        ? { id: contact.id, first_name: contact.first_name, last_name: contact.last_name }
        : null,
      deal: deal ? { id: deal.id, title: deal.title } : null,
      created_at: daysAgo(int(10, 60))
    };
  });

  activities.sort((a, b) => b.created_at.localeCompare(a.created_at));

  return {
    users,
    stages,
    tags,
    companies,
    contacts,
    deals,
    history,
    tasks,
    notes,
    activities,
    attachments: [],
    invitations: []
  };
}

let store: DemoStore | null = null;

export function getStore(): DemoStore {
  if (!store) store = buildStore();
  return store;
}

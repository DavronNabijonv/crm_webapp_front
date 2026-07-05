import type { TokenPair } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1';

/**
 * DEMO MODE: when NEXT_PUBLIC_DEMO_MODE=true every request is served from an
 * in-browser mock store (src/lib/demo/) — no backend or database needed.
 * Use this for standalone marketplace previews (e.g. a Vercel deployment of
 * the frontend only).
 */
export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

const ACCESS_KEY = 'crm_access_token';
const REFRESH_KEY = 'crm_refresh_token';

export class ApiError extends Error {
  constructor(
    public status: number,
    public detail: string
  ) {
    super(detail);
  }
}

export const tokenStore = {
  getAccess: () => (typeof window === 'undefined' ? null : localStorage.getItem(ACCESS_KEY)),
  getRefresh: () => (typeof window === 'undefined' ? null : localStorage.getItem(REFRESH_KEY)),
  set(pair: { access_token: string; refresh_token: string }) {
    localStorage.setItem(ACCESS_KEY, pair.access_token);
    localStorage.setItem(REFRESH_KEY, pair.refresh_token);
  },
  clear() {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  }
};

let refreshPromise: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const refresh = tokenStore.getRefresh();
      if (!refresh) return false;
      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refresh })
      });
      if (!res.ok) {
        tokenStore.clear();
        return false;
      }
      const pair = (await res.json()) as TokenPair;
      tokenStore.set(pair);
      return true;
    })().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  formData?: FormData;
  params?: Record<string, string | number | boolean | undefined | null>;
}

async function rawRequest(path: string, opts: RequestOptions, retried = false): Promise<Response> {
  const url = new URL(`${API_URL}${path}`);
  if (opts.params) {
    for (const [key, value] of Object.entries(opts.params)) {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    }
  }
  const headers: Record<string, string> = {};
  const access = tokenStore.getAccess();
  if (access) headers.Authorization = `Bearer ${access}`;
  if (opts.body !== undefined) headers['Content-Type'] = 'application/json';

  const res = await fetch(url.toString(), {
    method: opts.method ?? 'GET',
    headers,
    body: opts.formData ?? (opts.body !== undefined ? JSON.stringify(opts.body) : undefined)
  });

  if (res.status === 401 && !retried && !path.startsWith('/auth/')) {
    if (await tryRefresh()) return rawRequest(path, opts, true);
    if (typeof window !== 'undefined') {
      // Session fully expired — send the user to the login page of the current locale
      const locale = window.location.pathname.split('/')[1] || 'uz';
      window.location.href = `/${locale}/login`;
    }
  }
  return res;
}

export async function api<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  if (DEMO_MODE) {
    const { demoApi } = await import('./demo/api');
    return demoApi(path, opts) as Promise<T>;
  }
  const res = await rawRequest(path, opts);
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const data = await res.json();
      detail = typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail);
    } catch {
      /* non-JSON error body */
    }
    throw new ApiError(res.status, detail);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

/** Download a file behind auth and trigger a browser save dialog. */
export async function apiDownload(path: string, filename: string): Promise<void> {
  let blob: Blob;
  if (DEMO_MODE) {
    const { demoApi } = await import('./demo/api');
    blob = new Blob([String(await demoApi(path))], { type: 'text/csv;charset=utf-8' });
  } else {
    const res = await rawRequest(path, {});
    if (!res.ok) throw new ApiError(res.status, res.statusText);
    blob = await res.blob();
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const DEFAULT_BASE_URL = 'https://darul-muttaquine-server.onrender.com';

// We don't know the server's mount prefix for auth routes (it depends on app.js).
// So we try a small set of common prefixes and fall back if we hit 404.
const AUTH_PREFIX_CANDIDATES = [
  '', // /login
  '/auth', // /auth/login
  '/api', // /api/login
  '/api/auth', // /api/auth/login
  '/api/v1', // /api/v1/login
  '/api/v1/auth', // /api/v1/auth/login
];

function joinUrl(baseUrl, path) {
  const b = (baseUrl || '').replace(/\/+$/, '');
  const p = (path || '').replace(/^\/+/, '');
  return `${b}/${p}`;
}

async function readJsonSafe(res) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

export class HttpError extends Error {
  constructor(status, data) {
    super(data?.message || `Request failed with status ${status}`);
    this.name = 'HttpError';
    this.status = status;
    this.data = data;
  }
}

export async function postAuthWithFallback({
  baseUrl = DEFAULT_BASE_URL,
  endpoint, // e.g. '/login'
  body,
  headers,
}) {
  let lastErr;

  for (const prefix of AUTH_PREFIX_CANDIDATES) {
    const url = joinUrl(baseUrl, `${prefix}${endpoint}`);
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          ...(headers || {}),
        },
        body: JSON.stringify(body ?? {}),
      });

      // If we hit 404, try next prefix (route not mounted here).
      if (res.status === 404) {
        lastErr = new HttpError(404, await readJsonSafe(res));
        continue;
      }

      const data = await readJsonSafe(res);
      if (!res.ok) throw new HttpError(res.status, data);
      return { url, data };
    } catch (e) {
      lastErr = e;
    }
  }

  throw lastErr || new Error('Request failed');
}

export async function getJson({ baseUrl = DEFAULT_BASE_URL, endpoint, token }) {
  const url = joinUrl(baseUrl, endpoint);
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  const data = await readJsonSafe(res);
  if (!res.ok) throw new HttpError(res.status, data);
  return { url, data };
}

export async function postJson({ baseUrl = DEFAULT_BASE_URL, endpoint, body, token, headers }) {
  const url = joinUrl(baseUrl, endpoint);
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers || {}),
    },
    body: JSON.stringify(body ?? {}),
  });
  const data = await readJsonSafe(res);
  if (!res.ok) throw new HttpError(res.status, data);
  return { url, data };
}


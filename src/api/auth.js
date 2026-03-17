import { getJson, postAuthWithFallback } from './http';

const BASE_URL = 'https://darul-muttaquine-server.onrender.com';

export async function apiLogin({ email, password }) {
  const { data, url } = await postAuthWithFallback({
    baseUrl: BASE_URL,
    endpoint: '/login',
    body: { email, password },
  });
  return { data, url };
}

export async function apiRegister({
  firstName,
  lastName,
  username,
  email,
  password,
}) {
  const { data, url } = await postAuthWithFallback({
    baseUrl: BASE_URL,
    endpoint: '/register',
    body: { firstName, lastName, username, email, password },
  });
  return { data, url };
}

export async function apiLogout(token) {
  const { data, url } = await postAuthWithFallback({
    baseUrl: BASE_URL,
    endpoint: '/logout',
    body: {},
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  return { data, url };
}

export async function apiUserInfo(token) {
  // This route in your code is GET /userinfo (no middleware), but reads token.
  // We try a few common locations for it as well by reusing the fallback helper.
  // However fallback helper is POST-only, so we just try typical GET paths.
  const candidates = ['/userinfo', '/api/userinfo', '/auth/userinfo', '/api/auth/userinfo'];
  let lastErr;
  for (const endpoint of candidates) {
    try {
      return await getJson({ baseUrl: BASE_URL, endpoint, token });
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr;
}


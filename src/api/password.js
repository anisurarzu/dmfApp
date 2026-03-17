import { HttpError, postJson } from './http';

const BASE_URL = 'https://darul-muttaquine-server.onrender.com';

// Backend route name isn't provided; try common candidates.
const CHANGE_PASSWORD_CANDIDATES = [
  '/change-password',
  '/auth/change-password',
  '/api/change-password',
  '/api/auth/change-password',
  '/reset-password',
  '/auth/reset-password',
  '/api/reset-password',
  '/api/auth/reset-password',
  '/update-password',
  '/auth/update-password',
  '/api/update-password',
  '/api/auth/update-password',
];

export async function apiChangePassword({ token, payload }) {
  let lastErr;
  for (const endpoint of CHANGE_PASSWORD_CANDIDATES) {
    try {
      return await postJson({ baseUrl: BASE_URL, endpoint, token, body: payload });
    } catch (e) {
      if (e instanceof HttpError && e.status === 404) {
        lastErr = e;
        continue;
      }
      throw e;
    }
  }
  throw lastErr || new Error('Change password endpoint not found');
}


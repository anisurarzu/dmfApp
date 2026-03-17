import { postJson, HttpError } from './http';

const BASE_URL = 'https://darul-muttaquine-server.onrender.com';

// server route: router.post("/update-user", verifyAuthToken, updateUser);
const UPDATE_USER_CANDIDATES = ['/update-user', '/api/update-user', '/user/update-user', '/api/user/update-user'];

export async function apiUpdateUser({ token, payload }) {
  let lastErr;
  for (const endpoint of UPDATE_USER_CANDIDATES) {
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
  throw lastErr || new Error('Update user endpoint not found');
}


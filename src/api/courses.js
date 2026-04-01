import { getJson } from './http';

const BASE_URL = undefined;

const PREFIXES = ['', '/api', '/api/v1'];

/** Mongo/API id helper */
export function extractCourseId(c) {
  if (c == null) return '';
  const raw = c._id ?? c.id;
  if (raw == null || raw === '') return '';
  if (typeof raw === 'string' || typeof raw === 'number') return String(raw).trim();
  if (typeof raw === 'object' && raw.$oid != null) return String(raw.$oid);
  const s = String(raw).trim();
  if (s && s !== '[object Object]') return s;
  return '';
}

/**
 * GET /courses — tries common mount prefixes until one succeeds.
 * @returns {Promise<Array>}
 */
export async function fetchAllCourses(token) {
  let lastErr;
  for (const prefix of PREFIXES) {
    const endpoint = `${prefix}/courses`.replace(/\/+/g, '/');
    try {
      const { data } = await getJson({ baseUrl: BASE_URL, endpoint, token });
      if (data?.success && Array.isArray(data.courses)) return data.courses;
      if (Array.isArray(data?.courses)) return data.courses;
      if (Array.isArray(data)) return data;
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr || new Error('কোর্স লোড করা যায়নি');
}

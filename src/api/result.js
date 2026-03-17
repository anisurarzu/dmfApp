import { getJson, HttpError } from './http';

const BASE_URL = 'https://darul-muttaquine-server.onrender.com';

function normalizeRoll(roll) {
  return String(roll ?? '').trim();
}

// Your backend controller is "searchResult(req, res)" and uses req.params.scholarshipRollNumber.
// Route mount path isn't shown, so we try common candidates until one works (non-404).
const SEARCH_ENDPOINT_CANDIDATES = [
  (roll) => `/result/${roll}`,
  (roll) => `/results/${roll}`,
  (roll) => `/searchResult/${roll}`,
  (roll) => `/search-result/${roll}`,
  (roll) => `/result/search/${roll}`,
  (roll) => `/result/searchResult/${roll}`,
  (roll) => `/api/result/${roll}`,
  (roll) => `/api/results/${roll}`,
  (roll) => `/api/searchResult/${roll}`,
  (roll) => `/api/search-result/${roll}`,
];

export async function apiSearchResult({ scholarshipRollNumber }) {
  const roll = normalizeRoll(scholarshipRollNumber);
  if (!roll) throw new Error('scholarshipRollNumber is required');

  let lastErr;
  for (const build of SEARCH_ENDPOINT_CANDIDATES) {
    const endpoint = build(encodeURIComponent(roll));
    try {
      return await getJson({ baseUrl: BASE_URL, endpoint });
    } catch (e) {
      // If route isn't mounted here, try next.
      if (e instanceof HttpError && e.status === 404) {
        lastErr = e;
        continue;
      }
      throw e;
    }
  }
  throw lastErr || new Error('Result endpoint not found');
}


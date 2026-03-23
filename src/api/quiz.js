import { getJson, postJson } from './http';

const BASE_URL = undefined; // uses DEFAULT_BASE_URL from http.js

const QUIZ_PREFIXES = ['', '/api', '/api/v1'];

/** Handles string ids, { $oid }, and other JSON shapes from Mongo/APIs */
export function extractQuizId(q) {
  if (q == null) return '';
  const raw = q._id ?? q.id ?? q.quizId;
  if (raw == null || raw === '') return '';
  if (typeof raw === 'string' || typeof raw === 'number') return String(raw).trim();
  if (typeof raw === 'object') {
    if (raw.$oid != null) return String(raw.$oid);
    if (raw.oid != null) return String(raw.oid);
  }
  const s = String(raw).trim();
  // Avoid accidental "[object Object]" navigation ids
  if (s && s !== '[object Object]') return s;
  return '';
}

/** Parse dates from ISO strings, epoch ms, or Mongo extended JSON { $date: ... } */
export function parseBackendDate(value) {
  if (value == null || value === '') return null;
  if (typeof value === 'number' && Number.isFinite(value)) {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  if (typeof value === 'string') {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  if (typeof value === 'object' && value.$date != null) {
    const inner = value.$date;
    if (typeof inner === 'string' || typeof inner === 'number') return parseBackendDate(inner);
    if (inner && typeof inner === 'object' && inner.$numberLong != null) {
      const n = Number(inner.$numberLong);
      const d = new Date(n);
      return Number.isNaN(d.getTime()) ? null : d;
    }
  }
  return null;
}

/** Status values where the quiz stays playable until the user submits (ignore endDate on list). */
const ACTIVE_UNTIL_SUBMIT_STATUSES = new Set(['running', 'open', 'active', 'live', 'published']);

export function normalizeQuizStatus(q) {
  const raw = q?.status;
  if (raw == null) return '';
  return String(raw).trim().toLowerCase();
}

/**
 * Whether the user can start the quiz in-app (list screen).
 * `running` / `open` / etc. → always playable (if we have an id), until they submit — not blocked by endDate.
 */
export function getQuizListState(q) {
  const id = extractQuizId(q);
  const status = normalizeQuizStatus(q);

  if (status === 'closed' || status === 'close' || status === 'ended' || status === 'draft') {
    const label = status === 'draft' ? 'Draft' : 'Closed';
    return { playable: false, statusLabel: label, reason: 'status' };
  }

  if (ACTIVE_UNTIL_SUBMIT_STATUSES.has(status)) {
    if (!id) return { playable: false, statusLabel: 'Unavailable', reason: 'no_id' };
    if (status === 'running') return { playable: true, statusLabel: 'Live', reason: 'running' };
    if (status === 'open') return { playable: true, statusLabel: 'Open', reason: 'open' };
    return { playable: true, statusLabel: 'Active', reason: 'active' };
  }

  const end = parseBackendDate(q?.endDate);
  const now = Date.now();
  if (end && now > end.getTime()) {
    return { playable: false, statusLabel: 'Ended', reason: 'ended' };
  }
  if (!id) {
    return { playable: false, statusLabel: 'Unavailable', reason: 'no_id' };
  }
  return { playable: true, statusLabel: status ? status : 'Open', reason: 'ok' };
}

/** Single quiz from GET /quizzes/:id — unwrap common API wrappers */
function unwrapQuizPayload(data) {
  if (data == null || typeof data !== 'object') return data;
  if (data.quiz != null && typeof data.quiz === 'object') return data.quiz;
  if (data.data != null && typeof data.data === 'object' && !Array.isArray(data.data)) return data.data;
  return data;
}

export async function apiGetAllQuizzes(token) {
  let lastErr;
  for (const prefix of QUIZ_PREFIXES) {
    const endpoint = `${prefix}/quizzes`.replace(/^\/+/, '/');
    try {
      const { data } = await getJson({ baseUrl: BASE_URL, endpoint, token });
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.quizzes)) return data.quizzes;
      if (Array.isArray(data?.data)) return data.data;
      return [];
    } catch (e) {
      if (e?.status === 404) {
        lastErr = e;
        continue;
      }
      lastErr = e;
      throw e;
    }
  }
  throw lastErr || new Error('GET /quizzes not found');
}

export async function apiGetQuizById(quizId, token) {
  let lastErr;
  for (const prefix of QUIZ_PREFIXES) {
    const endpoint = `${prefix}/quizzes/${encodeURIComponent(quizId)}`.replace(/^\/+/, '/');
    try {
      const { data } = await getJson({ baseUrl: BASE_URL, endpoint, token });
      return unwrapQuizPayload(data);
    } catch (e) {
      if (e?.status === 404) {
        lastErr = e;
        continue;
      }
      lastErr = e;
      throw e;
    }
  }
  throw lastErr || new Error('Quiz not found');
}

export async function apiSubmitQuizAnswer(body, token) {
  let lastErr;
  for (const prefix of QUIZ_PREFIXES) {
    const endpoint = `${prefix}/quizzes-answer`.replace(/^\/+/, '/');
    try {
      try {
        const { data } = await postJson({ baseUrl: BASE_URL, endpoint, body, token });
        return data;
      } catch (e) {
        // Public submit route on many servers rejects unknown JWT — retry without Authorization
        if (e?.status === 401 && token) {
          const { data } = await postJson({ baseUrl: BASE_URL, endpoint, body });
          return data;
        }
        throw e;
      }
    } catch (e) {
      if (e?.status === 404) {
        lastErr = e;
        continue;
      }
      lastErr = e;
      throw e;
    }
  }
  throw lastErr || new Error('Submit answer endpoint not found');
}

export async function apiGetQuizResults(quizId, token) {
  let lastErr;
  for (const prefix of QUIZ_PREFIXES) {
    const endpoint = `${prefix}/quizzes-results/${encodeURIComponent(quizId)}`.replace(/^\/+/, '/');
    try {
      const { data } = await getJson({ baseUrl: BASE_URL, endpoint, token });
      return Array.isArray(data) ? data : [];
    } catch (e) {
      if (e?.status === 404) {
        lastErr = e;
        continue;
      }
      lastErr = e;
      throw e;
    }
  }
  throw lastErr || new Error('Quiz results not found');
}

export async function apiCheckPhoneInQuiz(quizId, phone, token) {
  if (!phone) return { exists: false };
  let lastErr;
  for (const prefix of QUIZ_PREFIXES) {
    const endpoint =
      `${prefix}/quizzes/${encodeURIComponent(quizId)}/check-phone?phone=${encodeURIComponent(phone)}`.replace(
        /^\/+/,
        '/'
      );
    try {
      const { data } = await getJson({ baseUrl: BASE_URL, endpoint, token });
      return { exists: !!data?.exists };
    } catch (e) {
      if (e?.status === 404) {
        lastErr = e;
        continue;
      }
      lastErr = e;
      throw e;
    }
  }
  throw lastErr || new Error('Check phone endpoint not found');
}

function normQuizPhone(p) {
  if (p == null) return '';
  return String(p).replace(/\s+/g, '').trim();
}

function normQuizEmail(e) {
  if (e == null) return '';
  return String(e).trim().toLowerCase();
}

/** Match leaderboard / results row to logged-in user (phone, uniqueId / _id, or email). */
export function quizResultMatchesUser(row, me) {
  if (!row || !me) return false;
  const phone = normQuizPhone(me.phone);
  if (phone && row.userPhone != null && normQuizPhone(row.userPhone) === phone) return true;
  const uid =
    me.uniqueId != null
      ? String(me.uniqueId).trim()
      : me._id != null
        ? String(me._id).trim()
        : me.id != null
          ? String(me.id).trim()
          : '';
  if (uid && row.userId != null && String(row.userId).trim() === uid) return true;
  const em = normQuizEmail(me.email);
  if (em && row.userEmail != null && normQuizEmail(row.userEmail) === em) return true;
  return false;
}

export function findMyQuizResult(results, me) {
  if (!Array.isArray(results) || !me) return null;
  for (const row of results) {
    if (quizResultMatchesUser(row, me)) return row;
  }
  return null;
}

/**
 * For each quiz id: whether current user submitted + marks (if results include them).
 */
export async function fetchSubmissionStatusByQuizIds(quizIds, me, token) {
  const unique = [...new Set(quizIds.filter(Boolean))];
  const out = {};
  await Promise.all(
    unique.map(async (id) => {
      try {
        const results = await apiGetQuizResults(id, token);
        const mine = findMyQuizResult(results, me);
        out[id] = {
          submitted: !!mine,
          marks: mine != null && mine.totalMarks != null ? Number(mine.totalMarks) : null,
        };
        return;
      } catch {
        /* fall through */
      }
      try {
        if (me?.phone) {
          const { exists } = await apiCheckPhoneInQuiz(id, String(me.phone).trim(), token);
          out[id] = { submitted: !!exists, marks: null };
          return;
        }
      } catch {
        /* ignore */
      }
      out[id] = { submitted: false, marks: null };
    })
  );
  return out;
}

/** Normalize question shape from various backend formats */
export function normalizeQuizQuestion(q, index) {
  const text = q?.question ?? q?.text ?? q?.title ?? `Question ${index + 1}`;
  let options = [];
  if (Array.isArray(q?.options)) {
    options = q.options.map((o) => {
      if (typeof o === 'string') return o;
      return o?.text ?? o?.label ?? o?.option ?? String(o);
    });
  }
  const mark = typeof q?.mark === 'number' ? q.mark : 1;
  let correctIndex = null;
  if (typeof q?.correctIndex === 'number') correctIndex = q.correctIndex;
  else if (typeof q?.correctOption === 'number') correctIndex = q.correctOption;
  else if (typeof q?.answer === 'number') correctIndex = q.answer;
  else if (typeof q?.correctAnswer === 'number') correctIndex = q.correctAnswer;

  if (correctIndex == null && typeof q?.correctAnswer === 'string') {
    const s = String(q.correctAnswer).trim();
    if (s !== '') {
      const asNum = parseInt(s, 10);
      if (String(asNum) === s && asNum >= 0 && asNum < options.length) {
        correctIndex = asNum;
      } else {
        const idx = options.findIndex((o) => String(o).trim() === s);
        if (idx >= 0) correctIndex = idx;
      }
    }
  }

  let correctAnswerText = '';
  if (correctIndex != null && options[correctIndex] != null) {
    correctAnswerText = String(options[correctIndex]).trim();
  } else if (typeof q?.correctAnswer === 'string' && String(q.correctAnswer).trim()) {
    correctAnswerText = String(q.correctAnswer).trim();
  }

  return { raw: q, text, options, mark, correctIndex, correctAnswerText };
}

export function scoreAnswer(normalizedQ, selectedIndex) {
  if (selectedIndex == null || selectedIndex < 0) return 0;
  const c = normalizedQ.correctIndex;
  if (c != null && Number.isFinite(Number(c)) && Number(selectedIndex) === Number(c)) {
    return normalizedQ.mark;
  }
  const userOpt = normalizedQ.options[selectedIndex];
  const expected = normalizedQ.correctAnswerText;
  if (expected && userOpt != null && String(userOpt).trim() === String(expected).trim()) {
    return normalizedQ.mark;
  }
  return 0;
}

/**
 * Payload shape expected by many DMF quiz backends (per-question objects with text + marks).
 */
export function buildAnswersPayloadForSubmit(normalizedQuestions, selections) {
  return normalizedQuestions.map((nq, i) => {
    const selIdx = selections[i];
    const userAnswer =
      selIdx != null && nq.options[selIdx] != null ? String(nq.options[selIdx]).trim() : '';
    const correctAnswer = (nq.correctAnswerText || '').trim();
    const mark = scoreAnswer(nq, selIdx);
    return {
      question: nq.text,
      userAnswer,
      correctAnswer,
      result: mark > 0 ? 'correct' : 'wrong',
      mark,
    };
  });
}

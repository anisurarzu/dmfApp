import { getJson, postJson } from './http';

const CREATE_SESSION_ENDPOINTS = ['/support/sessions', '/api/support/sessions'];
const SEND_MESSAGE_ENDPOINTS = ['/support/messages', '/api/support/messages'];
const LIST_MESSAGES_ENDPOINTS = ['/support/messages', '/api/support/messages'];

async function tryPost(endpointList, body, token) {
  let lastErr;
  for (const endpoint of endpointList) {
    try {
      return await postJson({ endpoint, body, token });
    } catch (e) {
      lastErr = e;
      if (e?.status === 404) continue;
      throw e;
    }
  }
  throw lastErr || new Error('Support API unavailable');
}

async function tryGet(endpointList, token, query = '') {
  let lastErr;
  for (const endpoint of endpointList) {
    try {
      return await getJson({ endpoint: `${endpoint}${query}`, token });
    } catch (e) {
      lastErr = e;
      if (e?.status === 404) continue;
      throw e;
    }
  }
  throw lastErr || new Error('Support API unavailable');
}

export async function apiCreateSupportSession({ token, user }) {
  return tryPost(CREATE_SESSION_ENDPOINTS, { user }, token);
}

export async function apiSendSupportMessage({ token, sessionId, text, senderType = 'user' }) {
  return tryPost(SEND_MESSAGE_ENDPOINTS, { sessionId, text, senderType }, token);
}

export async function apiFetchSupportMessages({ token, sessionId, since }) {
  const qs = `?sessionId=${encodeURIComponent(sessionId)}${since ? `&since=${encodeURIComponent(since)}` : ''}`;
  return tryGet(LIST_MESSAGES_ENDPOINTS, token, qs);
}

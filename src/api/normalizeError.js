function isObject(v) {
  return !!v && typeof v === 'object' && !Array.isArray(v);
}

function toStringSafe(v) {
  if (typeof v === 'string') return v;
  if (v == null) return '';
  try {
    return String(v);
  } catch {
    return '';
  }
}

function pickFirstMessage(v) {
  if (!v) return '';
  if (typeof v === 'string') return v;
  if (Array.isArray(v)) {
    for (const x of v) {
      const msg = pickFirstMessage(x);
      if (msg) return msg;
    }
  }
  if (isObject(v)) {
    if (typeof v.message === 'string') return v.message;
    if (typeof v.error === 'string') return v.error;
  }
  return '';
}

function normalizeFieldKey(k) {
  const key = (k || '').toString();
  if (!key) return '';
  if (key === 'first_name') return 'firstName';
  if (key === 'last_name') return 'lastName';
  return key;
}

function extractFieldErrors(data) {
  const out = {};
  if (!data) return out;

  // Common shapes:
  // { field: 'email', message: '...' }
  if (typeof data.field === 'string' && data.message) {
    out[normalizeFieldKey(data.field)] = pickFirstMessage(data.message) || pickFirstMessage(data);
    return out;
  }

  // { errors: { email: "...", password: ["..."] } }
  if (isObject(data.errors)) {
    for (const [k, v] of Object.entries(data.errors)) {
      const msg = pickFirstMessage(v);
      if (msg) out[normalizeFieldKey(k)] = msg;
    }
  }

  // { data: { ... } } (some APIs wrap)
  if (isObject(data.data) && isObject(data.data.errors) && !Object.keys(out).length) {
    for (const [k, v] of Object.entries(data.data.errors)) {
      const msg = pickFirstMessage(v);
      if (msg) out[normalizeFieldKey(k)] = msg;
    }
  }

  return out;
}

export function normalizeAuthError(err, { defaultMessage } = {}) {
  const status = err?.status;
  const data = err?.data;
  const rawMsg = pickFirstMessage(data) || toStringSafe(err?.message);

  // Network/offline / fetch failure
  const isNetwork =
    err?.name === 'TypeError' ||
    /network request failed/i.test(rawMsg) ||
    /failed to fetch/i.test(rawMsg) ||
    /networkerror/i.test(rawMsg) ||
    /timeout/i.test(rawMsg);

  if (isNetwork) {
    return {
      message: 'Network error. Please check your internet and try again.',
      fieldErrors: {},
      status,
      isNetwork: true,
      raw: err,
    };
  }

  // Wrong credentials (common)
  if (status === 401 || /invalid (email|password)|unauthorized/i.test(rawMsg)) {
    return {
      message: 'Invalid email or password.',
      fieldErrors: { password: 'Invalid email or password.' },
      status,
      isNetwork: false,
      raw: err,
    };
  }

  const fieldErrors = extractFieldErrors(data);
  const message =
    rawMsg ||
    defaultMessage ||
    (status >= 500 ? 'Server error. Please try again in a moment.' : 'Something went wrong.');

  return {
    message,
    fieldErrors,
    status,
    isNetwork: false,
    raw: err,
  };
}


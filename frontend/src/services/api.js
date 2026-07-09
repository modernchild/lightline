// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// services/api.js
// All frontend HTTP calls to the Lightline backend.
// Token is read from localStorage automatically.
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const BASE_URL = import.meta.env.VITE_API_URL || '';

function getToken() {
  return localStorage.getItem('ll_token');
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || `We encountered a problem (${res.status}). Please check your connection and try again.`);
  }

  return data;
}

// â”€â”€ Auth â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const authApi = {
  register: (body) => request('/api/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  google: (body) => request('/api/auth/google', { method: 'POST', body: JSON.stringify(body) }),
  forgotPassword: (body) => request('/api/auth/forgot-password', { method: 'POST', body: JSON.stringify(body) }),
  resetPassword: (body) => request('/api/auth/reset-password', { method: 'POST', body: JSON.stringify(body) }),
  me: () => request('/api/auth/me'),
};

function defaultGenOptions(opts = {}) {
  return {
    stream: true,
    useMemory: false,
    evaluate: true,
    ...opts,
  };
}

export async function generateStream(path, body, onChunk, options = {}) {
  const token = getToken();
  const payload = { ...defaultGenOptions(options), ...body };
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `We couldn't complete your request (${res.status}). Please check your connection and try again.`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let finalData = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split('\n\n');
    buffer = parts.pop() || '';

    for (const part of parts) {
      const lines = part.split('\n');
      let event = 'message';
      let dataLine = '';
      for (const line of lines) {
        if (line.startsWith('event: ')) event = line.slice(7);
        if (line.startsWith('data: ')) dataLine = line.slice(6);
      }
      if (!dataLine) continue;
      const parsed = JSON.parse(dataLine);
      if (event === 'chunk' && parsed.content) onChunk(parsed.content);
      if (event === 'done') finalData = parsed;
      if (event === 'error') throw new Error(parsed.error || 'The generation was interrupted. Please try again.');
    }
  }

  if (!finalData) throw new Error('We didn\'t receive a complete response. Please try again.');
  return finalData;
}

export const generateApi = {
  sermonQuick:  (body, opts) => generateStream('/api/generate/sermon/quick', body, opts?.onChunk, opts),
  sermonDeep:   (body, opts) => generateStream('/api/generate/sermon/deep', body, opts?.onChunk, opts),
  devotional:   (body, opts) => generateStream('/api/generate/devotional', body, opts?.onChunk, opts),
  whatsapp:     (body, opts) => generateStream('/api/generate/whatsapp', body, opts?.onChunk, opts),
  bibleStudy:   (body, opts) => generateStream('/api/generate/bible-study', body, opts?.onChunk, opts),
  social:       (body, opts) => generateStream('/api/generate/social', body, opts?.onChunk, opts),
  prayer:       (body, opts) => generateStream('/api/generate/prayer', body, opts?.onChunk, opts),
  evangelism:   (body, opts) => generateStream('/api/generate/evangelism', body, opts?.onChunk, opts),
};

export const historyApi = {
  list: (feature) => request(`/api/history${feature ? `?feature=${feature}` : ''}`),
  get: (id) => request(`/api/history/${id}`),
  remove: (id) => request(`/api/history/${id}`, { method: 'DELETE' }),
  removeAll: () => request('/api/history/all', { method: 'DELETE' }),
  conversations: (feature) => request(`/api/history/conversations${feature ? `?feature=${feature}` : ''}`),
  deleteConversation: (id) => request(`/api/history/conversations/${id}`, { method: 'DELETE' }),
  clearMemory: (id) => request(`/api/history/conversations/${id}/messages`, { method: 'DELETE' }),
};

export const modelsApi = {
  list: () => request('/api/models'),
  test: (models) => request('/api/models/test', { method: 'POST', body: JSON.stringify({ models }) }),
};

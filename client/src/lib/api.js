const API_BASE = import.meta.env.VITE_API_URL || '/api';

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...options.headers },
    });
  } catch {
    throw new Error('Unable to reach the API server. Make sure the backend is running.');
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `Request failed (${response.status}).`);
  return data;
}

export const api = {
  listConversations: () => request('/conversations'),
  getConversation: (id) => request(`/conversations/${id}`),
  createConversation: () => request('/conversations', { method: 'POST' }),
  deleteConversation: (id) => request(`/conversations/${id}`, { method: 'DELETE' }),
  sendMessage: (id, content) => request(`/conversations/${id}/messages`, { method: 'POST', body: JSON.stringify({ content }) }),
};

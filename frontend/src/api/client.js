const BASE = '/api';

function getToken() { return localStorage.getItem('fd_token'); }

async function request(method, path, body) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(BASE + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw Object.assign(new Error(data.error || 'Request failed'), { status: res.status, data });
  return data;
}

export const api = {
  // Auth
  login:    (email, password) => request('POST', '/auth/login', { email, password }),
  register: (body)            => request('POST', '/auth/register', body),

  // Records
  getRecords:    (params = {}) => request('GET', '/records?' + new URLSearchParams(params)),
  getRecord:     (id)          => request('GET', `/records/${id}`),
  createRecord:  (body)        => request('POST', '/records', body),
  updateRecord:  (id, body)    => request('PATCH', `/records/${id}`, body),
  deleteRecord:  (id)          => request('DELETE', `/records/${id}`),

  // Dashboard
  getSummary:  (params = {}) => request('GET', '/dashboard/summary?' + new URLSearchParams(params)),
  getTrends:   (params = {}) => request('GET', '/dashboard/trends?'  + new URLSearchParams(params)),
  getRecent:   ()            => request('GET', '/dashboard/recent'),

  // Users
  getUsers:    (params = {}) => request('GET', '/users?' + new URLSearchParams(params)),
  getUser:     (id)          => request('GET', `/users/${id}`),
  updateUser:  (id, body)    => request('PATCH', `/users/${id}`, body),
  deleteUser:  (id)          => request('DELETE', `/users/${id}`),
};

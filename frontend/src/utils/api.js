const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

function getToken() {
  return localStorage.getItem('tmdb:token');
}

export async function apiRequest(endpoint, options = {}) {
  const token = getToken();
  const url = `${API_BASE_URL}${endpoint}`;

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem('tmdb:token');
    localStorage.removeItem('tmdb:user');
    throw new Error('Sessão expirada. Por favor, faça login novamente.');
  }

  let data;
  try {
    const text = await response.text();
    data = text ? JSON.parse(text) : {};
  } catch (e) {
    if (!response.ok) {
      throw new Error(`Erro ${response.status}: ${response.statusText}`);
    }
    data = {};
  }

  if (!response.ok) {
    throw new Error(data.message || data.error || `Erro ${response.status}: ${response.statusText}`);
  }

  return data;
}

export async function login(username, password) {
  const response = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });

  if (response.success) {
    localStorage.setItem('tmdb:token', response.token);
    localStorage.setItem('tmdb:user', JSON.stringify(response.user));
    return response;
  }

  throw new Error(response.message || 'Erro no login');
}

export async function searchMovies(query, page = 1) {
  const response = await apiRequest(`/movies/search?q=${encodeURIComponent(query)}&page=${page}`);
  return response;
}

export async function insertMovie(movieData) {
  const response = await apiRequest('/movies/insert', {
    method: 'POST',
    body: JSON.stringify(movieData),
  });
  return response;
}


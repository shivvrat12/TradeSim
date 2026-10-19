import axios from 'axios';

const AUTH_URL = 'http://localhost:8081';
const MARKET_URL = 'http://localhost:8080';
const PORTFOLIO_URL = 'http://localhost:8082';
const TRADE_URL = 'http://localhost:8083';

export const MARKET_WS_URL = `${MARKET_URL}/ws`;

export const session = {
  get token() {
    return localStorage.getItem('jwtToken');
  },
  get email() {
    return localStorage.getItem('email');
  },
  save(email, { jwtToken, refreshToken }) {
    localStorage.setItem('jwtToken', jwtToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('email', email);
  },
  clear() {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('email');
  },
};

// Instance for authenticated calls: attaches the access token and refreshes it once on 401
const api = axios.create({ headers: { 'Content-Type': 'application/json' } });

api.interceptors.request.use((config) => {
  const token = session.token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Shared so that several requests failing at once trigger a single refresh
let refreshing = null;

function refreshAccessToken() {
  if (!refreshing) {
    const refreshToken = localStorage.getItem('refreshToken');
    // Plain axios, not `api`, so a failed refresh can't loop back into this interceptor
    refreshing = (refreshToken
      ? axios.post(`${AUTH_URL}/api/auth/v1/refresh`, { refreshToken })
      : Promise.reject(new Error('No refresh token'))
    )
      .then((res) => {
        localStorage.setItem('jwtToken', res.data.accessToken);
        return res.data.accessToken;
      })
      .finally(() => {
        refreshing = null;
      });
  }
  return refreshing;
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && original && !original._retry && session.token) {
      original._retry = true;
      try {
        const token = await refreshAccessToken();
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      } catch {
        session.clear();
        window.location.assign('/login?expired=1');
      }
    }
    return Promise.reject(error);
  }
);

export function errorMessage(error, fallback) {
  if (!error.response) return "Can't reach the server. Check that the backend is running.";
  const data = error.response.data;
  return (typeof data === 'object' && data?.message) || fallback;
}

export async function login(email, password) {
  const { data } = await axios.post(`${AUTH_URL}/api/auth/v1/login`, { email, password });
  session.save(email, data);
}

export async function signUp(name, email, password) {
  const { data } = await axios.post(`${AUTH_URL}/api/auth/v1/signup`, { name, email, password });
  session.save(email, data);
}

export async function fetchPrices() {
  const { data } = await axios.get(`${MARKET_URL}/latest`);
  return data;
}

export async function fetchMyPortfolio() {
  const { data } = await api.get(`${PORTFOLIO_URL}/api/portfolio/me`);
  return data;
}

// side is 'buy' or 'sell'; the trade fills at the latest market price on the server
export async function placeTrade(side, symbol, quantity) {
  const { data } = await api.post(`${TRADE_URL}/api/trade/${side}`, { symbol, quantity });
  return data;
}

export default api;

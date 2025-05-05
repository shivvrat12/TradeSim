import axios from 'axios';

// Create Axios instance
const api = axios.create({
  baseURL: 'http://localhost:8081',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add Authorization header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwtToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Added Authorization header for request:', config.url);
    } else {
      console.log('No JWT found for request:', config.url);
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => {
    console.log('API response received:', response.config.url, response.status);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    console.error('API error:', {
      url: originalRequest.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });

    if (error.response?.status === 500 && !originalRequest._retry) {
      console.log('401 Unauthorized detected, attempting refresh for:', originalRequest.url);
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          console.error('No refresh token found in localStorage');
          throw new Error('No refresh token available');
        }

        console.log('Sending refresh request with token:', refreshToken.slice(0, 10) + '...');
        const response = await api.post('/api/auth/v1/refresh', { refreshToken });
        console.log('Refresh response:', {
          status: response.status,
          data: response.data,
        });

        const newAccessToken = response.data.accessToken;
        if (!newAccessToken) {
          console.error('No accessToken in refresh response:', response.data);
          throw new Error('No access token returned');
        }

        console.log('Storing new access token:', newAccessToken.slice(0, 10) + '...');
        localStorage.setItem('jwtToken', newAccessToken);

        console.log('Retrying original request:', originalRequest.url);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Refresh token error:', {
          status: refreshError.response?.status,
          data: refreshError.response?.data,
          message: refreshError.message,
          stack: refreshError.stack,
        });

        console.log('Clearing tokens and redirecting to /login');
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('refreshToken');
        alert('Session expired. Please log in again.');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Fetch crypto data
export async function fetchCryptoData() {
  try {
    const response = await api.get('http://localhost:8080/latest');
    console.log('Fetched crypto data:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching crypto data:', error);
    return {};
  }
}

export async function fetchPortfolio(email) {
  try{
    const res = await axios.get(`http://localhost:8082/api/portfolio/${email}`);
    console.log(res.data);
    return res.data;
  }catch(error){
    console.log(error);
  }
}

// Fetch balance
export async function fetchBalance() {
  try {
    const response = await api.get('http://localhost:8082/api/portfolio/getBalance');
    console.log('Fetched balance:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching balance:', error);
    throw error;
  }
}

// Login
export async function login(email, password, setAlert) {
  try {
    const response = await api.post('/api/auth/v1/login', { email, password });
    console.log('Login response:', response.data);
    if (response.data) {
      const { jwtToken, refreshToken } = response.data;
      console.log('Storing tokens:', {
        jwtToken: jwtToken.slice(0, 10) + '...',
        refreshToken: refreshToken.slice(0, 10) + '...',
      });
      localStorage.setItem('jwtToken', jwtToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('email', email);
      setAlert({ message: 'Login successful!', type: 'success' });
      return response;
    }
    setAlert({ message: 'Login successful, but no tokens received.', type: 'warning' });
    return response;
  } catch (error) {
    console.error('Login error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    setAlert({
      message: error.response?.data?.message || 'Login failed. Please check your credentials.',
      type: 'error',
    });
    throw error;
  } finally {
    setTimeout(() => setAlert(null), 5000);
  }
}

// Sign up
export async function signUp(name, email, password, setAlert) {
  try {
    const response = await api.post('/api/auth/v1/signup', { name, email, password });
    console.log('Signup response:', response.data);
    setAlert({ message: 'Signup success', type: 'success' });
    return response;
  } catch (error) {
    console.error('Signup error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    setAlert({
      message: error.response?.data?.message || 'Sign Up failed. Please check your connections.',
      type: 'error',
    });
    throw error;
  } finally {
    setTimeout(() => setAlert(null), 5000);
  }
}

// Export the Axios instance as default
export default api;
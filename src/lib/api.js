import axios from 'axios';

// Dynamically normalize base API URL
const getBaseUrl = () => {
    let url = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    
    // Trim spaces and trailing slashes
    url = url.trim().replace(/\/+$/, '');

    // Ensure the '/api' suffix is present
    if (!url.endsWith('/api')) {
        url = `${url}/api`;
    }
    
    return url;
};

const api = axios.create({
    baseURL: getBaseUrl(),
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to attach the token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;

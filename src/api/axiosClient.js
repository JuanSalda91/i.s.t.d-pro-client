import axios from 'axios';

const axiosClient = axios.create({ baseURL: import.meta.env.VITE_API_URL });

// attach JWT token from localstorage if present

axiosClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            // do not overwrite existing authorization if manually set
            config.headers = config.headers || {};
            if (!config.headers.Authorization) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default axiosClient;
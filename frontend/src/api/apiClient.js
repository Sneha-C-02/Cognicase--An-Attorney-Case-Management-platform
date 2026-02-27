import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use(
    (config) => {
        try {
            const authData = localStorage.getItem('cognicase_auth');
            if (authData) {
                const { token } = JSON.parse(authData);
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            }
        } catch (err) {
            console.error("Auth token parse error", err);
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Return the raw response — individual service files extract .data themselves
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('cognicase_auth');
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;

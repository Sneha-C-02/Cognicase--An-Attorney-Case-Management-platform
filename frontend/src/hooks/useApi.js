import { useAuth } from '../context/AuthContext';

export const useApi = () => {
    const { token, logout } = useAuth();
    const BASE_URL = 'http://localhost:5000/api';

    const request = async (endpoint, options = {}) => {
        const url = `${BASE_URL}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
            ...options.headers,
        };

        const config = {
            ...options,
            headers,
        };

        try {
            const response = await fetch(url, config);
            if (response.status === 401) {
                logout();
                return null;
            }
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'API request failed');
            }
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    };

    return {
        get: (endpoint, options) => request(endpoint, { ...options, method: 'GET' }),
        post: (endpoint, body, options) => request(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) }),
        put: (endpoint, body, options) => request(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) }),
        delete: (endpoint, options) => request(endpoint, { ...options, method: 'DELETE' }),
    };
};

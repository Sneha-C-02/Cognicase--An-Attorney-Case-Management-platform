import apiClient from './apiClient';

export const getDashboardStats = async () => {
    const response = await apiClient.get('/activities/stats'); // Assuming activities or a dedicated endpoint provides stats
    return response.data;
};

export const getRecentActivities = async () => {
    const response = await apiClient.get('/activities/global');
    return response.data;
};

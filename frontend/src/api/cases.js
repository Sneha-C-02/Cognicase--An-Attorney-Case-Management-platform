import apiClient from './apiClient';

export const getCases = async () => {
    const response = await apiClient.get('/cases');
    return response.data;
};

export const getCaseById = async (id) => {
    const response = await apiClient.get(`/cases/${id}`);
    return response.data;
};

export const createCase = async (caseData) => {
    const response = await apiClient.post('/cases', caseData);
    return response.data;
};

export const updateCase = async (id, caseData) => {
    const response = await apiClient.put(`/cases/${id}`, caseData);
    return response.data;
};

export const deleteCase = async (id) => {
    const response = await apiClient.delete(`/cases/${id}`);
    return response.data;
};

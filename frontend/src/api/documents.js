import apiClient from './apiClient';

export const getDocuments = async (params) => {
    const response = await apiClient.get('/documents', { params });
    return response.data;
};

export const uploadDocument = async (formData) => {
    // Note: When sending FormData, headers are handled automatically by axios
    const response = await apiClient.post('/documents', formData);
    return response.data;
};

export const updateDocument = async (id, docData) => {
    const response = await apiClient.put(`/documents/${id}`, docData);
    return response.data;
};

export const deleteDocument = async (id) => {
    const response = await apiClient.delete(`/documents/${id}`);
    return response.data;
};

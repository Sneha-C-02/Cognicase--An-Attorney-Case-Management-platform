import apiClient from './apiClient';

export const getDocuments = async (caseId = null) => {
    const url = caseId ? `/documents?caseId=${caseId}` : '/documents';
    const response = await apiClient.get(url);
    return response.data;
};

export const uploadDocument = async (formData) => {
    // Note: When sending FormData, headers are handled automatically by axios
    const response = await apiClient.post('/documents', formData);
    return response.data;
};

export const deleteDocument = async (id) => {
    const response = await apiClient.delete(`/documents/${id}`);
    return response.data;
};

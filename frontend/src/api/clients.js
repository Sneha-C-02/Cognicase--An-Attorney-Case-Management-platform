import apiClient from './apiClient';

export const getClients = async (params) => {
    const response = await apiClient.get('/clients', { params });
    return response.data;
};

export const createClient = async (clientData) => {
    const response = await apiClient.post('/clients', clientData);
    return response.data;
};

export const updateClient = async (id, clientData) => {
    const response = await apiClient.put(`/clients/${id}`, clientData);
    return response.data;
};

export const deleteClient = async (id) => {
    const response = await apiClient.delete(`/clients/${id}`);
    return response.data;
};

export const getClientById = async (id) => {
    const response = await apiClient.get(`/clients/${id}`);
    return response.data;
};

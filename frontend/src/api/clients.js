import apiClient from './apiClient';

export const getClients = async () => {
    const response = await apiClient.get('/clients');
    return response.data;
};

export const createClient = async (clientData) => {
    const response = await apiClient.post('/clients', clientData);
    return response.data;
};

export const getClientById = async (id) => {
    const response = await apiClient.get(`/clients/${id}`);
    return response.data;
};

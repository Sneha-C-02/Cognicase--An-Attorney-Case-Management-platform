import apiClient from './apiClient';

export const getInvoices = async (caseId = null) => {
    const url = caseId ? `/invoices?caseId=${caseId}` : '/invoices';
    const response = await apiClient.get(url);
    return response.data;
};

export const createInvoice = async (invoiceData) => {
    const response = await apiClient.post('/invoices', invoiceData);
    return response.data;
};

export const updateInvoiceStatus = async (id, status) => {
    const response = await apiClient.put(`/invoices/${id}`, { status });
    return response.data;
};

export const deleteInvoice = async (id) => {
    const response = await apiClient.delete(`/invoices/${id}`);
    return response.data;
};

import apiClient from './apiClient';

export const getTasks = async (caseId = null) => {
    const url = caseId ? `/tasks?caseId=${caseId}` : '/tasks';
    const response = await apiClient.get(url);
    return response.data;
};

export const createTask = async (taskData) => {
    const response = await apiClient.post('/tasks', taskData);
    return response.data;
};

export const updateTaskStatus = async (id, status) => {
    const response = await apiClient.put(`/tasks/${id}`, { status });
    return response.data;
};

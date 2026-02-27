import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { CheckSquare, Calendar, Flag, Loader2, Plus, X } from 'lucide-react';
import { getTasks, createTask, updateTask, deleteTask, updateTaskStatus } from '../api/tasks';
import { getCases } from '../api/cases';

const Tasks = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [tasks, setTasks] = useState([]);
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({ title: '', caseId: '', priority: 'Medium', dueDate: '' });

    // Edit state
    const [editingTask, setEditingTask] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    useEffect(() => {
        const debounce = setTimeout(() => {
            fetchData();
        }, 300);
        return () => clearTimeout(debounce);
    }, [searchTerm]);

    const fetchData = async () => {
        setLoading(true); setError(null);
        try {
            const params = {};
            if (searchTerm) params.search = searchTerm;
            const [tasksData, casesData] = await Promise.all([getTasks(params), getCases()]);
            setTasks(tasksData || []);
            setCases(casesData || []);
        } catch (err) { setError('Failed to fetch tasks.'); }
        finally { setLoading(false); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await createTask(formData);
            await fetchData();
            setIsModalOpen(false);
            setFormData({ title: '', caseId: '', priority: 'Medium', dueDate: '' });
        } catch (err) { alert('Failed to create task: ' + err.message); }
        finally { setIsSubmitting(false); }
    };

    const handleStatusUpdate = async (taskId, newStatus) => {
        try {
            await updateTaskStatus(taskId, newStatus);
            await fetchData();
        } catch { alert('Failed to update status'); }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await updateTask(editingTask._id, editingTask);
            await fetchData();
            setIsEditModalOpen(false);
            setEditingTask(null);
        } catch (err) { alert('Failed to update task: ' + err.message); }
        finally { setIsSubmitting(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this task?')) return;
        try {
            await deleteTask(id);
            await fetchData();
        } catch (err) { alert('Failed to delete task: ' + err.message); }
    };

    const openEditModal = (task) => {
        setEditingTask({
            ...task,
            caseId: task.caseId?._id || task.caseId || '',
            dueDate: task.deadline ? new Date(task.deadline).toISOString().split('T')[0] : ''
        });
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        setEditingTask(null);
    };

    const closeModal = () => setIsModalOpen(false);

    return (
        <div className="fade-in">
            <Header title="Task Management" searchValue={searchTerm} onSearch={setSearchTerm} />

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
                <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                    <Plus size={18} /> New Task
                </button>
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Task</th>
                            <th>Case</th>
                            <th>Deadline</th>
                            <th>Priority</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="5" style={{ textAlign: 'center', padding: '3rem' }}>
                                <Loader2 className="animate-spin" size={32} color="var(--primary)" style={{ margin: '0 auto' }} />
                            </td></tr>
                        ) : error ? (
                            <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--danger)' }}>{error}</td></tr>
                        ) : tasks.length === 0 ? (
                            <tr><td colSpan="5" style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                                <CheckSquare size={40} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                                <p>No tasks found. Create your first task.</p>
                            </td></tr>
                        ) : tasks.map(task => (
                            <tr key={task._id}>
                                <td style={{ fontWeight: 600 }}>{task.title}</td>
                                <td style={{ color: 'var(--text-muted)' }}>{task.caseId?.title || 'General'}</td>
                                <td>
                                    {task.deadline
                                        ? <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}><Calendar size={14} />{new Date(task.deadline).toLocaleDateString()}</span>
                                        : <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>—</span>}
                                </td>
                                <td>
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', fontWeight: 600, color: task.priority === 'High' ? 'var(--danger)' : task.priority === 'Low' ? 'var(--text-muted)' : 'var(--warning)' }}>
                                        <Flag size={13} /> {task.priority}
                                    </span>
                                </td>
                                <td>
                                    <select
                                        style={{ padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--border)', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', background: 'white', outline: 'none', ...getStatusStyle(task.status) }}
                                        value={task.status}
                                        onChange={e => handleStatusUpdate(task._id, e.target.value)}
                                    >
                                        <option value="Todo">Todo</option>
                                        <option value="InProgress">In Progress</option>
                                        <option value="Completed">Completed</option>
                                        <option value="OnHold">On Hold</option>
                                    </select>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button onClick={() => openEditModal(task)} style={{ border: 'none', background: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600, fontSize: '0.8125rem' }}>Edit</button>
                                        <button onClick={() => handleDelete(task._id)} style={{ border: 'none', background: 'none', color: 'var(--danger)', cursor: 'pointer', fontWeight: 600, fontSize: '0.8125rem' }}>Delete</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
                    <div className="modal-box">
                        <div className="modal-header">
                            <h2>Create New Task</h2>
                            <button className="modal-close-btn" onClick={closeModal}><X size={20} /></button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Task Title *</label>
                                <input className="form-input" type="text" placeholder="e.g. Draft motion to dismiss" value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })} required autoFocus />
                            </div>
                            <div className="form-group">
                                <label>Associate with Case</label>
                                <select className="form-input" value={formData.caseId}
                                    onChange={e => setFormData({ ...formData, caseId: e.target.value })}>
                                    <option value="">No Case (General Task)</option>
                                    {cases.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
                                </select>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label>Priority</label>
                                    <select className="form-input" value={formData.priority}
                                        onChange={e => setFormData({ ...formData, priority: e.target.value })}>
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Due Date</label>
                                    <input className="form-input" type="date" value={formData.dueDate}
                                        onChange={e => setFormData({ ...formData, dueDate: e.target.value })} />
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                                    {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Creating…</> : <><Plus size={16} /> Create Task</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isEditModalOpen && editingTask && (
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeEditModal()}>
                    <div className="modal-box">
                        <div className="modal-header">
                            <h2>Edit Task</h2>
                            <button className="modal-close-btn" onClick={closeEditModal}><X size={20} /></button>
                        </div>

                        <form onSubmit={handleUpdate}>
                            <div className="form-group">
                                <label>Task Title *</label>
                                <input className="form-input" type="text" value={editingTask.title}
                                    onChange={e => setEditingTask({ ...editingTask, title: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>Associate with Case</label>
                                <select className="form-input" value={editingTask.caseId}
                                    onChange={e => setEditingTask({ ...editingTask, caseId: e.target.value })}>
                                    <option value="">No Case (General Task)</option>
                                    {cases.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
                                </select>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label>Priority</label>
                                    <select className="form-input" value={editingTask.priority}
                                        onChange={e => setEditingTask({ ...editingTask, priority: e.target.value })}>
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Status</label>
                                    <select className="form-input" value={editingTask.status}
                                        onChange={e => setEditingTask({ ...editingTask, status: e.target.value })}>
                                        <option value="Todo">Todo</option>
                                        <option value="InProgress">In Progress</option>
                                        <option value="Completed">Completed</option>
                                        <option value="OnHold">On Hold</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Due Date</label>
                                <input className="form-input" type="date" value={editingTask.dueDate || ''}
                                    onChange={e => setEditingTask({ ...editingTask, dueDate: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea className="form-input" value={editingTask.description || ''}
                                    onChange={e => setEditingTask({ ...editingTask, description: e.target.value })}
                                    style={{ resize: 'vertical', minHeight: '80px' }} />
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={closeEditModal}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                                    {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Saving…</> : <><Plus size={16} /> Save Changes</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const getStatusStyle = (status) => {
    switch (status) {
        case 'Completed': return { background: '#dcfce7', color: '#166534', borderColor: '#86efac' };
        case 'In Progress': return { background: '#fef9c3', color: '#854d0e', borderColor: '#fde047' };
        case 'On Hold': return { background: '#fee2e2', color: '#991b1b', borderColor: '#fca5a5' };
        default: return { background: '#f1f5f9', color: '#475569', borderColor: '#cbd5e1' };
    }
};

export default Tasks;

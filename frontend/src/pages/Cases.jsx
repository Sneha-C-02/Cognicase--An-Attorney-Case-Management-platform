import React, { useState, useEffect, useCallback } from 'react';
import Header from '../components/Header.jsx';
import { Plus, ChevronRight, Search, Loader2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getCases, createCase, updateCase, deleteCase } from '../api/cases';
import { getClients } from '../api/clients';
import { useAuth } from '../context/AuthContext';

const Cases = () => {
    const navigate = useNavigate();
    const { user } = useAuth(); // Added from Code Edit
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [cases, setCases] = useState([]);
    const [clients, setClients] = useState([]); // Added from Code Edit
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null); // Added from Code Edit
    const [isModalOpen, setIsModalOpen] = useState(false); // Added from Code Edit
    const [isSubmitting, setIsSubmitting] = useState(false); // Added from Code Edit
    const [formData, setFormData] = useState({
        caseNumber: `CASE-${Math.floor(1000 + Math.random() * 9000)}`,
        title: '',
        clientId: '',
        client: '',
        type: 'Civil',
        status: 'Open',
        priority: 'Medium',
        description: '',
        court: '',
        startDate: '',
        deadline: '',
        billableHours: 0
    });

    const [editingCase, setEditingCase] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // Modified fetchCases to use getCases from API and handle clients
    const fetchCases = useCallback(async () => {
        setLoading(true);
        setError(null); // Reset error on new fetch
        try {
            const params = {};
            if (searchTerm) params.search = searchTerm;
            if (statusFilter !== 'All') params.status = statusFilter;

            const [casesData, clientsData] = await Promise.all([
                getCases(params), // Pass params to getCases
                getClients() // Fetch clients as well
            ]);
            setCases(casesData || []);
            setClients(clientsData || []); // Set clients
        } catch (err) {
            console.error('Failed to fetch cases or clients:', err);
            setError('Failed to fetch data. Please try again later.'); // Set error state
            setCases([]); // Clear cases on error
            setClients([]); // Clear clients on error
        } finally {
            setLoading(false);
        }
    }, [searchTerm, statusFilter]); // Removed 'api' dependency as it's no longer used

    useEffect(() => {
        const debounce = setTimeout(() => {
            fetchCases();
        }, 300);
        return () => clearTimeout(debounce);
    }, [fetchCases]);

    // Added handleSubmit for new case creation
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await createCase(formData);
            await fetchCases();
            setIsModalOpen(false);
            setFormData({
                caseNumber: `CASE-${Math.floor(1000 + Math.random() * 9000)}`,
                title: '',
                clientId: '',
                client: '',
                type: 'Civil',
                status: 'Open',
                priority: 'Medium',
                description: '',
                court: '',
                startDate: '',
                deadline: '',
                billableHours: 0
            });
        } catch (err) {
            alert('Failed to create case: ' + err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const { _id, ...updateData } = editingCase;
            await updateCase(_id, updateData);
            await fetchCases();
            setIsEditModalOpen(false);
            setEditingCase(null);
        } catch (err) {
            alert('Failed to update case: ' + err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this case? This action cannot be undone.')) return;
        try {
            await deleteCase(id);
            await fetchCases();
        } catch (err) {
            alert('Failed to delete case: ' + err.message);
        }
    };

    const openEditModal = (e, caseData) => {
        e.stopPropagation(); // Don't navigate to details
        setEditingCase({ ...caseData });
        setIsEditModalOpen(true);
    };

    return (
        <div className="fade-in">
            <Header title="Case Management" searchValue={searchTerm} onSearch={setSearchTerm} />

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: '0.75rem', flex: 1 }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                        <input
                            type="text"
                            placeholder="Search cases..."
                            className="form-input"
                            style={{ paddingLeft: '2.5rem', width: '280px' }}
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        className="form-input"
                        style={{ width: '160px', cursor: 'pointer' }}
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                    >
                        <option value="All">All Status</option>
                        <option value="Open">Open</option>
                        <option value="InProgress">In Progress</option>
                        <option value="Closed">Closed</option>
                    </select>
                </div>
                <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                    <Plus size={18} /> New Case
                </button>
            </div>

            {error && (
                <div style={{ background: '#fee2e2', color: 'var(--danger)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontWeight: 500 }}>
                    {error}
                </div>
            )}

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Case Title</th>
                            <th>Client</th>
                            <th>Type</th>
                            <th>Status</th>
                            <th>Priority</th>
                            <th>Start Date</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="7" style={{ textAlign: 'center', padding: '3rem' }}>
                                <Loader2 className="animate-spin" size={28} color="var(--primary)" style={{ margin: '0 auto' }} />
                                <p style={{ marginTop: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Fetching cases…</p>
                            </td></tr>
                        ) : cases.length > 0 ? cases.map(c => (
                            <tr key={c._id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/cases/${c._id}`)}>
                                <td style={{ fontWeight: 600 }}>{c.title || 'Untitled Case'}</td>
                                <td style={{ color: 'var(--text-muted)' }}>{c.clientName || c.clientId?.name || '—'}</td>
                                <td style={{ color: 'var(--text-muted)' }}>{c.caseType || 'General'}</td>
                                <td><span className={`badge badge-${c.status?.toLowerCase()}`}>{c.status}</span></td>
                                <td>
                                    <span style={{ fontWeight: 600, color: c.priority === 'High' ? 'var(--danger)' : c.priority === 'Medium' ? 'var(--warning)' : 'var(--text-muted)' }}>
                                        {c.priority || '—'}
                                    </span>
                                </td>
                                <td style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                    {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '—'}
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button
                                            className="btn btn-secondary"
                                            style={{ padding: '0.4rem', borderRadius: 'var(--radius-sm)' }}
                                            onClick={(e) => openEditModal(e, c)}
                                            title="Edit Case"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="btn btn-secondary"
                                            style={{ padding: '0.4rem', borderRadius: 'var(--radius-sm)', color: 'var(--danger)', borderColor: '#fee2e2' }}
                                            onClick={(e) => { e.stopPropagation(); handleDelete(c._id); }}
                                            title="Delete Case"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan="7" style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                                No cases found. Create your first case to get started.
                            </td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setIsModalOpen(false)}>
                    <div className="modal-box">
                        <div className="modal-header">
                            <h2>Create New Case</h2>
                            <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}><X size={20} /></button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Case Title *</label>
                                <input className="form-input" type="text" placeholder="e.g. Mitchell vs. State Motor Inc." value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })} required autoFocus />
                            </div>
                            <div className="form-group">
                                <label>Client *</label>
                                <select
                                    className="form-input"
                                    value={formData.clientId}
                                    onChange={e => {
                                        const selectedClient = clients.find(cl => cl._id === e.target.value);
                                        setFormData({
                                            ...formData,
                                            clientId: e.target.value,
                                            client: selectedClient ? selectedClient.name : ''
                                        });
                                    }}
                                    required
                                >
                                    <option value="">Select a client</option>
                                    {clients.map(cl => (
                                        <option key={cl._id} value={cl._id}>{cl.name} {cl.company ? `(${cl.company})` : ''}</option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label>Case Type</label>
                                    <select className="form-input" value={formData.type}
                                        onChange={e => setFormData({ ...formData, type: e.target.value })}>
                                        <option>Civil</option>
                                        <option>Criminal</option>
                                        <option>Family</option>
                                        <option>Corporate</option>
                                        <option>Real Estate</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Status</label>
                                    <select className="form-input" value={formData.status}
                                        onChange={e => setFormData({ ...formData, status: e.target.value })}>
                                        <option value="Open">Open</option>
                                        <option value="InProgress">In Progress</option>
                                        <option value="Closed">Closed</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Priority</label>
                                <select className="form-input" value={formData.priority}
                                    onChange={e => setFormData({ ...formData, priority: e.target.value })}>
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                </select>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label>Start Date</label>
                                    <input className="form-input" type="date" value={formData.startDate}
                                        onChange={e => setFormData({ ...formData, startDate: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Deadline</label>
                                    <input className="form-input" type="date" value={formData.deadline}
                                        onChange={e => setFormData({ ...formData, deadline: e.target.value })} />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label>Court</label>
                                    <input className="form-input" type="text" placeholder="e.g. Supreme Court" value={formData.court}
                                        onChange={e => setFormData({ ...formData, court: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Billable Hours</label>
                                    <input className="form-input" type="number" min="0" step="0.1" value={formData.billableHours}
                                        onChange={e => setFormData({ ...formData, billableHours: e.target.value })} />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Description</label>
                                <textarea className="form-input" rows={3} placeholder="Brief description of the case..." value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    style={{ resize: 'vertical', minHeight: '80px' }} />
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                                    {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Creating…</> : <><Plus size={16} /> Create Case</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isEditModalOpen && editingCase && (
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setIsEditModalOpen(false)}>
                    <div className="modal-box">
                        <div className="modal-header">
                            <h2>Edit Case</h2>
                            <button className="modal-close-btn" onClick={() => setIsEditModalOpen(false)}><X size={20} /></button>
                        </div>

                        <form onSubmit={handleUpdate}>
                            <div className="form-group">
                                <label>Case Title *</label>
                                <input className="form-input" type="text" value={editingCase.title}
                                    onChange={e => setEditingCase({ ...editingCase, title: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>Client *</label>
                                <select
                                    className="form-input"
                                    value={editingCase.clientId?._id || editingCase.clientId || ''}
                                    onChange={e => {
                                        const selectedClient = clients.find(cl => cl._id === e.target.value);
                                        setEditingCase({
                                            ...editingCase,
                                            clientId: e.target.value,
                                            clientName: selectedClient ? selectedClient.name : ''
                                        });
                                    }}
                                    required
                                >
                                    <option value="">Select a client</option>
                                    {clients.map(cl => (
                                        <option key={cl._id} value={cl._id}>{cl.name} {cl.company ? `(${cl.company})` : ''}</option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label>Case Type</label>
                                    <select className="form-input" value={editingCase.caseType}
                                        onChange={e => setEditingCase({ ...editingCase, caseType: e.target.value })}>
                                        <option>Civil</option>
                                        <option>Criminal</option>
                                        <option>Family</option>
                                        <option>Corporate</option>
                                        <option>Real Estate</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Status</label>
                                    <select className="form-input" value={editingCase.status}
                                        onChange={e => setEditingCase({ ...editingCase, status: e.target.value })}>
                                        <option value="Open">Open</option>
                                        <option value="InProgress">In Progress</option>
                                        <option value="Closed">Closed</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Priority</label>
                                <select className="form-input" value={editingCase.priority}
                                    onChange={e => setEditingCase({ ...editingCase, priority: e.target.value })}>
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                </select>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label>Start Date</label>
                                    <input className="form-input" type="date" value={editingCase.startDate ? editingCase.startDate.split('T')[0] : ''}
                                        onChange={e => setEditingCase({ ...editingCase, startDate: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Deadline</label>
                                    <input className="form-input" type="date" value={editingCase.deadline ? editingCase.deadline.split('T')[0] : ''}
                                        onChange={e => setEditingCase({ ...editingCase, deadline: e.target.value })} />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label>Court</label>
                                    <input className="form-input" type="text" value={editingCase.court || ''}
                                        onChange={e => setEditingCase({ ...editingCase, court: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Billable Hours</label>
                                    <input className="form-input" type="number" min="0" step="0.1" value={editingCase.billableHours || 0}
                                        onChange={e => setEditingCase({ ...editingCase, billableHours: e.target.value })} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea className="form-input" rows={3} value={editingCase.description || ''}
                                    onChange={e => setEditingCase({ ...editingCase, description: e.target.value })}
                                    style={{ resize: 'vertical', minHeight: '80px' }} />
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
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

export default Cases;

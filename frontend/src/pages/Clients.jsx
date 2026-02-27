import React, { useState, useEffect } from 'react';
import Header from '../components/Header.jsx';
import { Plus, Mail, Phone, Building, Loader2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getClients, createClient, updateClient, deleteClient } from '../api/clients';
import { getCases } from '../api/cases';

const Clients = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', company: '', address: '' });

    // Edit state
    const [editingClient, setEditingClient] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    useEffect(() => {
        const debounce = setTimeout(() => {
            fetchClients();
        }, 300);
        return () => clearTimeout(debounce);
    }, [searchTerm]);

    const fetchClients = async () => {
        setLoading(true); setError(null);
        try {
            const params = {};
            if (searchTerm) params.search = searchTerm;
            const data = await getClients(params);
            setClients(data || []);
        } catch (err) { setError('Failed to fetch clients.'); }
        finally { setLoading(false); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await createClient(formData);
            await fetchClients();
            setIsModalOpen(false);
            setFormData({ name: '', email: '', phone: '', company: '', address: '' });
        } catch (err) { alert('Failed to create client: ' + err.message); }
        finally { setIsSubmitting(false); }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await updateClient(editingClient._id, editingClient);
            await fetchClients();
            setIsEditModalOpen(false);
            setEditingClient(null);
        } catch (err) { alert('Failed to update client: ' + err.message); }
        finally { setIsSubmitting(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this client?')) return;
        try {
            await deleteClient(id);
            await fetchClients();
        } catch (err) { alert('Failed to delete client: ' + err.message); }
    };

    const openEditModal = (client) => {
        setEditingClient({ ...client });
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        setEditingClient(null);
    };

    const handleVisitCase = async (client) => {
        try {
            // Try searching by client name first since clientId linkage might be missing for older cases
            const searchParams = { search: client.name };
            const cases = await getCases(searchParams);

            if (cases && cases.length > 0) {
                // Try to find the first case that exactly matches this client name or ID
                const targetCase = cases.find(c => c.clientName === client.name || c.clientId?._id === client._id) || cases[0];
                navigate(`/cases/${targetCase._id}`);
            } else {
                alert(`No case found for client: ${client.name}`);
            }
        } catch (err) {
            console.error('Visit Case Navigation Error:', err);
            alert('Could not navigate to case overview.');
        }
    };

    const closeModal = () => setIsModalOpen(false);

    return (
        <div className="fade-in">
            <Header title="Clients" searchValue={searchTerm} onSearch={setSearchTerm} />

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
                <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                    <Plus size={18} /> Add Client
                </button>
            </div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                    <Loader2 className="animate-spin" size={36} color="var(--primary)" />
                </div>
            ) : error ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--danger)' }}>
                    <p>{error}</p>
                    <button onClick={fetchClients} className="btn btn-primary" style={{ marginTop: '1rem' }}>Retry</button>
                </div>
            ) : clients.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-muted)' }}>
                    <Building size={48} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
                    <p style={{ fontSize: '1.125rem', fontWeight: 600 }}>No clients yet</p>
                    <p style={{ marginTop: '0.5rem' }}>Add your first client to get started.</p>
                    <button className="btn btn-primary" style={{ marginTop: '1.5rem' }} onClick={() => setIsModalOpen(true)}>
                        <Plus size={18} /> Add Your First Client
                    </button>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                    {clients.map(client => (
                        <div key={client._id} className="card client-card" style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.125rem', flexShrink: 0 }}>
                                        {client.name?.[0]?.toUpperCase() || '?'}
                                    </div>
                                    <div>
                                        <p style={{ fontWeight: 700, fontSize: '1rem' }}>{client.name}</p>
                                        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{client.company || 'Private Client'}</p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.4rem' }}>
                                    <button onClick={() => openEditModal(client)} style={{ border: 'none', background: 'none', color: 'var(--primary)', cursor: 'pointer', padding: '4px' }} title="Edit">Edit</button>
                                    <button onClick={() => handleDelete(client._id)} style={{ border: 'none', background: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '4px' }} title="Delete">Delete</button>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', flex: 1 }}>
                                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                    <Mail size={15} color="var(--primary)" />
                                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{client.email}</span>
                                </div>
                                {client.phone && (
                                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                        <Phone size={15} color="var(--primary)" />
                                        {client.phone}
                                    </div>
                                )}
                            </div>

                            <button
                                className="btn btn-secondary"
                                style={{ marginTop: '1.5rem', width: '100%', fontSize: '0.875rem' }}
                                onClick={() => handleVisitCase(client)}
                            >
                                Visit Case
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {isModalOpen && (
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
                    <div className="modal-box">
                        <div className="modal-header">
                            <h2>Add New Client</h2>
                            <button className="modal-close-btn" onClick={closeModal}><X size={20} /></button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Full Name *</label>
                                <input className="form-input" type="text" placeholder="e.g. Jane Cooper" value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })} required autoFocus />
                            </div>
                            <div className="form-group">
                                <label>Email Address *</label>
                                <input className="form-input" type="email" placeholder="jane@example.com" value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>Phone Number</label>
                                <input className="form-input" type="text" placeholder="+1 (555) 000-0000" value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Company / Organization</label>
                                <input className="form-input" type="text" placeholder="e.g. Acme Corporation" value={formData.company}
                                    onChange={e => setFormData({ ...formData, company: e.target.value })} />
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                                    {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Saving…</> : <><Plus size={16} /> Add Client</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {isEditModalOpen && editingClient && (
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeEditModal()}>
                    <div className="modal-box">
                        <div className="modal-header">
                            <h2>Edit Client</h2>
                            <button className="modal-close-btn" onClick={closeEditModal}><X size={20} /></button>
                        </div>

                        <form onSubmit={handleUpdate}>
                            <div className="form-group">
                                <label>Full Name *</label>
                                <input className="form-input" type="text" value={editingClient.name}
                                    onChange={e => setEditingClient({ ...editingClient, name: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>Email Address *</label>
                                <input className="form-input" type="email" value={editingClient.email}
                                    onChange={e => setEditingClient({ ...editingClient, email: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>Phone Number</label>
                                <input className="form-input" type="text" value={editingClient.phone || ''}
                                    onChange={e => setEditingClient({ ...editingClient, phone: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Company / Organization</label>
                                <input className="form-input" type="text" value={editingClient.company || ''}
                                    onChange={e => setEditingClient({ ...editingClient, company: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Address</label>
                                <textarea className="form-input" value={editingClient.address || ''}
                                    onChange={e => setEditingClient({ ...editingClient, address: e.target.value })}
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

export default Clients;

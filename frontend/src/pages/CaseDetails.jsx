import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import {
    ArrowLeft, Calendar, User, Scale, Tag, Plus, FileText,
    X, Loader2, Receipt, AlertCircle
} from 'lucide-react';
import { getCaseById } from '../api/cases';
import { getTasks } from '../api/tasks';
import { getDocuments, uploadDocument } from '../api/documents';
import { createInvoice, getInvoices } from '../api/invoices';
import apiClient from '../api/apiClient';

const CaseDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [caseData, setCaseData] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [notes, setNotes] = useState([]);
    const [activities, setActivities] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal state
    const [showDocModal, setShowDocModal] = useState(false);
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [showNoteModal, setShowNoteModal] = useState(false);

    // Form state
    const [docForm, setDocForm] = useState({ name: '', category: 'Legal Filing', description: '' });
    const [invoiceForm, setInvoiceForm] = useState({ clientName: '', amount: '', hours: '', hourlyRate: '', description: '', dueDate: '' });
    const [noteForm, setNoteForm] = useState({ content: '' });

    const [submitting, setSubmitting] = useState(false);

    const fetchAllCaseData = async () => {
        setLoading(true); setError(null);

        let fetchedCase = null;
        try {
            fetchedCase = await getCaseById(id);
            setCaseData(fetchedCase);
        } catch (err) {
            setError('Failed to load case details. The case might have been deleted or there is a network error.');
            setLoading(false);
            return;
        }

        // Fetch remaining data independently so one failure doesn't break the page
        try {
            const tData = await getTasks(id);
            setTasks(tData || []);
        } catch { setTasks([]); }

        try {
            const dData = await getDocuments(id);
            setDocuments(dData || []);
        } catch { setDocuments([]); }

        try {
            const invData = await getInvoices(id);
            setInvoices(invData || []);
        } catch { setInvoices([]); }

        try {
            const nData = await apiClient.get(`/notes?caseId=${id}`);
            setNotes(nData.data || []);
        } catch { setNotes([]); }

        try {
            const aData = await apiClient.get(`/activities?caseId=${id}`);
            setActivities(aData.data || []);
        } catch { setActivities([]); }

        setLoading(false);
    };

    useEffect(() => { fetchAllCaseData(); }, [id]);

    // ------------------- Handlers -------------------

    const handleDocUpload = async (e) => {
        e.preventDefault();
        const fileInput = document.getElementById('doc-file-input');
        const file = fileInput?.files[0];

        if (!file && !docForm.name) {
            alert('Please select a file or enter a name.');
            return;
        }

        setSubmitting(true);
        try {
            const formData = new FormData();
            if (file) formData.append('file', file);
            formData.append('name', docForm.name || file?.name || 'Untitled Document');
            formData.append('category', docForm.category);
            formData.append('description', docForm.description);
            formData.append('caseId', id);

            await uploadDocument(formData);
            await fetchAllCaseData();
            setShowDocModal(false);
            setDocForm({ name: '', category: 'Legal Filing', description: '' });
            if (fileInput) fileInput.value = ''; // Reset file input
        } catch (err) {
            alert('Upload failed: ' + (err.response?.data?.message || err.message));
        } finally {
            setSubmitting(false);
        }
    };

    const handleCreateInvoice = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await createInvoice({
                ...invoiceForm,
                caseId: id,
                clientName: invoiceForm.clientName || caseData?.clientName || 'Client',
                amount: parseFloat(invoiceForm.amount),
            });
            await fetchAllCaseData();
            setShowInvoiceModal(false);
            setInvoiceForm({ clientName: '', amount: '', hours: '', hourlyRate: '', description: '', dueDate: '' });
        } catch (err) { alert('Invoice creation failed: ' + err.message); }
        finally { setSubmitting(false); }
    };

    const handleAddNote = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await apiClient.post('/notes', { caseId: id, content: noteForm.content });
            await fetchAllCaseData();
            setShowNoteModal(false);
            setNoteForm({ content: '' });
        } catch (err) { alert('Note creation failed: ' + err.message); }
        finally { setSubmitting(false); }
    };

    // ------------------- Render -------------------

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: '1rem' }}>
            <Loader2 size={36} color="var(--primary)" className="animate-spin" />
            <p style={{ color: 'var(--text-muted)' }}>Loading case details…</p>
        </div>
    );

    if (error || !caseData) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: '1rem' }}>
            <AlertCircle size={40} color="var(--danger)" />
            <p style={{ color: 'var(--danger)', fontWeight: 600 }}>{error || 'Case not found'}</p>
            <button className="btn btn-primary" onClick={() => navigate('/cases')}>Back to Cases</button>
        </div>
    );

    return (
        <div className="fade-in">
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.75rem' }}>
                <button className="btn" style={{ background: 'white', border: '1.5px solid var(--border)', padding: '0.5rem', borderRadius: 'var(--radius-md)' }} onClick={() => navigate('/cases')}>
                    <ArrowLeft size={20} />
                </button>
                <div style={{ flex: 1 }}>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.02em' }}>{caseData.title}</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginTop: '0.125rem' }}>Case ID: {id}</p>
                </div>
                <span style={{
                    padding: '0.375rem 1rem', borderRadius: '9999px', fontSize: '0.8125rem', fontWeight: 700,
                    background: caseData.status === 'Open' ? '#dcfce7' : caseData.status === 'InProgress' ? '#fef9c3' : '#f1f5f9',
                    color: caseData.status === 'Open' ? '#166534' : caseData.status === 'InProgress' ? '#854d0e' : '#475569',
                }}>
                    {caseData.status}
                </span>
            </div>

            {/* Overview + Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="card">
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--secondary)' }}>Overview</h3>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: 1.7, fontSize: '0.9375rem' }}>
                        {caseData.description || 'No description provided.'}
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                        {[
                            { icon: <User size={16} color="var(--primary)" />, label: 'Client', value: caseData.clientName || caseData.clientId?.name || 'Unknown' },
                            { icon: <Scale size={16} color="var(--primary)" />, label: 'Court', value: caseData.court || 'Not assigned' },
                            { icon: <Calendar size={16} color="var(--primary)" />, label: 'Start Date', value: caseData.startDate ? new Date(caseData.startDate).toLocaleDateString() : 'N/A' },
                            { icon: <Tag size={16} color="var(--primary)" />, label: 'Case Type', value: caseData.caseType || 'General' },
                        ].map(({ icon, label, value }) => (
                            <div key={label} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                                <div style={{ marginTop: '2px' }}>{icon}</div>
                                <div>
                                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{label}</p>
                                    <p style={{ fontWeight: 600, fontSize: '0.9rem', marginTop: '0.125rem' }}>{value}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--secondary)' }}>Metrics</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
                        <div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Billable Hours</p>
                            <p style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--secondary)', marginTop: '0.25rem' }}>{caseData.billableHours || 0}</p>
                        </div>
                        <div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Upcoming Deadline</p>
                            <p style={{ fontWeight: 700, color: 'var(--danger)', marginTop: '0.25rem' }}>
                                {caseData.deadline ? new Date(caseData.deadline).toLocaleDateString() : 'No deadline'}
                            </p>
                        </div>
                        <div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Invoices</p>
                            <p style={{ fontWeight: 700, marginTop: '0.25rem', color: 'var(--primary)' }}>{invoices.length} invoice(s)</p>
                        </div>
                    </div>
                    <button className="btn btn-primary" style={{ width: '100%', marginTop: '1.25rem' }} onClick={() => setShowInvoiceModal(true)}>
                        <Receipt size={16} /> Create Invoice
                    </button>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.75rem' }}>
                        Managed by {caseData.createdBy || 'Unknown'}
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <Tabs className="case-tabs">
                <TabList style={{ display: 'flex', gap: '0', borderBottom: '1px solid var(--border)', marginBottom: '1.5rem' }}>
                    {[`Tasks (${tasks.length})`, `Documents (${documents.length})`, `Notes (${notes.length})`, 'Activity History', `Invoices (${invoices.length})`].map(tab => (
                        <Tab key={tab}>{tab}</Tab>
                    ))}
                </TabList>

                {/* TASKS TAB */}
                <TabPanel>
                    <div className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>Case Tasks</h4>
                            <button className="btn btn-primary" style={{ fontSize: '0.8125rem', padding: '0.45rem 1rem' }}
                                onClick={() => navigate('/tasks')}>
                                <Plus size={16} /> Add Task
                            </button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {tasks.length > 0 ? tasks.map(task => (
                                <div key={task._id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.875rem 1rem', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: task.status === 'Completed' ? 'var(--success)' : task.priority === 'High' ? 'var(--danger)' : 'var(--primary)', flexShrink: 0 }} />
                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{task.title}</p>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>
                                            {task.priority} Priority · {task.status}
                                        </p>
                                    </div>
                                    {task.deadline && (
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                                            {new Date(task.deadline).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>
                            )) : (
                                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    <p style={{ marginBottom: '1rem' }}>No tasks for this case yet.</p>
                                    <button className="btn btn-primary" onClick={() => navigate('/tasks')}>
                                        <Plus size={16} /> Create Task
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </TabPanel>

                {/* DOCUMENTS TAB */}
                <TabPanel>
                    <div className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>Case Documents</h4>
                            <button className="btn btn-primary" style={{ fontSize: '0.8125rem', padding: '0.45rem 1rem' }}
                                onClick={() => setShowDocModal(true)}>
                                <Plus size={16} /> Upload
                            </button>
                        </div>
                        {documents.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {documents.map(doc => (
                                    <div key={doc._id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.875rem', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                                        <FileText size={20} color="var(--primary)" flexShrink={0} />
                                        <div style={{ flex: 1 }}>
                                            <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{doc.name}</p>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{doc.category} · {new Date(doc.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.625rem', background: '#f1f5f9', borderRadius: '9999px', color: 'var(--text-muted)', fontWeight: 600 }}>
                                            {doc.fileType || 'PDF'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                <FileText size={40} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                                <p style={{ marginBottom: '1rem' }}>No documents uploaded yet.</p>
                                <button className="btn btn-primary" onClick={() => setShowDocModal(true)}>
                                    <Plus size={16} /> Upload First Document
                                </button>
                            </div>
                        )}
                    </div>
                </TabPanel>

                {/* NOTES TAB */}
                <TabPanel>
                    <div className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>Case Notes</h4>
                            <button className="btn btn-primary" style={{ fontSize: '0.8125rem', padding: '0.45rem 1rem' }}
                                onClick={() => setShowNoteModal(true)}>
                                <Plus size={16} /> New Note
                            </button>
                        </div>
                        {notes.length > 0 ? notes.map(note => (
                            <div key={note._id} style={{ padding: '1rem', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', marginBottom: '0.75rem' }}>
                                <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7, fontSize: '0.9rem' }}>{note.content}</p>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
                                    Added on {new Date(note.createdAt).toLocaleString()}
                                </p>
                            </div>
                        )) : (
                            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                <p>Start adding notes to this case.</p>
                            </div>
                        )}
                    </div>
                </TabPanel>

                {/* ACTIVITY TAB */}
                <TabPanel>
                    <div className="card">
                        <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.5rem' }}>Activity Timeline</h4>
                        <div className="activity-list">
                            {activities.length > 0 ? activities.map(activity => (
                                <div key={activity._id} className="activity-item">
                                    <div className="activity-dot" />
                                    <div>
                                        <p className="activity-msg">{activity.message}</p>
                                        <p className="activity-meta">
                                            {activity.user} · {new Date(activity.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            )) : (
                                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No activities recorded yet.</p>
                            )}
                        </div>
                    </div>
                </TabPanel>

                {/* INVOICES TAB */}
                <TabPanel>
                    <div className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>Invoices</h4>
                            <button className="btn btn-primary" style={{ fontSize: '0.8125rem', padding: '0.45rem 1rem' }}
                                onClick={() => setShowInvoiceModal(true)}>
                                <Plus size={16} /> Create Invoice
                            </button>
                        </div>
                        {invoices.length > 0 ? (
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr>
                                        {['Invoice #', 'Client', 'Amount', 'Status', 'Due Date'].map(h => (
                                            <th key={h} style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, borderBottom: '1px solid var(--border)' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoices.map(inv => (
                                        <tr key={inv._id}>
                                            <td style={{ padding: '0.875rem', fontWeight: 700, fontSize: '0.875rem' }}>{inv.invoiceNumber}</td>
                                            <td style={{ padding: '0.875rem', fontSize: '0.875rem' }}>{inv.clientName}</td>
                                            <td style={{ padding: '0.875rem', fontWeight: 700, color: 'var(--primary)' }}>${inv.amount.toFixed(2)}</td>
                                            <td style={{ padding: '0.875rem' }}>
                                                <span style={{ padding: '0.25rem 0.625rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, background: inv.status === 'Paid' ? '#dcfce7' : inv.status === 'Overdue' ? '#fee2e2' : '#f1f5f9', color: inv.status === 'Paid' ? '#166534' : inv.status === 'Overdue' ? '#991b1b' : '#475569' }}>
                                                    {inv.status}
                                                </span>
                                            </td>
                                            <td style={{ padding: '0.875rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                                {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : '—'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                <Receipt size={40} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                                <p style={{ marginBottom: '1rem' }}>No invoices created yet.</p>
                                <button className="btn btn-primary" onClick={() => setShowInvoiceModal(true)}>
                                    <Plus size={16} /> Create First Invoice
                                </button>
                            </div>
                        )}
                    </div>
                </TabPanel>
            </Tabs>

            {/* === DOCUMENT UPLOAD MODAL === */}
            {showDocModal && (
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowDocModal(false)}>
                    <div className="modal-box">
                        <div className="modal-header">
                            <h2>Upload Document</h2>
                            <button className="modal-close-btn" onClick={() => setShowDocModal(false)}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleDocUpload}>
                            <div className="form-group">
                                <label>Select File</label>
                                <input
                                    className="form-input"
                                    type="file"
                                    id="doc-file-input"
                                    onChange={e => {
                                        if (e.target.files[0] && !docForm.name) {
                                            setDocForm({ ...docForm, name: e.target.files[0].name });
                                        }
                                    }}
                                />
                            </div>
                            <div className="form-group">
                                <label>Document Name *</label>
                                <input className="form-input" type="text" placeholder="e.g. Witness_Statement.pdf" value={docForm.name}
                                    onChange={e => setDocForm({ ...docForm, name: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>Category</label>
                                <select className="form-input" value={docForm.category}
                                    onChange={e => setDocForm({ ...docForm, category: e.target.value })}>
                                    <option>Legal Filing</option>
                                    <option>Evidence</option>
                                    <option>Client Communication</option>
                                    <option>Court Order</option>
                                    <option>Internal Note</option>
                                    <option>Other</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <input className="form-input" type="text" placeholder="Brief description (optional)" value={docForm.description}
                                    onChange={e => setDocForm({ ...docForm, description: e.target.value })} />
                            </div>
                            <div style={{ border: '2px dashed var(--border)', borderRadius: 'var(--radius-md)', padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                                <FileText size={28} style={{ margin: '0 auto 0.5rem', opacity: 0.4 }} />
                                <p style={{ fontSize: '0.8125rem' }}>File upload simulated — metadata saved to MongoDB</p>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowDocModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={submitting}>
                                    {submitting ? <><Loader2 size={15} className="animate-spin" /> Uploading…</> : <><Plus size={15} /> Upload</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* === CREATE INVOICE MODAL === */}
            {showInvoiceModal && (
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowInvoiceModal(false)}>
                    <div className="modal-box">
                        <div className="modal-header">
                            <h2>Create Invoice</h2>
                            <button className="modal-close-btn" onClick={() => setShowInvoiceModal(false)}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleCreateInvoice}>
                            <div className="form-group">
                                <label>Client Name</label>
                                <input className="form-input" type="text" placeholder={caseData?.clientName || 'Client name'}
                                    value={invoiceForm.clientName}
                                    onChange={e => setInvoiceForm({ ...invoiceForm, clientName: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Total Amount ($) *</label>
                                <input className="form-input" type="number" min="0" step="0.01" placeholder="e.g. 2500.00" value={invoiceForm.amount}
                                    onChange={e => setInvoiceForm({ ...invoiceForm, amount: e.target.value })} required autoFocus />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label>Billable Hours</label>
                                    <input className="form-input" type="number" min="0" step="0.5" placeholder="e.g. 10"
                                        value={invoiceForm.hours}
                                        onChange={e => setInvoiceForm({ ...invoiceForm, hours: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Hourly Rate ($)</label>
                                    <input className="form-input" type="number" min="0" step="0.01" placeholder="e.g. 250"
                                        value={invoiceForm.hourlyRate}
                                        onChange={e => setInvoiceForm({ ...invoiceForm, hourlyRate: e.target.value })} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea className="form-input" rows={2} placeholder="Services rendered…"
                                    value={invoiceForm.description}
                                    onChange={e => setInvoiceForm({ ...invoiceForm, description: e.target.value })}
                                    style={{ resize: 'vertical' }} />
                            </div>
                            <div className="form-group">
                                <label>Due Date</label>
                                <input className="form-input" type="date" value={invoiceForm.dueDate}
                                    onChange={e => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })} />
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowInvoiceModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={submitting}>
                                    {submitting ? <><Loader2 size={15} className="animate-spin" /> Creating…</> : <><Receipt size={15} /> Create Invoice</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* === ADD NOTE MODAL === */}
            {showNoteModal && (
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowNoteModal(false)}>
                    <div className="modal-box">
                        <div className="modal-header">
                            <h2>Add Note</h2>
                            <button className="modal-close-btn" onClick={() => setShowNoteModal(false)}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleAddNote}>
                            <div className="form-group">
                                <label>Note Content *</label>
                                <textarea className="form-input" rows={5} placeholder="Write your case note here…"
                                    value={noteForm.content}
                                    onChange={e => setNoteForm({ content: e.target.value })}
                                    required autoFocus
                                    style={{ resize: 'vertical', minHeight: '120px' }} />
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowNoteModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={submitting}>
                                    {submitting ? <><Loader2 size={15} className="animate-spin" /> Saving…</> : <><Plus size={15} /> Add Note</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CaseDetails;

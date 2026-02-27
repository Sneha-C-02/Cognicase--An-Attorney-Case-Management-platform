import React, { useState, useEffect } from 'react';
import Header from '../components/Header.jsx';
import { FileText, Download, Loader2, Plus, Search, Filter, Trash2, Calendar, File, X } from 'lucide-react';
import { getDocuments, uploadDocument } from '../api/documents';
import { getCases } from '../api/cases';

const Documents = () => {
    const [documents, setDocuments] = useState([]);
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        caseId: '',
        category: 'Legal Filing',
        description: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [docsData, casesData] = await Promise.all([
                getDocuments(),
                getCases()
            ]);
            setDocuments(docsData || []);
            setCases(casesData || []);
        } catch (err) {
            setError('Failed to fetch documents or cases.');
            console.error('Failed to fetch data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const fileInput = document.getElementById('documents-file-input');
        const file = fileInput?.files[0];

        if (!file && !formData.name) {
            alert('Please select a file or enter a name.');
            return;
        }

        setIsSubmitting(true);
        try {
            const data = new FormData();
            if (file) data.append('file', file);
            data.append('name', formData.name || file?.name || 'Untitled Document');
            data.append('caseId', formData.caseId);
            data.append('category', formData.category);
            data.append('description', formData.description);

            await uploadDocument(data);
            setIsModalOpen(false);
            setFormData({ name: '', caseId: '', category: 'Legal Filing', description: '' });
            if (fileInput) fileInput.value = '';
            fetchData();
        } catch (err) {
            alert('Failed to upload document: ' + (err.response?.data?.message || err.message));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fade-in">
            <Header title="Documents" />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', gap: '1rem', flex: 1, maxWidth: '600px' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input
                            type="text"
                            placeholder="Search documents..."
                            className="input-search"
                            style={{ paddingLeft: '2.5rem', width: '100%', height: '42px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}
                        />
                    </div>
                </div>
                <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                    <Plus size={18} />
                    Upload Document
                </button>
            </div>

            <div className="card">
                {loading ? (
                    <div className="loading-state" style={{ padding: '3rem', textAlign: 'center' }}>
                        <Loader2 className="animate-spin" size={32} color="var(--primary)" style={{ margin: '0 auto 1rem' }} />
                        <p>Loading documents...</p>
                    </div>
                ) : error ? (
                    <div className="error-state" style={{ padding: '3rem', textAlign: 'center', color: 'var(--danger)' }}>
                        <p>{error}</p>
                        <button onClick={fetchData} className="btn-text" style={{ marginTop: '1rem', color: 'var(--primary)', fontWeight: 600 }}>Try Again</button>
                    </div>
                ) : documents.length === 0 ? (
                    <div className="empty-state" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <FileText size={48} style={{ marginBottom: '1rem', opacity: 0.2 }} />
                        <p>No documents found. Start by uploading a legal filing or evidence.</p>
                    </div>
                ) : (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Document Name</th>
                                    <th>Associated Case</th>
                                    <th>Category</th>
                                    <th>Upload Date</th>
                                    <th>Size</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {documents.map((doc) => (
                                    <tr key={doc._id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <FileText size={20} color="var(--primary)" />
                                                <div>
                                                    <div style={{ fontWeight: 600, color: 'var(--secondary)' }}>{doc.name}</div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{doc.fileType || 'PDF'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{doc.caseId?.title || 'N/A'}</td>
                                        <td>
                                            <span className="badge" style={{ backgroundColor: '#f1f5f9', color: '#475569' }}>
                                                {doc.category || 'General'}
                                            </span>
                                        </td>
                                        <td>{new Date(doc.createdAt).toLocaleDateString()}</td>
                                        <td>{doc.fileSize || 'N/A'}</td>
                                        <td style={{ textAlign: 'right' }}>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                                {doc.fileUrl && doc.fileUrl !== '#' && (
                                                    <a href={`http://localhost:5000${doc.fileUrl}`} target="_blank" rel="noopener noreferrer" className="btn-icon" title="View Document">
                                                        <Download size={16} />
                                                    </a>
                                                )}
                                                <button className="btn-icon" style={{ color: 'var(--danger)' }}>
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setIsModalOpen(false)}>
                    <div className="modal-box">
                        <div className="modal-header">
                            <h2>Upload Document</h2>
                            <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}><X size={20} /></button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Select File</label>
                                <input
                                    className="form-input"
                                    type="file"
                                    id="documents-file-input"
                                    onChange={e => {
                                        if (e.target.files[0] && !formData.name) {
                                            setFormData({ ...formData, name: e.target.files[0].name });
                                        }
                                    }}
                                />
                            </div>
                            <div className="form-group">
                                <label>Document Name *</label>
                                <input className="form-input" type="text" placeholder="e.g. Contract_Draft_v1"
                                    value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>Associate with Case</label>
                                <select className="form-input" value={formData.caseId}
                                    onChange={e => setFormData({ ...formData, caseId: e.target.value })}>
                                    <option value="">Select a Case (Optional)</option>
                                    {cases.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Category</label>
                                <select className="form-input" value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}>
                                    <option>Legal Filing</option>
                                    <option>Client Communication</option>
                                    <option>Evidence</option>
                                    <option>Internal Note</option>
                                    <option>Other</option>
                                </select>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                                    {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Uploading…</> : <><Plus size={16} /> Upload Document</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Documents;

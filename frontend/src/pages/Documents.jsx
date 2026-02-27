import React, { useState, useEffect } from 'react';
import Header from '../components/Header.jsx';
import { FileText, Download, Loader2, Plus, Search, Filter, Trash2, Calendar, File, X } from 'lucide-react';
import { getDocuments, uploadDocument, updateDocument, deleteDocument } from '../api/documents';
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
    const [searchTerm, setSearchTerm] = useState('');

    // Edit state
    const [editingDoc, setEditingDoc] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    useEffect(() => {
        const debounce = setTimeout(() => {
            fetchData();
        }, 300);
        return () => clearTimeout(debounce);
    }, [searchTerm]);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const params = {};
            if (searchTerm) params.search = searchTerm;
            const [docsData, casesData] = await Promise.all([
                getDocuments(params),
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

    const handleUpdate = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await updateDocument(editingDoc._id, editingDoc);
            setIsEditModalOpen(false);
            setEditingDoc(null);
            fetchData();
        } catch (err) {
            alert('Failed to update document: ' + err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this document?')) return;
        try {
            await deleteDocument(id);
            fetchData();
        } catch (err) {
            alert('Failed to delete document: ' + err.message);
        }
    };

    const openEditModal = (doc) => {
        setEditingDoc({
            ...doc,
            caseId: doc.caseId?._id || doc.caseId || ''
        });
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        setEditingDoc(null);
    };

    return (
        <div className="fade-in">
            <Header title="Documents" searchValue={searchTerm} onSearch={setSearchTerm} />

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
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
                                                <button onClick={() => openEditModal(doc)} className="btn-icon" style={{ color: 'var(--primary)' }} title="Edit">
                                                    <Plus size={16} />
                                                </button>
                                                <button onClick={() => handleDelete(doc._id)} className="btn-icon" style={{ color: 'var(--danger)' }} title="Delete">
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

            {
                isModalOpen && (
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
                )
            }
            {isEditModalOpen && editingDoc && (
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeEditModal()}>
                    <div className="modal-box">
                        <div className="modal-header">
                            <h2>Edit Document</h2>
                            <button className="modal-close-btn" onClick={closeEditModal}><X size={20} /></button>
                        </div>

                        <form onSubmit={handleUpdate}>
                            <div className="form-group">
                                <label>Document Name *</label>
                                <input className="form-input" type="text"
                                    value={editingDoc.name} onChange={e => setEditingDoc({ ...editingDoc, name: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>Associate with Case</label>
                                <select className="form-input" value={editingDoc.caseId}
                                    onChange={e => setEditingDoc({ ...editingDoc, caseId: e.target.value })}>
                                    <option value="">Select a Case (Optional)</option>
                                    {cases.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Category</label>
                                <select className="form-input" value={editingDoc.category}
                                    onChange={e => setEditingDoc({ ...editingDoc, category: e.target.value })}>
                                    <option>Legal Filing</option>
                                    <option>Client Communication</option>
                                    <option>Evidence</option>
                                    <option>Internal Note</option>
                                    <option>Other</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea className="form-input" value={editingDoc.description || ''}
                                    onChange={e => setEditingDoc({ ...editingDoc, description: e.target.value })}
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

export default Documents;

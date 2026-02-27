import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApi } from '../hooks/useApi';
import { User, Briefcase, Building, GraduationCap, ArrowRight, Loader2, Sparkles, Scale } from 'lucide-react';

const Onboarding = () => {
    const api = useApi();
    const navigate = useNavigate();
    const { user, updateOnboardedStatus } = useAuth();

    const [formData, setFormData] = useState({
        name: user?.name || '',
        role: 'Attorney',
        organization: '',
        practiceArea: '',
        experienceYears: '0-3 years'
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const data = await api.post('/auth/complete-onboarding', formData);
            if (data.user) {
                updateOnboardedStatus(data.user);
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.message || 'Verification failed. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="onboarding-page">
            <div className="onboarding-card-premium glass fade-in-up">
                <div className="onboarding-header">
                    <div className="logo" style={{ justifyContent: 'center', marginBottom: '1.5rem' }}>
                        <Scale size={36} className="logo-icon hover-elevate" style={{ transition: 'transform 0.3s' }} />
                        <span style={{ fontSize: '1.75rem', fontWeight: 800 }}>CogniCase</span>
                    </div>
                    <h1 style={{ letterSpacing: '-0.02em', fontSize: '2.5rem' }}>Create Your Professional Profile</h1>
                    <p style={{ fontSize: '1.1rem', marginTop: '0.5rem' }}>Setup your digital legal workspace in seconds.</p>
                </div>

                {error && <div className="error-badge-premium">{error}</div>}

                <form onSubmit={handleSubmit} className="onboarding-form">
                    <div className="form-group">
                        <label>Full Name</label>
                        <div style={{ position: 'relative' }}>
                            <User size={18} style={{ position: 'absolute', left: '1rem', top: '1rem', color: 'var(--primary)' }} />
                            <input
                                type="text"
                                className="input-premium"
                                style={{ paddingLeft: '3rem' }}
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. Adv. Julian Wright"
                                required
                            />
                        </div>
                    </div>

                    <div className="onboarding-grid">
                        <div className="form-group">
                            <label>Professional Role</label>
                            <div style={{ position: 'relative' }}>
                                <Briefcase size={18} style={{ position: 'absolute', left: '1rem', top: '1rem', color: 'var(--primary)' }} />
                                <select
                                    className="input-premium"
                                    style={{ paddingLeft: '3rem' }}
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                >
                                    <option value="Attorney">Attorney</option>
                                    <option value="Partner">Law Firm Partner</option>
                                    <option value="Paralegal">Paralegal</option>
                                    <option value="Admin">Legal Assistant</option>
                                </select>
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Organization / Law Firm</label>
                            <div style={{ position: 'relative' }}>
                                <Building size={18} style={{ position: 'absolute', left: '1rem', top: '1rem', color: 'var(--primary)' }} />
                                <input
                                    type="text"
                                    className="input-premium"
                                    style={{ paddingLeft: '3rem' }}
                                    value={formData.organization}
                                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                                    placeholder="e.g. Wright & Co. Legal"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Primary Practice Area</label>
                        <div style={{ position: 'relative' }}>
                            <Sparkles size={18} style={{ position: 'absolute', left: '1rem', top: '1rem', color: 'var(--primary)' }} />
                            <input
                                type="text"
                                className="input-premium"
                                style={{ paddingLeft: '3rem' }}
                                value={formData.practiceArea}
                                onChange={(e) => setFormData({ ...formData, practiceArea: e.target.value })}
                                placeholder="e.g. Corporate Litigation, Criminal Defense"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Years of Experience</label>
                        <div style={{ position: 'relative' }}>
                            <GraduationCap size={18} style={{ position: 'absolute', left: '1rem', top: '1rem', color: 'var(--primary)' }} />
                            <select
                                className="input-premium"
                                style={{ paddingLeft: '3rem' }}
                                value={formData.experienceYears}
                                onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
                            >
                                <option value="0-3 years">Junior (0-3 years)</option>
                                <option value="4-7 years">Associate (4-7 years)</option>
                                <option value="8-12 years">Senior (8-12 years)</option>
                                <option value="13+ years">Expert (13+ years)</option>
                            </select>
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary auth-btn-block btn-glow btn-lg hover-elevate" disabled={loading} style={{ marginTop: '2rem' }}>
                        {loading ? <Loader2 className="animate-spin" /> : <>Finalize Setup <ArrowRight size={18} /></>}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Onboarding;

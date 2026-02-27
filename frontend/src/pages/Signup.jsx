import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Mail, ShieldCheck, ArrowRight, Loader2, Scale,
    User, Briefcase, Building2, BookOpen, GraduationCap,
    CheckCircle2, ChevronRight
} from 'lucide-react';

const STEPS = ['Email', 'Verify OTP', 'Your Profile'];

const Signup = () => {
    const navigate = useNavigate();
    const { login, token, user } = useAuth();

    // Redirect if already logged in
    React.useEffect(() => {
        if (token && user) {
            if (user.isOnboarded) {
                navigate('/dashboard');
            } else {
                navigate('/onboarding');
            }
        }
    }, [token, user, navigate]);

    const [step, setStep] = useState(0);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [tempToken, setTempToken] = useState('');
    const [tempUser, setTempUser] = useState(null);

    const [profile, setProfile] = useState({
        name: '',
        role: 'Attorney',
        organization: '',
        practiceArea: '',
        experienceYears: '0-3 years',
    });

    /* ── Step 0 → Request OTP ── */
    const handleRequestOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await fetch('http://localhost:5000/api/auth/request-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (res.ok) {
                setStep(1);
            } else {
                setError(data.error || 'Failed to send OTP. Please try again.');
            }
        } catch {
            setError('Connection error. Is the backend running?');
        } finally {
            setLoading(false);
        }
    };

    /* ── Step 1 → Verify OTP ── */
    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await fetch('http://localhost:5000/api/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp }),
            });
            const data = await res.json();
            if (res.ok) {
                setTempToken(data.token);
                setTempUser(data.user);
                // Pre-fill name from email if available
                if (data.user?.name && data.user.name !== data.user.email?.split('@')[0]) {
                    setProfile(p => ({ ...p, name: data.user.name }));
                }
                setStep(2);
            } else {
                setError(data.error || 'Invalid or expired OTP. Please try again.');
            }
        } catch {
            setError('Verification failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    /* ── Step 2 → Complete Onboarding ── */
    const handleCompleteProfile = async (e) => {
        e.preventDefault();
        if (!profile.name.trim()) { setError('Full name is required.'); return; }
        if (!profile.organization.trim()) { setError('Organization name is required.'); return; }
        if (!profile.practiceArea.trim()) { setError('Practice area is required.'); return; }

        setLoading(true);
        setError('');
        try {
            const res = await fetch('http://localhost:5000/api/auth/complete-onboarding', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${tempToken}`,
                },
                body: JSON.stringify(profile),
            });
            const data = await res.json();
            if (res.ok) {
                login(data.user, tempToken);
                navigate('/dashboard');
            } else {
                setError(data.error || 'Profile setup failed. Please try again.');
            }
        } catch {
            setError('Failed to save profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page signup-page">
            <div className="auth-bg-blobs">
                <div className="blob blob-1" />
                <div className="blob blob-2" />
                <div className="blob blob-3" />
            </div>

            <div className="auth-card-wide glass fade-in-up">
                {/* Logo */}
                <div className="auth-logo-row">
                    <Scale size={28} className="logo-icon" />
                    <span className="auth-logo-text">CogniCase</span>
                </div>

                {/* Step Indicator */}
                <div className="step-indicator">
                    {STEPS.map((label, i) => (
                        <React.Fragment key={label}>
                            <div className={`step-pill ${i < step ? 'done' : i === step ? 'active' : 'idle'}`}>
                                {i < step
                                    ? <CheckCircle2 size={14} />
                                    : <span>{i + 1}</span>}
                                <span className="step-label">{label}</span>
                            </div>
                            {i < STEPS.length - 1 && (
                                <div className={`step-bar ${i < step ? 'filled' : ''}`} />
                            )}
                        </React.Fragment>
                    ))}
                </div>

                {/* Error */}
                {error && <div className="error-badge-premium">{error}</div>}

                {/* ── STEP 0: Email ── */}
                {step === 0 && (
                    <form onSubmit={handleRequestOTP} className="auth-form">
                        <div className="auth-step-header">
                            <h1>Create your account</h1>
                            <p>Enter your email to get started. A 6-digit OTP will be sent to you.</p>
                        </div>
                        <div className="form-group">
                            <label htmlFor="signup-email">Email Address</label>
                            <div className="input-wrap">
                                <Mail size={17} className="input-icon" />
                                <input
                                    id="signup-email"
                                    type="email"
                                    className="input-premium"
                                    placeholder="yourname@example.com"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                    autoFocus
                                />
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary auth-btn-block btn-glow btn-lg" disabled={loading}>
                            {loading ? <><Loader2 size={18} className="animate-spin" /> Sending OTP…</> : <>Send OTP <ArrowRight size={18} /></>}
                        </button>
                        <p className="auth-footer-text">
                            Already have an account?{' '}
                            <Link to="/login" className="auth-link">Sign in</Link>
                        </p>
                    </form>
                )}

                {/* ── STEP 1: OTP ── */}
                {step === 1 && (
                    <form onSubmit={handleVerifyOTP} className="auth-form">
                        <div className="auth-step-header">
                            <h1>Check your inbox</h1>
                            <p>We sent a 6-digit verification code to <strong>{email}</strong>. Enter it below.</p>
                        </div>
                        <div className="form-group">
                            <label htmlFor="otp-input">Verification Code</label>
                            <div className="input-wrap">
                                <ShieldCheck size={17} className="input-icon" />
                                <input
                                    id="otp-input"
                                    type="text"
                                    className="input-premium otp-input"
                                    placeholder="• • • • • •"
                                    maxLength={6}
                                    value={otp}
                                    onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                                    required
                                    autoFocus
                                />
                            </div>
                            <span className="input-hint">Check your spam folder if you don't see it.</span>
                        </div>
                        <button type="submit" className="btn btn-primary auth-btn-block btn-glow btn-lg" disabled={loading || otp.length < 6}>
                            {loading ? <><Loader2 size={18} className="animate-spin" /> Verifying…</> : <>Verify & Continue <ArrowRight size={18} /></>}
                        </button>
                        <p className="auth-footer-text" style={{ cursor: 'pointer' }} onClick={() => { setStep(0); setOtp(''); setError(''); }}>
                            Wrong email? <span className="auth-link">Change it</span>
                        </p>
                    </form>
                )}

                {/* ── STEP 2: Profile Onboarding ── */}
                {step === 2 && (
                    <form onSubmit={handleCompleteProfile} className="auth-form">
                        <div className="auth-step-header">
                            <h1>Set up your profile</h1>
                            <p>Help us personalise CogniCase for your legal practice.</p>
                        </div>

                        <div className="onboarding-grid-2">
                            {/* Full Name */}
                            <div className="form-group col-span-2">
                                <label>Full Name</label>
                                <div className="input-wrap">
                                    <User size={17} className="input-icon" />
                                    <input type="text" className="input-premium" placeholder="e.g. Sarah Mitchell"
                                        value={profile.name}
                                        onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                                        required autoFocus />
                                </div>
                            </div>

                            {/* Role */}
                            <div className="form-group">
                                <label>Role</label>
                                <div className="input-wrap">
                                    <Briefcase size={17} className="input-icon" />
                                    <select className="input-premium" value={profile.role}
                                        onChange={e => setProfile(p => ({ ...p, role: e.target.value }))}>
                                        <option value="Attorney">Attorney</option>
                                        <option value="Partner">Law Firm Partner</option>
                                        <option value="Paralegal">Paralegal</option>
                                        <option value="Admin">Legal Assistant</option>
                                    </select>
                                </div>
                            </div>

                            {/* Experience */}
                            <div className="form-group">
                                <label>Years of Experience</label>
                                <div className="input-wrap">
                                    <GraduationCap size={17} className="input-icon" />
                                    <select className="input-premium" value={profile.experienceYears}
                                        onChange={e => setProfile(p => ({ ...p, experienceYears: e.target.value }))}>
                                        <option value="0-3 years">Junior (0–3 yrs)</option>
                                        <option value="4-7 years">Associate (4–7 yrs)</option>
                                        <option value="8-12 years">Senior (8–12 yrs)</option>
                                        <option value="13+ years">Expert (13+ yrs)</option>
                                    </select>
                                </div>
                            </div>

                            {/* Organization */}
                            <div className="form-group col-span-2">
                                <label>Law Firm / Organization</label>
                                <div className="input-wrap">
                                    <Building2 size={17} className="input-icon" />
                                    <input type="text" className="input-premium" placeholder="e.g. Mitchell & Associates"
                                        value={profile.organization}
                                        onChange={e => setProfile(p => ({ ...p, organization: e.target.value }))}
                                        required />
                                </div>
                            </div>

                            {/* Practice Area */}
                            <div className="form-group col-span-2">
                                <label>Primary Practice Area</label>
                                <div className="input-wrap">
                                    <BookOpen size={17} className="input-icon" />
                                    <input type="text" className="input-premium" placeholder="e.g. Corporate Law, Criminal Defense, Family Law"
                                        value={profile.practiceArea}
                                        onChange={e => setProfile(p => ({ ...p, practiceArea: e.target.value }))}
                                        required />
                                </div>
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary auth-btn-block btn-glow btn-lg" disabled={loading}>
                            {loading ? <><Loader2 size={18} className="animate-spin" /> Saving Profile…</> : <>Launch My Dashboard <ChevronRight size={18} /></>}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Signup;

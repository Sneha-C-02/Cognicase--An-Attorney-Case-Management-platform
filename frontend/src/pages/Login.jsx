import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, ShieldCheck, ArrowRight, Loader2, Scale } from 'lucide-react';

const Login = () => {
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

    const [step, setStep] = useState(0); // 0 = email, 1 = otp
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

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
                setError(data.error || 'Could not send OTP. Check email and try again.');
            }
        } catch {
            setError('Connection error. Make sure the backend is running.');
        } finally {
            setLoading(false);
        }
    };

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
                login(data.user, data.token);
                if (data.user.isOnboarded) {
                    navigate('/dashboard');
                } else {
                    navigate('/onboarding');
                }
            } else {
                setError(data.error || 'Invalid or expired code. Please try again.');
            }
        } catch {
            setError('Verification failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-bg-blobs">
                <div className="blob blob-1" />
                <div className="blob blob-2" />
                <div className="blob blob-3" />
            </div>

            <div className="auth-card glass fade-in-up">
                {/* Logo */}
                <div className="auth-logo-row">
                    <Scale size={28} className="logo-icon" />
                    <span className="auth-logo-text">CogniCase</span>
                </div>

                {/* Step Indicator */}
                <div className="login-step-bar">
                    <div className={`login-step-dot ${step >= 0 ? 'active' : ''}`} />
                    <div className={`login-step-line ${step >= 1 ? 'filled' : ''}`} />
                    <div className={`login-step-dot ${step >= 1 ? 'active' : ''}`} />
                </div>

                {error && <div className="error-badge-premium">{error}</div>}

                {/* ── Step 0: Email ── */}
                {step === 0 && (
                    <form onSubmit={handleRequestOTP} className="auth-form">
                        <div className="auth-step-header">
                            <h1>Welcome back</h1>
                            <p>Enter your registered email and we'll send you a secure login code.</p>
                        </div>
                        <div className="form-group">
                            <label htmlFor="login-email">Email Address</label>
                            <div className="input-wrap">
                                <Mail size={17} className="input-icon" />
                                <input
                                    id="login-email"
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
                            {loading ? <><Loader2 size={18} className="animate-spin" /> Sending OTP…</> : <>Send Login Code <ArrowRight size={18} /></>}
                        </button>
                        <p className="auth-footer-text">
                            Don't have an account?{' '}
                            <Link to="/signup" className="auth-link">Create one free</Link>
                        </p>
                    </form>
                )}

                {/* ── Step 1: OTP ── */}
                {step === 1 && (
                    <form onSubmit={handleVerifyOTP} className="auth-form">
                        <div className="auth-step-header">
                            <h1>Check your inbox</h1>
                            <p>A 6-digit code was sent to <strong>{email}</strong>. Enter it below to access your dashboard.</p>
                        </div>
                        <div className="form-group">
                            <label htmlFor="login-otp">Verification Code</label>
                            <div className="input-wrap">
                                <ShieldCheck size={17} className="input-icon" />
                                <input
                                    id="login-otp"
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
                            {loading ? <><Loader2 size={18} className="animate-spin" /> Signing In…</> : <>Access Dashboard <ArrowRight size={18} /></>}
                        </button>
                        <p className="auth-footer-text" style={{ cursor: 'pointer' }} onClick={() => { setStep(0); setOtp(''); setError(''); }}>
                            Wrong email? <span className="auth-link">Change it</span>
                        </p>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Login;

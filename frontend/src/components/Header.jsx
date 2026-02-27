import React from 'react';
import { Search, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Header = ({ title }) => {
    const { user } = useAuth();
    return (
        <header style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem'
        }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>{title}</h1>
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                <div style={{ position: 'relative' }}>
                    <Search size={20} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                        type="text"
                        placeholder="Search cases..."
                        style={{
                            padding: '0.625rem 1rem 0.625rem 2.5rem',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border)',
                            width: '300px',
                            outline: 'none'
                        }}
                    />
                </div>
                <button className="btn" style={{ background: 'none', padding: '0.5rem' }}>
                    <Bell size={20} />
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
                        {user?.name?.[0].toUpperCase() || 'U'}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;

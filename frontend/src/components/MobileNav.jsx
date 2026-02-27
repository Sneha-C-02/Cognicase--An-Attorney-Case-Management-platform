import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Briefcase, Users, LayoutList, FileText } from 'lucide-react';

const MobileNav = () => {
    return (
        <div className="mobile-nav" style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'var(--surface, white)',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-around',
            padding: '0.75rem 0',
            zIndex: 100,
            boxShadow: '0 -4px 6px -1px rgba(0,0,0,0.05)'
        }}>
            <NavLink to="/dashboard" className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`} style={navLinkStyle}>
                <LayoutDashboard size={20} />
                <span style={{ fontSize: '0.7rem', marginTop: '0.25rem' }}>Dashboard</span>
            </NavLink>
            <NavLink to="/cases" className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`} style={navLinkStyle}>
                <Briefcase size={20} />
                <span style={{ fontSize: '0.7rem', marginTop: '0.25rem' }}>Cases</span>
            </NavLink>
            <NavLink to="/clients" className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`} style={navLinkStyle}>
                <Users size={20} />
                <span style={{ fontSize: '0.7rem', marginTop: '0.25rem' }}>Clients</span>
            </NavLink>
            <NavLink to="/tasks" className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`} style={navLinkStyle}>
                <LayoutList size={20} />
                <span style={{ fontSize: '0.7rem', marginTop: '0.25rem' }}>Tasks</span>
            </NavLink>
            <NavLink to="/documents" className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`} style={navLinkStyle}>
                <FileText size={20} />
                <span style={{ fontSize: '0.7rem', marginTop: '0.25rem' }}>Docs</span>
            </NavLink>
        </div>
    );
};

const navLinkStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textDecoration: 'none',
    color: 'var(--text-muted, #64748b)'
};

export default MobileNav;

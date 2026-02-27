import React, { useEffect, useState } from 'react';
import {
    PieChart, Pie, Cell,
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Clock, AlertCircle, CheckCircle, Search, Briefcase, Users } from 'lucide-react';
import Header from '../components/Header.jsx';
import { getDashboardStats, getRecentActivities } from '../api/dashboard';
import { getCases } from '../api/cases';
import { getClients } from '../api/clients';
import { getTasks } from '../api/tasks';

const StatCard = ({ title, value, icon, color }) => (
    <div className="card stat-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <div className="stat-icon-wrapper" style={{
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: `${color}15`,
            color: color
        }}>
            {icon}
        </div>
        <div>
            <p className="stat-title">{title}</p>
            <h3 className="stat-value">{value}</h3>
        </div>
    </div>
);

const DashboardSkeleton = () => (
    <div className="dashboard-skeleton">
        <div className="skeleton-header"></div>
        <div className="stat-grid">
            {[1, 2, 3].map(i => <div key={i} className="card skeleton-stat"></div>)}
        </div>
        <div className="chart-grid-skeleton">
            <div className="card skeleton-chart"></div>
            <div className="card skeleton-chart"></div>
        </div>
    </div>
);

const Dashboard = () => {
    const [cases, setCases] = useState([]); // Keep cases for chart data
    const [stats, setStats] = useState({
        activeCases: 0,
        totalClients: 0,
        pendingTasks: 0,
        documentsStored: 0
    });
    const [activities, setActivities] = useState([]);
    const [deadlines, setDeadlines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        setError(null);
        try {
            // Fetch cases and clients in parallel — these are critical
            const [fetchedCases, clients, fetchedTasks] = await Promise.all([
                getCases(),
                getClients(),
                getTasks()
            ]);

            setCases(fetchedCases || []);
            setStats({
                activeCases: (fetchedCases || []).filter(c => c.status === 'Open' || c.status === 'In Progress').length,
                totalClients: (clients || []).length,
                pendingTasks: (fetchedTasks || []).filter(t => t.status !== 'Completed').length,
                documentsStored: 0
            });

            // Filter for upcoming deadlines (tasks with dueDate)
            const upcoming = (fetchedTasks || [])
                .filter(t => t.dueDate && t.status !== 'Completed')
                .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
                .slice(0, 5);
            setDeadlines(upcoming);

        } catch (err) {
            setError('Failed to load dashboard data.');
            console.error(err);
        }

        // Activities are optional — fetch separately so failure doesn't break dashboard
        try {
            const activitiesData = await getRecentActivities();
            setActivities(activitiesData || []);
        } catch {
            setActivities([]); // Silently ignore if no activities endpoint
        }

        setLoading(false);
    };

    if (loading) return <DashboardSkeleton />;
    if (error) return <div className="error-message">{error}</div>;

    // Status distribution
    const statusCounts = cases.reduce((acc, c) => {
        acc[c.status] = (acc[c.status] || 0) + 1;
        return acc;
    }, {});

    const statusData = [
        { name: 'Open', value: statusCounts['Open'] || 0, color: '#2563eb' },
        { name: 'In Progress', value: statusCounts['InProgress'] || 0, color: '#f59e0b' },
        { name: 'Closed', value: statusCounts['Closed'] || 0, color: '#10b981' },
    ];

    // Cases by month (simplified: using creation date)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthCounts = cases.reduce((acc, c) => {
        const month = new Date(c.createdAt).getMonth();
        acc[month] = (acc[month] || 0) + 1;
        return acc;
    }, {});

    // Last 5 months including current
    const currentMonth = new Date().getMonth();
    const chartData = [];
    for (let i = 4; i >= 0; i--) {
        const mIdx = (currentMonth - i + 12) % 12;
        chartData.push({ month: months[mIdx], count: monthCounts[mIdx] || 0 });
    }

    return (
        <div className="dashboard-container fade-in">
            <Header title="Dashboard Overview" />

            {/* Stats Grid */}
            <div className="stat-grid">
                <div className="card stat-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 500 }}>Active Cases</p>
                            <h3 style={{ fontSize: '1.875rem', fontWeight: 700, marginTop: '0.25rem' }}>{stats.activeCases}</h3>
                        </div>
                        <div style={{ padding: '0.75rem', background: '#f5f3ff', borderRadius: '12px', color: '#7c3aed' }}>
                            <Briefcase size={24} />
                        </div>
                    </div>
                </div>
                <div className="card stat-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 500 }}>Total Clients</p>
                            <h3 style={{ fontSize: '1.875rem', fontWeight: 700, marginTop: '0.25rem' }}>{stats.totalClients}</h3>
                        </div>
                        <div style={{ padding: '0.75rem', background: '#eff6ff', borderRadius: '12px', color: '#2563eb' }}>
                            <Users size={24} />
                        </div>
                    </div>
                </div>
                {/* Add more stat cards as needed */}
            </div>

            <div className="dashboard-layout">
                <div className="card chart-card">
                    <h3 className="card-title">Case Distribution</h3>
                    <div style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={statusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {statusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip borderRadius={12} border="none" shadow="0 4px 6px rgba(0,0,0,0.1)" />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="card chart-card">
                    <h3 className="card-title">Cases by Month</h3>
                    <div style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip cursor={{ fill: '#f1f5f9' }} />
                                <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="dashboard-layout" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
                <div className="card activity-card">
                    <h3 className="card-title">Recent Activity</h3>
                    <div className="activity-list">
                        {activities.length > 0 ? activities.map((item, idx) => (
                            <div key={item._id} className="activity-item">
                                <div className="activity-dot"></div>
                                <div className="activity-content">
                                    <p className="activity-msg">{item.message}</p>
                                    <p className="activity-meta">
                                        {item.user} • {new Date(item.createdAt).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        )) : <p className="empty-state">No recent activity found.</p>}
                    </div>
                </div>

                <div className="card deadlines-card">
                    <h3 className="card-title">Upcoming Deadlines</h3>
                    <div className="deadline-list">
                        {deadlines.length > 0 ? deadlines.map((task) => (
                            <div key={task._id} className="deadline-item" style={{
                                padding: '1rem 0',
                                borderBottom: '1px solid var(--border)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <div>
                                    <p style={{ fontWeight: 600, color: 'var(--secondary)' }}>{task.title}</p>
                                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{task.caseId?.title || 'General Task'}</p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        color: new Date(task.dueDate) < new Date() ? 'var(--danger)' : 'var(--text-muted)',
                                        fontSize: '0.875rem',
                                        fontWeight: 500
                                    }}>
                                        <Clock size={14} />
                                        {new Date(task.dueDate).toLocaleDateString()}
                                    </div>
                                    <span className={`badge badge-priority-${task.priority?.toLowerCase() || 'medium'}`} style={{ marginTop: '0.25rem' }}>
                                        {task.priority || 'Medium'}
                                    </span>
                                </div>
                            </div>
                        )) : <p className="empty-state">No upcoming deadlines.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

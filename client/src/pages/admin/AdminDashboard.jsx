import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStores: 0,
    totalRatings: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await adminService.getDashboard();
        setStats(res.data.stats);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard statistics.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  return (
    <div className="main-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Platform Overview</h1>
          <p className="page-subtitle">
            System administration metrics, user volume, and store rating performance
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/admin/users" className="btn btn-secondary">
            Manage Users
          </Link>
          <Link to="/admin/stores" className="btn btn-primary">
            Manage Stores
          </Link>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="stats-grid">
          {[1, 2, 3].map((i) => (
            <div key={i} className="stat-card">
              <div className="skeleton" style={{ width: 52, height: 52, borderRadius: 10 }}></div>
              <div style={{ flex: 1 }}>
                <div className="skeleton skeleton-text" style={{ width: '40%', height: 28 }}></div>
                <div className="skeleton skeleton-text" style={{ width: '70%', height: 14 }}></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon users">👥</div>
              <div className="stat-meta">
                <div className="stat-value tabular-nums">{stats.totalUsers}</div>
                <div className="stat-label">Total Registered Users</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon stores">🏪</div>
              <div className="stat-meta">
                <div className="stat-value tabular-nums">{stats.totalStores}</div>
                <div className="stat-label">Total Registered Stores</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon ratings">⭐</div>
              <div className="stat-meta">
                <div className="stat-value tabular-nums">{stats.totalRatings}</div>
                <div className="stat-label">Total Ratings Submitted</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{ fontSize: '1.4rem' }}>👥</div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  User Management
                </h2>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px', lineHeight: 1.5 }}>
                Review accounts across all roles (System Administrators, Store Owners, and Customers), filter by role, or provision new accounts.
              </p>
              <Link to="/admin/users" className="btn btn-secondary btn-sm">
                View All Users →
              </Link>
            </div>

            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{ fontSize: '1.4rem' }}>🏪</div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Store Directory
                </h2>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px', lineHeight: 1.5 }}>
                Browse store locations, assign verified store owners, and monitor live customer satisfaction averages in real time.
              </p>
              <Link to="/admin/stores" className="btn btn-secondary btn-sm">
                View Store Directory →
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

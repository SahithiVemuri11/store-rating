import React, { useState, useEffect, useMemo } from 'react';
import { ownerService } from '../../services/api';
import StarRating from '../../components/StarRating';

export default function OwnerDashboard() {
  const [store, setStore] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Sorting
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const fetchStoreData = async () => {
    try {
      setLoading(true);
      const storeRes = await ownerService.getStore();
      setStore(storeRes.data.store);

      const ratingsRes = await ownerService.getRatings({
        sortBy,
        sortOrder,
      });
      setRatings(ratingsRes.data.ratings);
      setError('');
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to load store owner dashboard.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStoreData();
    setCurrentPage(1);
  }, [sortBy, sortOrder]);

  // Client-side pagination
  const totalRatings = ratings.length;
  const totalPages = Math.ceil(totalRatings / pageSize) || 1;
  const paginatedRatings = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return ratings.slice(start, start + pageSize);
  }, [ratings, currentPage, pageSize]);

  // Compute 5-star to 1-star breakdown
  const ratingBreakdown = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    ratings.forEach((r) => {
      const val = Math.round(r.ratingValue);
      if (counts[val] !== undefined) {
        counts[val]++;
      }
    });

    const total = ratings.length || 1;
    return [5, 4, 3, 2, 1].map((stars) => {
      const count = counts[stars];
      const percent = ratings.length > 0 ? Math.round((count / total) * 100) : 0;
      return { stars, count, percent };
    });
  }, [ratings]);

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const getSortIcon = (column) => {
    if (sortBy !== column) return <span style={{ opacity: 0.35 }}>↕</span>;
    return sortOrder === 'asc' ? <span style={{ color: 'var(--primary)' }}>▲</span> : <span style={{ color: 'var(--primary)' }}>▼</span>;
  };

  const formatDate = (isoString) => {
    if (!isoString) return '—';
    const date = new Date(isoString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="main-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Store Performance Dashboard</h1>
          <p className="page-subtitle">
            Monitor verified customer reviews, average score metrics, and rating distribution
          </p>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card">
            <div className="skeleton skeleton-box" style={{ height: 160 }}></div>
          </div>
          <div className="card">
            <div className="skeleton skeleton-box" style={{ height: 300 }}></div>
          </div>
        </div>
      ) : !store ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">🏪</div>
            <div className="empty-state-title">No Store Assigned</div>
            <div className="empty-state-desc">
              Your account is registered as a Store Owner, but an administrator has not yet assigned a store to your profile. Please contact the administrator.
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Store Overview Card with Visual Rating Breakdown */}
          <div className="card" style={{ marginBottom: '28px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '20px',
                marginBottom: '24px',
                paddingBottom: '20px',
                borderBottom: '1px solid var(--border-color)',
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: 'var(--primary)',
                  }}
                >
                  My Assigned Store
                </span>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
                  {store.name}
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
                  📍 {store.address}
                </p>
                <p style={{ color: 'var(--text-light)', fontSize: '0.84rem', marginTop: '2px' }}>
                  ✉️ {store.email}
                </p>
              </div>
            </div>

            {/* Visual Star Rating Breakdown & Big Score */}
            <div className="rating-breakdown-card">
              <div className="rating-breakdown-score">
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Overall Score
                </span>
                <div className="breakdown-big-num tabular-nums">
                  {store.averageRating !== null ? store.averageRating : '—'}
                </div>
                <div style={{ margin: '6px 0' }}>
                  <StarRating
                    value={store.averageRating || 0}
                    readOnly
                    size="sm"
                  />
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }} className="tabular-nums">
                  {ratings.length} total {ratings.length === 1 ? 'review' : 'reviews'}
                </span>
              </div>

              {/* Progress Bars for 5★ down to 1★ */}
              <div className="rating-breakdown-bars">
                {ratingBreakdown.map((row) => (
                  <div key={row.stars} className="breakdown-row">
                    <span className="breakdown-star-label">
                      {row.stars} <span style={{ color: 'var(--star-gold)' }}>★</span>
                    </span>
                    <div className="breakdown-bar-track">
                      <div
                        className="breakdown-bar-fill"
                        style={{ width: `${row.percent}%` }}
                      ></div>
                    </div>
                    <span className="breakdown-percent tabular-nums">
                      {row.percent}%
                    </span>
                    <span className="breakdown-count tabular-nums">
                      ({row.count})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Customer Ratings Table */}
          <div className="table-wrapper">
            <div className="table-toolbar">
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Customer Reviews & Ratings
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Verified customer evaluations submitted for this store
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                  Sort By:
                </label>
                <select
                  className="form-control"
                  style={{ width: 'auto', padding: '6px 10px', fontSize: '0.84rem' }}
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="createdAt">Date Submitted</option>
                  <option value="ratingValue">Rating Score</option>
                </select>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() =>
                    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
                  }
                  title="Toggle order"
                >
                  {sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
                </button>
              </div>
            </div>

            <div className="table-container-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Customer Name</th>
                    <th>Customer Email</th>
                    <th className="sortable" onClick={() => handleSort('ratingValue')}>
                      Rating Given <span className="sort-icon">{getSortIcon('ratingValue')}</span>
                    </th>
                    <th className="sortable" onClick={() => handleSort('createdAt')}>
                      Date Submitted <span className="sort-icon">{getSortIcon('createdAt')}</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRatings.length === 0 ? (
                    <tr>
                      <td colSpan="4">
                        <div className="empty-state">
                          <div className="empty-state-icon">⭐</div>
                          <div className="empty-state-title">No Reviews Yet</div>
                          <div className="empty-state-desc">
                            No customer ratings have been submitted for your store yet.
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedRatings.map((r) => (
                      <tr key={r.id}>
                        <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{r.user.name}</td>
                        <td style={{ color: 'var(--text-secondary)' }}>{r.user.email}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <StarRating value={r.ratingValue} readOnly size="sm" />
                            <span style={{ fontWeight: 700 }} className="tabular-nums">
                              {r.ratingValue} / 5
                            </span>
                          </div>
                        </td>
                        <td style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }} className="tabular-nums">
                          {formatDate(r.createdAt)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Toolbar */}
            {totalRatings > 0 && (
              <div className="table-pagination">
                <div>
                  Showing <span style={{ fontWeight: 600, color: 'var(--text-primary)' }} className="tabular-nums">{(currentPage - 1) * pageSize + 1}</span> to{' '}
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }} className="tabular-nums">
                    {Math.min(currentPage * pageSize, totalRatings)}
                  </span>{' '}
                  of <span style={{ fontWeight: 600, color: 'var(--text-primary)' }} className="tabular-nums">{totalRatings}</span> reviews
                </div>

                <div className="pagination-controls">
                  <button
                    className="page-btn"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  >
                    Previous
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                    <button
                      key={pg}
                      className={`page-btn ${currentPage === pg ? 'active' : ''}`}
                      onClick={() => setCurrentPage(pg)}
                    >
                      {pg}
                    </button>
                  ))}

                  <button
                    className="page-btn"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

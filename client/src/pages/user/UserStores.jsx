import React, { useState, useEffect, useMemo } from 'react';
import { userService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import StarRating from '../../components/StarRating';

export default function UserStores() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // View mode: 'grid' (cards) or 'table' (dense list)
  const [viewMode, setViewMode] = useState('grid');

  // Search & Sorting
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Rating Modal state
  const [selectedStore, setSelectedStore] = useState(null);
  const [ratingInput, setRatingInput] = useState(5);
  const [submittingRating, setSubmittingRating] = useState(false);
  const [ratingError, setRatingError] = useState('');

  const { showToast } = useToast();

  const fetchStores = async () => {
    try {
      setLoading(true);
      const res = await userService.getStores({
        search,
        sortBy,
        sortOrder,
      });
      setStores(res.data.stores);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load stores.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, [search, sortBy, sortOrder]);

  const handleOpenRatingModal = (store) => {
    setSelectedStore(store);
    // Default to user's existing rating if available, otherwise 5
    setRatingInput(store.myRating || 5);
    setRatingError('');
  };

  const handleCloseRatingModal = () => {
    setSelectedStore(null);
    setRatingError('');
  };

  const handleSubmitRating = async (e) => {
    e.preventDefault();
    if (!selectedStore) return;

    try {
      setSubmittingRating(true);
      setRatingError('');
      await userService.submitRating({
        storeId: selectedStore.id,
        ratingValue: Number(ratingInput),
      });

      showToast(
        `Your rating of ${ratingInput} star(s) for "${selectedStore.name}" was saved!`,
        'success'
      );
      handleCloseRatingModal();
      fetchStores();
    } catch (err) {
      setRatingError(err.response?.data?.message || 'Failed to submit rating.');
    } finally {
      setSubmittingRating(false);
    }
  };

  const getRatingLabel = (val) => {
    switch (val) {
      case 1:
        return 'Poor';
      case 2:
        return 'Fair';
      case 3:
        return 'Good';
      case 4:
        return 'Very Good';
      case 5:
        return 'Excellent';
      default:
        return '';
    }
  };

  return (
    <div className="main-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Explore & Rate Stores</h1>
          <p className="page-subtitle">
            Discover registered stores, check customer satisfaction scores, and submit your personal ratings
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="btn-group">
          <button
            className={`btn-group-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
            title="Card Grid View"
          >
            ▦ Grid
          </button>
          <button
            className={`btn-group-btn ${viewMode === 'table' ? 'active' : ''}`}
            onClick={() => setViewMode('table')}
            title="Table List View"
          >
            ☰ Table
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Sorting Toolbar */}
      <div className="card" style={{ marginBottom: '24px', padding: '16px 20px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '14px',
          }}
        >
          <div className="search-input-wrap">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder="Search store by name or address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                }}
              >
                ✕
              </button>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              Sort:
            </label>
            <select
              className="form-control"
              style={{ width: 'auto', padding: '8px 12px', fontSize: '0.86rem' }}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="name">Store Name</option>
              <option value="address">Address</option>
              <option value="averageRating">Overall Rating</option>
            </select>

            <select
              className="form-control"
              style={{ width: 'auto', padding: '8px 12px', fontSize: '0.86rem' }}
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="asc">Ascending (A-Z / Low-High)</option>
              <option value="desc">Descending (Z-A / High-Low)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="store-grid">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="store-card">
              <div className="skeleton skeleton-text" style={{ width: '80%', height: 20 }}></div>
              <div className="skeleton skeleton-text" style={{ width: '95%', height: 14 }}></div>
              <div className="skeleton skeleton-box" style={{ height: 80, margin: '14px 0' }}></div>
              <div className="skeleton skeleton-box" style={{ height: 38 }}></div>
            </div>
          ))}
        </div>
      ) : stores.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">🏪</div>
            <div className="empty-state-title">No Stores Found</div>
            <div className="empty-state-desc">
              {search
                ? `No stores matched "${search}". Try adjusting your query.`
                : 'No stores are registered in the directory yet.'}
            </div>
            {search && (
              <button className="btn btn-secondary btn-sm" onClick={() => setSearch('')}>
                Clear Search
              </button>
            )}
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid Cards View */
        <div className="store-grid">
          {stores.map((store) => (
            <div key={store.id} className="store-card">
              <div>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                  <h3 className="store-title">{store.name}</h3>
                </div>
                <p className="store-address">📍 {store.address}</p>

                <div className="store-ratings-box">
                  <div className="rating-row">
                    <span className="rating-row-label">Community Rating:</span>
                    <span className="rating-score">
                      {store.averageRating !== null ? (
                        <>
                          <StarRating value={store.averageRating} readOnly size="sm" />
                          <span className="tabular-nums">{store.averageRating}</span>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-light)' }} className="tabular-nums">
                            ({store.totalRatings})
                          </span>
                        </>
                      ) : (
                        <span style={{ color: 'var(--text-light)', fontSize: '0.82rem' }}>
                          No ratings yet
                        </span>
                      )}
                    </span>
                  </div>

                  <div className="rating-row">
                    <span className="rating-row-label">My Submitted Rating:</span>
                    <span className="rating-score">
                      {store.myRating ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <StarRating value={store.myRating} readOnly size="sm" />
                          <span style={{ color: 'var(--primary)', fontWeight: 700 }} className="tabular-nums">
                            {store.myRating} / 5
                          </span>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-light)', fontSize: '0.82rem' }}>
                          Not rated yet
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <button
                className={`btn ${store.myRating ? 'btn-secondary' : 'btn-primary'} btn-block`}
                onClick={() => handleOpenRatingModal(store)}
              >
                {store.myRating ? '✏️ Modify My Rating' : '⭐ Rate This Store'}
              </button>
            </div>
          ))}
        </div>
      ) : (
        /* Table List View */
        <div className="table-wrapper">
          <div className="table-container-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Store Name</th>
                  <th>Address</th>
                  <th>Community Rating</th>
                  <th>My Rating</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {stores.map((store) => (
                  <tr key={store.id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{store.name}</td>
                    <td style={{ maxWidth: '280px', fontSize: '0.86rem', color: 'var(--text-muted)' }}>
                      {store.address}
                    </td>
                    <td>
                      {store.averageRating !== null ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <StarRating value={store.averageRating} readOnly size="sm" />
                          <span style={{ fontWeight: 700 }} className="tabular-nums">
                            {store.averageRating}
                          </span>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-light)' }} className="tabular-nums">
                            ({store.totalRatings})
                          </span>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-light)', fontSize: '0.84rem' }}>
                          No ratings yet
                        </span>
                      )}
                    </td>
                    <td>
                      {store.myRating ? (
                        <span style={{ fontWeight: 600, color: 'var(--primary)' }} className="tabular-nums">
                          {store.myRating} ★
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-light)', fontSize: '0.84rem' }}>
                          —
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className={`btn ${store.myRating ? 'btn-secondary' : 'btn-primary'} btn-sm`}
                        onClick={() => handleOpenRatingModal(store)}
                      >
                        {store.myRating ? 'Modify' : 'Rate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Interactive Rating Modal */}
      {selectedStore && (
        <div className="modal-backdrop" onClick={handleCloseRatingModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {selectedStore.myRating ? 'Modify Your Rating' : 'Submit Store Rating'}
              </h2>
              <button className="modal-close" onClick={handleCloseRatingModal}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmitRating}>
              <div className="modal-body" style={{ textAlign: 'center' }}>
                {ratingError && (
                  <div className="alert alert-danger" role="alert">
                    <span>⚠️</span>
                    <span>{ratingError}</span>
                  </div>
                )}

                <h3
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    marginBottom: '4px',
                  }}
                >
                  {selectedStore.name}
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem', marginBottom: '24px' }}>
                  📍 {selectedStore.address}
                </p>

                <div style={{ marginBottom: '16px' }}>
                  <StarRating
                    value={ratingInput}
                    onRate={(val) => setRatingInput(val)}
                    size="lg"
                  />
                </div>

                <div
                  style={{
                    fontSize: '1.15rem',
                    fontWeight: 700,
                    color: 'var(--primary)',
                    marginBottom: '6px',
                  }}
                  className="tabular-nums"
                >
                  {ratingInput} of 5 Stars — {getRatingLabel(ratingInput)}
                </div>

                <p style={{ color: 'var(--text-light)', fontSize: '0.82rem' }}>
                  Click any star to choose your rating between 1 and 5.
                </p>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCloseRatingModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submittingRating}
                >
                  {submittingRating ? 'Saving...' : 'Save Rating'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

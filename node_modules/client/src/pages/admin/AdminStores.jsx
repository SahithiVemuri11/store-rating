import React, { useState, useEffect, useMemo } from 'react';
import { adminService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import StarRating from '../../components/StarRating';

export default function AdminStores() {
  const [stores, setStores] = useState([]);
  const [availableOwners, setAvailableOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters & Sorting state
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Add Store Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalForm, setModalForm] = useState({
    name: '',
    email: '',
    address: '',
    ownerId: '',
  });
  const [modalErrors, setModalErrors] = useState({});
  const [modalGeneralError, setModalGeneralError] = useState('');
  const [modalSubmitting, setModalSubmitting] = useState(false);

  const { showToast } = useToast();

  const fetchStores = async () => {
    try {
      setLoading(true);
      const res = await adminService.getStores({
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

  const fetchOwners = async () => {
    try {
      const res = await adminService.getUsers({ role: 'STORE_OWNER' });
      // Filter owners who do not already own a store
      const unassigned = res.data.users.filter((u) => !u.ownedStore);
      setAvailableOwners(unassigned);
    } catch (err) {
      console.error('Failed to load store owners:', err);
    }
  };

  useEffect(() => {
    fetchStores();
    setCurrentPage(1);
  }, [search, sortBy, sortOrder]);

  // Client-side pagination
  const totalStores = stores.length;
  const totalPages = Math.ceil(totalStores / pageSize) || 1;
  const paginatedStores = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return stores.slice(start, start + pageSize);
  }, [stores, currentPage, pageSize]);

  const handleOpenModal = () => {
    fetchOwners();
    setModalForm({ name: '', email: '', address: '', ownerId: '' });
    setModalErrors({});
    setModalGeneralError('');
    setShowModal(true);
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (column) => {
    if (sortBy !== column) return <span style={{ opacity: 0.35 }}>↕</span>;
    return sortOrder === 'asc' ? <span style={{ color: 'var(--primary)' }}>▲</span> : <span style={{ color: 'var(--primary)' }}>▼</span>;
  };

  const validateModal = () => {
    const errs = {};
    const nameTrimmed = modalForm.name.trim();
    if (!nameTrimmed) {
      errs.name = 'Store name is required.';
    } else if (nameTrimmed.length < 20 || nameTrimmed.length > 60) {
      errs.name = 'Store name must be between 20 and 60 characters.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!modalForm.email.trim() || !emailRegex.test(modalForm.email.trim())) {
      errs.email = 'Please provide a valid store email address.';
    }

    const addrTrimmed = modalForm.address.trim();
    if (!addrTrimmed) {
      errs.address = 'Store address is required.';
    } else if (addrTrimmed.length > 400) {
      errs.address = 'Store address cannot exceed 400 characters.';
    }

    setModalErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreateStore = async (e) => {
    e.preventDefault();
    setModalGeneralError('');
    if (!validateModal()) return;

    try {
      setModalSubmitting(true);
      await adminService.createStore({
        name: modalForm.name.trim(),
        email: modalForm.email.trim(),
        address: modalForm.address.trim(),
        ownerId: modalForm.ownerId || null,
      });

      showToast(`Store "${modalForm.name.trim()}" created successfully!`, 'success');
      setShowModal(false);
      fetchStores();
    } catch (err) {
      if (err.response?.data?.errors) {
        const backendErrs = {};
        err.response.data.errors.forEach((e) => {
          backendErrs[e.field] = e.message;
        });
        setModalErrors(backendErrs);
      } else {
        setModalGeneralError(err.response?.data?.message || 'Failed to create store.');
      }
    } finally {
      setModalSubmitting(false);
    }
  };

  return (
    <div className="main-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Store Directory</h1>
          <p className="page-subtitle">
            Manage registered store listings, owner associations, and live customer satisfaction averages
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenModal}>
          + Add New Store
        </button>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <div className="table-wrapper">
        <div className="table-toolbar">
          <div className="search-input-wrap">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder="Search by store name, email, or address..."
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
        </div>

        <div className="table-container-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th className="sortable" onClick={() => handleSort('name')}>
                  Store Name <span className="sort-icon">{getSortIcon('name')}</span>
                </th>
                <th className="sortable" onClick={() => handleSort('email')}>
                  Contact Email <span className="sort-icon">{getSortIcon('email')}</span>
                </th>
                <th className="sortable" onClick={() => handleSort('address')}>
                  Address <span className="sort-icon">{getSortIcon('address')}</span>
                </th>
                <th>Assigned Owner</th>
                <th>Overall Rating</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1, 2, 3, 4, 5].map((idx) => (
                  <tr key={idx}>
                    <td><div className="skeleton skeleton-text" style={{ width: '75%' }}></div></td>
                    <td><div className="skeleton skeleton-text" style={{ width: '80%' }}></div></td>
                    <td><div className="skeleton skeleton-text" style={{ width: '90%' }}></div></td>
                    <td><div className="skeleton skeleton-text" style={{ width: '60%' }}></div></td>
                    <td><div className="skeleton skeleton-text" style={{ width: '70%' }}></div></td>
                  </tr>
                ))
              ) : paginatedStores.length === 0 ? (
                <tr>
                  <td colSpan="5">
                    <div className="empty-state">
                      <div className="empty-state-icon">🏪</div>
                      <div className="empty-state-title">No stores found</div>
                      <div className="empty-state-desc">
                        {search
                          ? 'Try adjusting your search keywords.'
                          : 'No stores are registered in the system yet.'}
                      </div>
                      {search && (
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => setSearch('')}
                        >
                          Clear Search
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedStores.map((s) => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{s.name}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{s.email}</td>
                    <td style={{ maxWidth: '280px', fontSize: '0.86rem', color: 'var(--text-muted)' }}>
                      {s.address}
                    </td>
                    <td>
                      {s.owner ? (
                        <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                          👤 {s.owner.name}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-light)' }}>Unassigned</span>
                      )}
                    </td>
                    <td>
                      {s.averageRating !== null ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <StarRating value={s.averageRating} readOnly size="sm" />
                          <span style={{ fontWeight: 700, fontSize: '0.92rem' }} className="tabular-nums">
                            {s.averageRating}
                          </span>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-light)' }} className="tabular-nums">
                            ({s.totalRatings} {s.totalRatings === 1 ? 'review' : 'reviews'})
                          </span>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-light)', fontSize: '0.86rem' }}>
                          No ratings yet
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Toolbar */}
        {!loading && totalStores > 0 && (
          <div className="table-pagination">
            <div>
              Showing <span style={{ fontWeight: 600, color: 'var(--text-primary)' }} className="tabular-nums">{(currentPage - 1) * pageSize + 1}</span> to{' '}
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }} className="tabular-nums">
                {Math.min(currentPage * pageSize, totalStores)}
              </span>{' '}
              of <span style={{ fontWeight: 600, color: 'var(--text-primary)' }} className="tabular-nums">{totalStores}</span> stores
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

      {/* Add Store Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Register New Store</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                ×
              </button>
            </div>

            <form onSubmit={handleCreateStore} noValidate>
              <div className="modal-body">
                {modalGeneralError && (
                  <div className="alert alert-danger" role="alert">
                    <span>⚠️</span>
                    <span>{modalGeneralError}</span>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">
                    Store Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-control ${modalErrors.name ? 'is-invalid' : ''}`}
                    placeholder="20 to 60 characters"
                    value={modalForm.name}
                    onChange={(e) =>
                      setModalForm((prev) => ({ ...prev, name: e.target.value }))
                    }
                    maxLength={60}
                    required
                  />
                  <div className="form-hint">
                    <span>Must be 20 to 60 characters</span>
                    <span className="tabular-nums">{modalForm.name.trim().length} / 60</span>
                  </div>
                  {modalErrors.name && (
                    <div className="invalid-feedback">{modalErrors.name}</div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Official Contact Email <span className="required">*</span>
                  </label>
                  <input
                    type="email"
                    className={`form-control ${modalErrors.email ? 'is-invalid' : ''}`}
                    placeholder="contact@storedomain.com"
                    value={modalForm.email}
                    onChange={(e) =>
                      setModalForm((prev) => ({ ...prev, email: e.target.value }))
                    }
                    required
                  />
                  {modalErrors.email && (
                    <div className="invalid-feedback">{modalErrors.email}</div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Physical Address <span className="required">*</span>
                  </label>
                  <textarea
                    className={`form-control ${modalErrors.address ? 'is-invalid' : ''}`}
                    placeholder="Street, District, City (max 400 characters)"
                    value={modalForm.address}
                    onChange={(e) =>
                      setModalForm((prev) => ({ ...prev, address: e.target.value }))
                    }
                    maxLength={400}
                    rows={2}
                    required
                  />
                  <div className="form-hint">
                    <span>Max 400 characters</span>
                    <span className="tabular-nums">{modalForm.address.trim().length} / 400</span>
                  </div>
                  {modalErrors.address && (
                    <div className="invalid-feedback">{modalErrors.address}</div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Assign Store Owner (Optional)</label>
                  <select
                    className="form-control"
                    value={modalForm.ownerId}
                    onChange={(e) =>
                      setModalForm((prev) => ({ ...prev, ownerId: e.target.value }))
                    }
                  >
                    <option value="">None / Assign Later</option>
                    {availableOwners.map((owner) => (
                      <option key={owner.id} value={owner.id}>
                        {owner.name} ({owner.email})
                      </option>
                    ))}
                  </select>
                  <div className="form-hint">
                    <span>Only Store Owner accounts without an assigned store appear here</span>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={modalSubmitting}
                >
                  {modalSubmitting ? 'Registering...' : 'Register Store'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

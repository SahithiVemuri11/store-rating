import React, { useState, useEffect, useMemo } from 'react';
import { adminService } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters & Sorting state
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Add User Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalForm, setModalForm] = useState({
    name: '',
    email: '',
    password: '',
    address: '',
    role: 'NORMAL_USER',
  });
  const [modalErrors, setModalErrors] = useState({});
  const [modalGeneralError, setModalGeneralError] = useState('');
  const [modalSubmitting, setModalSubmitting] = useState(false);

  const { showToast } = useToast();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {
        search,
        role: roleFilter || undefined,
        sortBy,
        sortOrder,
      };
      const res = await adminService.getUsers(params);
      setUsers(res.data.users);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    setCurrentPage(1);
  }, [search, roleFilter, sortBy, sortOrder]);

  // Client-side pagination over fetched results
  const totalUsers = users.length;
  const totalPages = Math.ceil(totalUsers / pageSize) || 1;
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return users.slice(start, start + pageSize);
  }, [users, currentPage, pageSize]);

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

  const formatRole = (role) => {
    switch (role) {
      case 'ADMIN':
        return (
          <span className="role-badge badge-admin">
            <span className="badge-dot"></span> Admin
          </span>
        );
      case 'STORE_OWNER':
        return (
          <span className="role-badge badge-owner">
            <span className="badge-dot"></span> Store Owner
          </span>
        );
      default:
        return (
          <span className="role-badge badge-user">
            <span className="badge-dot"></span> Customer
          </span>
        );
    }
  };

  // Add User Validation
  const validateModal = () => {
    const errs = {};
    const nameTrimmed = modalForm.name.trim();
    if (!nameTrimmed) {
      errs.name = 'Name is required.';
    } else if (nameTrimmed.length < 20 || nameTrimmed.length > 60) {
      errs.name = 'Name must be between 20 and 60 characters.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!modalForm.email.trim() || !emailRegex.test(modalForm.email.trim())) {
      errs.email = 'Please provide a valid email address.';
    }

    const isLenValid = modalForm.password.length >= 8 && modalForm.password.length <= 16;
    const hasUpper = /[A-Z]/.test(modalForm.password);
    const hasSpec = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(modalForm.password);
    if (!isLenValid || !hasUpper || !hasSpec) {
      errs.password =
        'Password must be 8-16 chars with at least 1 uppercase and 1 special character.';
    }

    const addrTrimmed = modalForm.address.trim();
    if (!addrTrimmed) {
      errs.address = 'Address is required.';
    } else if (addrTrimmed.length > 400) {
      errs.address = 'Address cannot exceed 400 characters.';
    }

    setModalErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setModalGeneralError('');
    if (!validateModal()) return;

    try {
      setModalSubmitting(true);
      await adminService.createUser({
        name: modalForm.name.trim(),
        email: modalForm.email.trim(),
        password: modalForm.password,
        address: modalForm.address.trim(),
        role: modalForm.role,
      });

      showToast(`User "${modalForm.name.trim()}" created successfully!`, 'success');
      setShowModal(false);
      setModalForm({
        name: '',
        email: '',
        password: '',
        address: '',
        role: 'NORMAL_USER',
      });
      fetchUsers();
    } catch (err) {
      if (err.response?.data?.errors) {
        const backendErrs = {};
        err.response.data.errors.forEach((e) => {
          backendErrs[e.field] = e.message;
        });
        setModalErrors(backendErrs);
      } else {
        setModalGeneralError(err.response?.data?.message || 'Failed to create user.');
      }
    } finally {
      setModalSubmitting(false);
    }
  };

  return (
    <div className="main-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">
            Manage system users across all roles, filter by account type, and create new accounts
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Add New User
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
              placeholder="Search by name, email, or address..."
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
              Role:
            </label>
            <select
              className="form-control"
              style={{ width: 'auto', padding: '8px 12px', fontSize: '0.86rem' }}
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="">All Roles</option>
              <option value="ADMIN">Administrator</option>
              <option value="STORE_OWNER">Store Owner</option>
              <option value="NORMAL_USER">Customer</option>
            </select>
          </div>
        </div>

        <div className="table-container-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th className="sortable" onClick={() => handleSort('name')}>
                  Name <span className="sort-icon">{getSortIcon('name')}</span>
                </th>
                <th className="sortable" onClick={() => handleSort('email')}>
                  Email <span className="sort-icon">{getSortIcon('email')}</span>
                </th>
                <th className="sortable" onClick={() => handleSort('address')}>
                  Address <span className="sort-icon">{getSortIcon('address')}</span>
                </th>
                <th className="sortable" onClick={() => handleSort('role')}>
                  Role <span className="sort-icon">{getSortIcon('role')}</span>
                </th>
                <th>Assigned Store</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                // 5 Skeleton placeholder rows
                [1, 2, 3, 4, 5].map((idx) => (
                  <tr key={idx}>
                    <td><div className="skeleton skeleton-text" style={{ width: '70%' }}></div></td>
                    <td><div className="skeleton skeleton-text" style={{ width: '85%' }}></div></td>
                    <td><div className="skeleton skeleton-text" style={{ width: '90%' }}></div></td>
                    <td><div className="skeleton skeleton-text" style={{ width: '50%' }}></div></td>
                    <td><div className="skeleton skeleton-text" style={{ width: '60%' }}></div></td>
                  </tr>
                ))
              ) : paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan="5">
                    <div className="empty-state">
                      <div className="empty-state-icon">👥</div>
                      <div className="empty-state-title">No users found</div>
                      <div className="empty-state-desc">
                        {search || roleFilter
                          ? 'Try adjusting your search keywords or role filter.'
                          : 'No user accounts are registered yet.'}
                      </div>
                      {(search || roleFilter) && (
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => {
                            setSearch('');
                            setRoleFilter('');
                          }}
                        >
                          Clear Filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((u) => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{u.name}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                    <td style={{ maxWidth: '280px', fontSize: '0.86rem', color: 'var(--text-muted)' }}>
                      {u.address}
                    </td>
                    <td>{formatRole(u.role)}</td>
                    <td>
                      {u.ownedStore ? (
                        <span style={{ fontWeight: 500, color: 'var(--primary)' }}>
                          🏪 {u.ownedStore.name}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-light)' }}>—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Toolbar */}
        {!loading && totalUsers > 0 && (
          <div className="table-pagination">
            <div>
              Showing <span style={{ fontWeight: 600, color: 'var(--text-primary)' }} className="tabular-nums">{(currentPage - 1) * pageSize + 1}</span> to{' '}
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }} className="tabular-nums">
                {Math.min(currentPage * pageSize, totalUsers)}
              </span>{' '}
              of <span style={{ fontWeight: 600, color: 'var(--text-primary)' }} className="tabular-nums">{totalUsers}</span> accounts
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

      {/* Add User Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Create New User</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                ×
              </button>
            </div>

            <form onSubmit={handleCreateUser} noValidate>
              <div className="modal-body">
                {modalGeneralError && (
                  <div className="alert alert-danger" role="alert">
                    <span>⚠️</span>
                    <span>{modalGeneralError}</span>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">
                    Role <span className="required">*</span>
                  </label>
                  <select
                    className="form-control"
                    value={modalForm.role}
                    onChange={(e) =>
                      setModalForm((prev) => ({ ...prev, role: e.target.value }))
                    }
                  >
                    <option value="NORMAL_USER">Customer (Normal User)</option>
                    <option value="STORE_OWNER">Store Owner</option>
                    <option value="ADMIN">System Administrator</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Full Name <span className="required">*</span>
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
                    Email Address <span className="required">*</span>
                  </label>
                  <input
                    type="email"
                    className={`form-control ${modalErrors.email ? 'is-invalid' : ''}`}
                    placeholder="user@example.com"
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
                    Password <span className="required">*</span>
                  </label>
                  <input
                    type="password"
                    className={`form-control ${modalErrors.password ? 'is-invalid' : ''}`}
                    placeholder="8-16 chars, 1 uppercase, 1 special char"
                    value={modalForm.password}
                    onChange={(e) =>
                      setModalForm((prev) => ({ ...prev, password: e.target.value }))
                    }
                    required
                  />
                  <div className="form-hint">
                    <span>8-16 chars with 1 uppercase letter and 1 special char</span>
                  </div>
                  {modalErrors.password && (
                    <div className="invalid-feedback">{modalErrors.password}</div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Address <span className="required">*</span>
                  </label>
                  <textarea
                    className={`form-control ${modalErrors.address ? 'is-invalid' : ''}`}
                    placeholder="Physical residential address (max 400 characters)"
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
                  {modalSubmitting ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

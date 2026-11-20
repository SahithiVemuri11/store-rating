import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function ChangePasswordPage() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { changePassword, user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Password policy live checks
  const isLenValid = newPassword.length >= 8 && newPassword.length <= 16;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword);
  const isPasswordValid = isLenValid && hasUppercase && hasSpecial;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!oldPassword) {
      setError('Please provide your current password.');
      return;
    }

    if (!isPasswordValid) {
      setError(
        'New password must be 8-16 characters with at least 1 uppercase letter and 1 special character.'
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    if (oldPassword === newPassword) {
      setError('New password cannot be the same as your current password.');
      return;
    }

    try {
      setSubmitting(true);
      await changePassword(oldPassword, newPassword);
      showToast('Your password has been updated successfully!', 'success');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      handleBack();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update password.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    if (user?.role === 'ADMIN') navigate('/admin/dashboard');
    else if (user?.role === 'STORE_OWNER') navigate('/owner/dashboard');
    else navigate('/user/stores');
  };

  return (
    <div className="main-content">
      <div style={{ maxWidth: '480px', margin: '32px auto 0' }}>
        <div className="card" style={{ padding: '32px' }}>
          <div style={{ marginBottom: '24px' }}>
            <h1 className="page-title" style={{ fontSize: '1.45rem' }}>
              Change Password
            </h1>
            <p className="page-subtitle">
              Update your account credentials following the security requirements.
            </p>
          </div>

          {error && (
            <div className="alert alert-danger" role="alert">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="oldPassword">
                Current Password <span className="required">*</span>
              </label>
              <input
                id="oldPassword"
                type="password"
                className="form-control"
                placeholder="Enter your current password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="newPassword">
                New Password <span className="required">*</span>
              </label>
              <input
                id="newPassword"
                type="password"
                className="form-control"
                placeholder="Enter new secure password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <div className="password-policy">
                <div className="policy-title">Security Requirements:</div>
                <div className={`policy-item ${isLenValid ? 'met' : ''}`}>
                  <span>{isLenValid ? '✓' : '•'}</span>
                  <span className="tabular-nums">8 to 16 characters ({newPassword.length}/16)</span>
                </div>
                <div className={`policy-item ${hasUppercase ? 'met' : ''}`}>
                  <span>{hasUppercase ? '✓' : '•'}</span>
                  <span>At least one uppercase letter (A-Z)</span>
                </div>
                <div className={`policy-item ${hasSpecial ? 'met' : ''}`}>
                  <span>{hasSpecial ? '✓' : '•'}</span>
                  <span>At least one special character (!@#$%...)</span>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="confirmPassword">
                Confirm New Password <span className="required">*</span>
              </label>
              <input
                id="confirmPassword"
                type="password"
                className="form-control"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '28px' }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
                style={{ flex: 1 }}
              >
                {submitting ? 'Updating...' : 'Update Password'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleBack}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

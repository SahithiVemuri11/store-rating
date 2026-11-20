import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: '',
  });

  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Password policy live checks
  const isLenValid = formData.password.length >= 8 && formData.password.length <= 16;
  const hasUppercase = /[A-Z]/.test(formData.password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password);
  const isPasswordValid = isLenValid && hasUppercase && hasSpecial;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field-specific error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    setGeneralError('');
  };

  const validate = () => {
    const newErrors = {};

    // Name: 20-60 chars
    const trimmedName = formData.name.trim();
    if (!trimmedName) {
      newErrors.name = 'Name is required.';
    } else if (trimmedName.length < 20) {
      newErrors.name = `Name must be at least 20 characters (currently ${trimmedName.length}).`;
    } else if (trimmedName.length > 60) {
      newErrors.name = `Name must be at most 60 characters (currently ${trimmedName.length}).`;
    }

    // Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required.';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please provide a valid email address.';
    }

    // Password
    if (!formData.password) {
      newErrors.password = 'Password is required.';
    } else if (!isPasswordValid) {
      newErrors.password =
        'Password must be 8-16 characters with at least 1 uppercase letter and 1 special character.';
    }

    // Confirm Password
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    // Address: max 400 chars, non-empty
    const trimmedAddress = formData.address.trim();
    if (!trimmedAddress) {
      newErrors.address = 'Address is required.';
    } else if (trimmedAddress.length > 400) {
      newErrors.address = `Address cannot exceed 400 characters (currently ${trimmedAddress.length}).`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSubmitting(true);
      const user = await register(
        formData.name.trim(),
        formData.email.trim(),
        formData.password,
        formData.address.trim()
      );
      showToast(`Welcome, ${user.name}! Your account is ready.`, 'success');
      navigate('/user/stores');
    } catch (err) {
      if (err.response?.data?.errors) {
        // Map backend validation errors to fields
        const backendErrors = {};
        err.response.data.errors.forEach((e) => {
          backendErrors[e.field] = e.message;
        });
        setErrors(backendErrors);
      } else {
        setGeneralError(
          err.response?.data?.message || 'Registration failed. Please try again.'
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="card" style={{ maxWidth: '520px', width: '100%', padding: '32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
              color: '#ffffff',
              fontSize: '1.4rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px',
              boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.25)',
            }}
          >
            ⭐
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Create Customer Account
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
            Register to explore, rate, and review local stores
          </p>
        </div>

        {generalError && (
          <div className="alert alert-danger" role="alert">
            <span>⚠️</span>
            <span>{generalError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Name Field (20-60 characters) */}
          <div className="form-group">
            <label className="form-label" htmlFor="name">
              Full Name <span className="required">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              className={`form-control ${errors.name ? 'is-invalid' : ''}`}
              placeholder="e.g. Christopher Alexander Davis"
              value={formData.name}
              onChange={handleChange}
              maxLength={70}
              required
            />
            <div className="form-hint">
              <span>Must be 20 to 60 characters</span>
              <span className="tabular-nums">{formData.name.trim().length} / 60</span>
            </div>
            {errors.name && <div className="invalid-feedback">{errors.name}</div>}
          </div>

          {/* Email Field */}
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email Address <span className="required">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className={`form-control ${errors.email ? 'is-invalid' : ''}`}
              placeholder="name@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
            {errors.email && <div className="invalid-feedback">{errors.email}</div>}
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password <span className="required">*</span>
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className={`form-control ${errors.password ? 'is-invalid' : ''}`}
              placeholder="8-16 chars, 1 uppercase, 1 special char"
              value={formData.password}
              onChange={handleChange}
              maxLength={20}
              required
            />
            {/* Live Password Policy Checklist */}
            <div className="password-policy">
              <div className="policy-title">Security Requirements:</div>
              <div className={`policy-item ${isLenValid ? 'met' : ''}`}>
                <span>{isLenValid ? '✓' : '•'}</span>
                <span className="tabular-nums">8 to 16 characters ({formData.password.length}/16)</span>
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
            {errors.password && <div className="invalid-feedback">{errors.password}</div>}
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="confirmPassword">
              Confirm Password <span className="required">*</span>
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
              placeholder="Re-enter your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
            {errors.confirmPassword && (
              <div className="invalid-feedback">{errors.confirmPassword}</div>
            )}
          </div>

          {/* Address Field (Max 400 characters) */}
          <div className="form-group">
            <label className="form-label" htmlFor="address">
              Address <span className="required">*</span>
            </label>
            <textarea
              id="address"
              name="address"
              className={`form-control ${errors.address ? 'is-invalid' : ''}`}
              placeholder="Enter your full residential address"
              value={formData.address}
              onChange={handleChange}
              rows={3}
              maxLength={400}
              required
            />
            <div className="form-hint">
              <span>Max 400 characters</span>
              <span className="tabular-nums">{formData.address.trim().length} / 400</span>
            </div>
            {errors.address && <div className="invalid-feedback">{errors.address}</div>}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={submitting}
            style={{ marginTop: '12px', padding: '11px' }}
          >
            {submitting ? 'Creating Account...' : 'Complete Registration'}
          </button>
        </form>

        <div
          style={{
            marginTop: '20px',
            textAlign: 'center',
            fontSize: '0.88rem',
            color: 'var(--text-muted)',
          }}
        >
          Already have an account?{' '}
          <Link to="/login" style={{ fontWeight: 600 }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

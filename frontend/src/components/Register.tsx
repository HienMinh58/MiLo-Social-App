import React, { useState } from 'react';
import axios, { AxiosError } from 'axios';
import { API_URL } from '../config/api';

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
}

interface IdentityError {
  code: string;
  description: string;
}

const Register: React.FC = () => {
  const [form, setForm] = useState<RegisterForm>({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState<string[]>([]);
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors([]);
    setMessage('');
  };

  const parseApiErrors = (data: unknown): string[] => {
    if (Array.isArray(data) && data.every((item) => typeof item === 'object' && item !== null && 'description' in (item as any))) {
      return (data as IdentityError[]).map((i) => i.description);
    }

    if (data && typeof data === 'object' && 'message' in (data as any)) {
      return [(data as any).message];
    }

    if (typeof data === 'string') return [data];

    return ['Error. Please try again.'];
  };

  const handleSubmit = async (e: React.SubmitEvent ) => {
    e.preventDefault();
    setErrors([]);
    setMessage('');

    // Client-side validation
    const validationErrors: string[] = [];
    if (!form.name.trim()) validationErrors.push('Please Enter Your Name.');
    if (!form.email.trim()) validationErrors.push('Please Enter Your email.');
    if (!form.password) validationErrors.push('Please Enter Your password.');
    if (form.password && form.password.length < 6) validationErrors.push('Password must have at least 6 characters.');
    if (form.password !== form.confirmPassword) validationErrors.push('Confirm password does not match.');

    if (validationErrors.length) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const payload = { userName: form.name, email: form.email, password: form.password };
      const res = await axios.post(`${API_URL}/account/register`, payload);
      if (res && res.data && typeof res.data.message === 'string') setMessage(res.data.message);
      setForm({ name: '', email: '', password: '', confirmPassword: '' });
    } catch (err) {
      const error = err as AxiosError;
      if (error.response && error.response.data) {
        const parsed = parseApiErrors(error.response.data as unknown);
        setErrors(parsed);
      } else {
        setErrors(['Cannot connect to server. Please try again.']);
      }
    } finally {
      setLoading(false);
    }
  };

  const formStyle: React.CSSProperties = {
    maxWidth: 420,
    margin: '20px auto',
    padding: 20,
    borderRadius: 8,
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    background: '#fff',
    fontFamily: 'Segoe UI, Roboto, Helvetica, Arial, sans-serif'
  };

  const inputStyle: React.CSSProperties = {
    display: 'block',
    width: '100%',
    padding: '10px 12px',
    marginBottom: 12,
    borderRadius: 6,
    border: '1px solid #dcdcdc',
    boxSizing: 'border-box'
  };

  const btnStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: 6,
    border: 'none',
    background: '#2563eb',
    color: '#fff',
    fontWeight: 600,
    cursor: 'pointer'
  };

  return (
    <div style={{ padding: 12 }}>
      <form onSubmit={handleSubmit} style={formStyle} noValidate>
        <h2 style={{ marginTop: 0, marginBottom: 12 }}>Register</h2>

        {message && <div style={{ marginBottom: 12, color: 'green' }}>{message}</div>}

        {errors.length > 0 && (
          <div style={{ marginBottom: 12, color: '#b91c1c' }}>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        <label style={{ fontSize: 14, marginBottom: 6 }}>Tên</label>
        <input name="name" value={form.name} onChange={handleChange} style={inputStyle} placeholder="Họ và tên" />

        <label style={{ fontSize: 14, marginBottom: 6 }}>Email</label>
        <input name="email" value={form.email} onChange={handleChange} style={inputStyle} placeholder="email@example.com" type="email" />

        <label style={{ fontSize: 14, marginBottom: 6 }}>Mật khẩu</label>
        <input name="password" value={form.password} onChange={handleChange} style={inputStyle} placeholder="Mật khẩu" type="password" />

        <label style={{ fontSize: 14, marginBottom: 6 }}>Xác nhận mật khẩu</label>
        <input name="confirmPassword" value={form.confirmPassword} onChange={handleChange} style={inputStyle} placeholder="Nhập lại mật khẩu" type="password" />

        <button type="submit" style={btnStyle} disabled={loading}>
          {loading ? 'Sending...' : 'Register'}
        </button>
      </form>
    </div>
  );
};

export default Register;

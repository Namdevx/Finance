import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Btn, Input } from '../components/UI';

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [form, setForm]   = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(form.email, form.password);
      nav('/');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally { setLoading(false); }
  }

  function quickLogin(email, password) {
    setForm({ email, password });
    login(email, password).then(() => nav('/')).catch(e => setError(e.message));
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
    }}>
      {/* Background glow */}
      <div style={{
        position: 'fixed', top: '30%', left: '50%', transform: 'translate(-50%,-50%)',
        width: 600, height: 400, borderRadius: '50%',
        background: 'radial-gradient(ellipse, #00e5a015 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div className="fade-up" style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14, margin: '0 auto 16px',
            background: 'linear-gradient(135deg, var(--accent), var(--blue))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, fontWeight: 800, color: '#000',
          }}>₹</div>
          <h1 style={{ fontFamily: 'var(--sans)', fontWeight: 800, fontSize: 28, letterSpacing: -1 }}>FinanceDash</h1>
          <p style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>Role-based finance management</p>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--card)', border: '1px solid var(--border)',
          borderRadius: 18, padding: 32,
        }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <Input label="Email" type="email" placeholder="admin@demo.com"
              value={form.email} onChange={set('email')} required />
            <Input label="Password" type="password" placeholder="••••••••"
              value={form.password} onChange={set('password')} required />
            {error && (
              <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--red)', background: 'var(--red)11', border: '1px solid var(--red)33', borderRadius: 8, padding: '8px 12px' }}>
                {error}
              </div>
            )}
            <Btn variant="primary" size="lg" loading={loading} style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}>
              Sign in
            </Btn>
          </form>

          {/* Quick login */}
          <div style={{ marginTop: 28, paddingTop: 24, borderTop: '1px solid var(--border)' }}>
            <p style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>Quick login</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'Admin', email: 'admin@demo.com',   pw: 'admin123',   color: '#00e5a0', desc: 'Full access' },
                { label: 'Analyst', email: 'analyst@demo.com', pw: 'analyst123', color: '#5b6ef5', desc: 'Analytics + read' },
                { label: 'Viewer', email: 'viewer@demo.com',  pw: 'viewer123',  color: '#f5a623', desc: 'Read only' },
              ].map(u => (
                <button key={u.label} onClick={() => quickLogin(u.email, u.pw)} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: 'var(--bg)', border: '1px solid var(--border2)',
                  borderRadius: 10, padding: '10px 14px', cursor: 'pointer',
                  transition: 'border-color .15s',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = u.color + '66'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border2)'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: u.color, boxShadow: `0 0 6px ${u.color}` }} />
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text)' }}>{u.email}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)' }}>{u.desc}</span>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: u.color, background: `${u.color}18`, padding: '2px 8px', borderRadius: 4, textTransform: 'uppercase', letterSpacing: 1 }}>{u.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

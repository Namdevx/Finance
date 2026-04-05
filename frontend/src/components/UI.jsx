import { useState } from 'react';

// ── Spinner ───────────────────────────────────────────────────────────────────
export function Spinner({ size = 18, color = 'var(--accent)' }) {
  return (
    <span style={{
      display: 'inline-block', width: size, height: size,
      border: `2px solid var(--border2)`, borderTopColor: color,
      borderRadius: '50%', animation: 'spin .7s linear infinite', flexShrink: 0,
    }} />
  );
}

// ── Badge ─────────────────────────────────────────────────────────────────────
const ROLE_COLORS = { admin: '#00e5a0', analyst: '#5b6ef5', viewer: '#f5a623' };
export function RoleBadge({ role }) {
  const c = ROLE_COLORS[role] || '#888';
  return (
    <span style={{
      fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 500,
      padding: '2px 8px', borderRadius: 4, letterSpacing: 1,
      border: `1px solid ${c}44`, color: c, background: `${c}11`,
      textTransform: 'uppercase',
    }}>{role}</span>
  );
}

export function TypeBadge({ type }) {
  const c = type === 'income' ? 'var(--accent)' : 'var(--red)';
  return (
    <span style={{
      fontFamily: 'var(--mono)', fontSize: 10, padding: '2px 8px',
      borderRadius: 4, color: c, background: `${c === 'var(--accent)' ? 'var(--accent)' : 'var(--red)'}18`,
    }}>{type}</span>
  );
}

// ── Status dot ────────────────────────────────────────────────────────────────
export function StatusDot({ status }) {
  const active = status === 'active';
  return (
    <span style={{
      display: 'inline-block', width: 7, height: 7, borderRadius: '50%',
      background: active ? 'var(--accent)' : 'var(--muted)',
      boxShadow: active ? '0 0 5px var(--accent)' : 'none',
      marginRight: 6, flexShrink: 0,
    }} />
  );
}

// ── Toast ─────────────────────────────────────────────────────────────────────
export function Toast({ toasts, dismiss }) {
  return (
    <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {toasts.map(t => {
        const c = t.type === 'error' ? 'var(--red)' : t.type === 'warn' ? 'var(--amber)' : 'var(--accent)';
        return (
          <div key={t.id} onClick={() => dismiss(t.id)} style={{
            background: 'var(--card)', border: `1px solid ${c}`,
            borderRadius: 10, padding: '11px 18px',
            fontFamily: 'var(--mono)', fontSize: 13, color: c,
            boxShadow: `0 4px 20px ${c}33`,
            animation: 'fadeUp .3s ease', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <span>{t.type === 'error' ? '✗' : '✓'}</span>
            <span>{t.msg}</span>
          </div>
        );
      })}
    </div>
  );
}

// ── useToast hook ─────────────────────────────────────────────────────────────
export function useToast() {
  const [toasts, setToasts] = useState([]);
  function toast(msg, type = 'success') {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  }
  function dismiss(id) { setToasts(t => t.filter(x => x.id !== id)); }
  return { toasts, toast, dismiss };
}

// ── Button ────────────────────────────────────────────────────────────────────
export function Btn({ children, onClick, variant = 'primary', size = 'md', disabled, loading, style: sx }) {
  const pad   = size === 'sm' ? '6px 14px' : size === 'lg' ? '13px 28px' : '9px 20px';
  const fs    = size === 'sm' ? 12 : size === 'lg' ? 15 : 13;
  const styles = {
    primary:  { bg: 'var(--accent)',  color: '#000',          border: 'none' },
    danger:   { bg: 'var(--red)',     color: '#fff',          border: 'none' },
    ghost:    { bg: 'transparent',    color: 'var(--text2)',  border: '1px solid var(--border2)' },
    outline:  { bg: 'transparent',    color: 'var(--accent)', border: '1px solid var(--accent)' },
  }[variant] || {};
  return (
    <button onClick={onClick} disabled={disabled || loading} style={{
      padding: pad, fontSize: fs, fontFamily: 'var(--mono)', fontWeight: 500,
      borderRadius: 'var(--radius-sm)', display: 'inline-flex', alignItems: 'center', gap: 8,
      opacity: disabled || loading ? .5 : 1,
      transition: 'opacity .15s, transform .1s',
      background: styles.bg, color: styles.color, border: styles.border,
      ...sx,
    }}
    onMouseDown={e => e.currentTarget.style.transform = 'scale(.97)'}
    onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
    >
      {loading && <Spinner size={13} color={variant === 'primary' ? '#000' : 'var(--accent)'} />}
      {children}
    </button>
  );
}

// ── Input ─────────────────────────────────────────────────────────────────────
export function Input({ label, error, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && <label style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text2)', letterSpacing: 1.5, textTransform: 'uppercase' }}>{label}</label>}
      <input {...props} style={{
        background: 'var(--bg)', border: `1px solid ${error ? 'var(--red)' : 'var(--border2)'}`,
        borderRadius: 'var(--radius-sm)', padding: '9px 13px',
        color: 'var(--text)', fontFamily: 'var(--mono)', fontSize: 13,
        outline: 'none', width: '100%',
        transition: 'border-color .15s',
        ...props.style,
      }}
      onFocus={e => e.target.style.borderColor = 'var(--accent)'}
      onBlur={e => e.target.style.borderColor = error ? 'var(--red)' : 'var(--border2)'}
      />
      {error && <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--red)' }}>{error}</span>}
    </div>
  );
}

export function Select({ label, children, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && <label style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text2)', letterSpacing: 1.5, textTransform: 'uppercase' }}>{label}</label>}
      <select {...props} style={{
        background: 'var(--bg)', border: '1px solid var(--border2)',
        borderRadius: 'var(--radius-sm)', padding: '9px 13px',
        color: 'var(--text)', fontFamily: 'var(--mono)', fontSize: 13,
        outline: 'none', width: '100%',
      }}>{children}</select>
    </div>
  );
}

// ── Card ──────────────────────────────────────────────────────────────────────
export function Card({ children, style: sx, accent }) {
  return (
    <div style={{
      background: 'var(--card)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius)', padding: 24,
      borderTop: accent ? `2px solid ${accent}` : undefined,
      ...sx,
    }}>{children}</div>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────
export function Modal({ title, onClose, children, width = 480 }) {
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: '#000a', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: 'fadeIn .2s ease',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'var(--card)', border: '1px solid var(--border2)',
        borderRadius: 16, padding: 28, width, maxWidth: '92vw',
        maxHeight: '90vh', overflow: 'auto',
        animation: 'fadeUp .25s ease',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontFamily: 'var(--sans)', fontWeight: 700, fontSize: 18 }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 20, lineHeight: 1 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
export function Empty({ icon = '◌', message }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '60px 20px', color: 'var(--muted)' }}>
      <span style={{ fontSize: 32 }}>{icon}</span>
      <span style={{ fontFamily: 'var(--mono)', fontSize: 13 }}>{message}</span>
    </div>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────
export function StatCard({ label, value, color, prefix = '₹', delay = 0, sub }) {
  return (
    <Card accent={color} style={{ animationDelay: `${delay}ms` }} >
      <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text2)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>{label}</div>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 26, fontWeight: 500, color, letterSpacing: -1 }}>
        {prefix}{typeof value === 'number' ? value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : (value ?? '—')}
      </div>
      {sub && <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)', marginTop: 6 }}>{sub}</div>}
    </Card>
  );
}

// ── Label ─────────────────────────────────────────────────────────────────────
export function MonoLabel({ children }) {
  return <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text2)', letterSpacing: 2, textTransform: 'uppercase' }}>{children}</span>;
}

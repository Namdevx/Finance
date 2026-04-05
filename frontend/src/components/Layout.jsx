import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { RoleBadge, StatusDot } from './UI';

const NAV = [
  { to: '/',        icon: '▦', label: 'Dashboard' },
  { to: '/records', icon: '≡', label: 'Records' },
  { to: '/users',   icon: '◉', label: 'Users',   adminOnly: true },
];

export default function Layout({ children }) {
  const { user, logout, can } = useAuth();
  const nav = useNavigate();

  function handleLogout() { logout(); nav('/login'); }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar */}
      <aside style={{
        width: 220, flexShrink: 0,
        background: 'var(--surface)', borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', padding: '20px 12px',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 10px', marginBottom: 28 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 9,
            background: 'linear-gradient(135deg, var(--accent), var(--blue))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: 15, color: '#000', flexShrink: 0,
          }}>₹</div>
          <span style={{ fontFamily: 'var(--sans)', fontWeight: 800, fontSize: 16, letterSpacing: -.5 }}>FinanceDash</span>
        </div>

        {/* Nav links */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {NAV.filter(n => !n.adminOnly || can.manageUsers).map(({ to, icon, label }) => (
            <NavLink key={to} to={to} end={to === '/'} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 11,
              padding: '10px 14px', borderRadius: 10, fontSize: 14, fontWeight: 600,
              color: isActive ? 'var(--text)' : 'var(--muted)',
              background: isActive ? 'var(--card)' : 'transparent',
              border: `1px solid ${isActive ? 'var(--border2)' : 'transparent'}`,
              transition: 'all .15s',
            })}>
              <span style={{ fontSize: 16 }}>{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Permissions panel */}
        <div style={{ marginTop: 24, padding: '16px 10px', background: 'var(--bg)', borderRadius: 10, border: '1px solid var(--border)' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: 2, marginBottom: 10, textTransform: 'uppercase' }}>Permissions</div>
          {[
            { label: 'View records', ok: true },
            { label: 'Analytics',    ok: can.analytics },
            { label: 'Write data',   ok: can.write },
            { label: 'Manage users', ok: can.manageUsers },
          ].map(p => (
            <div key={p.label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
              <span style={{ color: p.ok ? 'var(--accent)' : 'var(--red)', fontSize: 10, width: 12 }}>{p.ok ? '✓' : '✗'}</span>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: p.ok ? 'var(--text2)' : 'var(--muted)' }}>{p.label}</span>
            </div>
          ))}
        </div>

        {/* User footer */}
        <div style={{ marginTop: 'auto', padding: '14px 10px', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
              background: `linear-gradient(135deg, ${{ admin:'#00e5a0', analyst:'#5b6ef5', viewer:'#f5a623' }[user?.role] || '#444'}, #333)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: 13, color: '#000',
            }}>{user?.name?.[0]}</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
              <div style={{ display: 'flex', alignItems: 'center', marginTop: 2 }}>
                <StatusDot status="active" /><RoleBadge role={user?.role} />
              </div>
            </div>
          </div>
          <button onClick={handleLogout} style={{
            width: '100%', padding: '8px 0', background: 'transparent',
            border: '1px solid var(--border2)', borderRadius: 8,
            fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)',
            cursor: 'pointer', transition: 'color .15s, border-color .15s',
          }}
          onMouseEnter={e => { e.target.style.color='var(--red)'; e.target.style.borderColor='var(--red)44'; }}
          onMouseLeave={e => { e.target.style.color='var(--muted)'; e.target.style.borderColor='var(--border2)'; }}
          >Sign out</button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, overflow: 'auto', background: 'var(--bg)' }}>
        {children}
      </main>
    </div>
  );
}

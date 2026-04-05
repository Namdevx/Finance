import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { api } from '../api/client';
import { useAuth } from '../hooks/useAuth';
import { StatCard, Card, MonoLabel, TypeBadge, Spinner, Empty } from '../components/UI';

function SectionHeader({ title, sub }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h1 style={{ fontFamily: 'var(--sans)', fontWeight: 800, fontSize: 26, letterSpacing: -.5 }}>{title}</h1>
      {sub && <p style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>{sub}</p>}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--card2)', border: '1px solid var(--border2)', borderRadius: 10, padding: '10px 14px' }}>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)', marginBottom: 6 }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ fontFamily: 'var(--mono)', fontSize: 12, color: p.color }}>
          {p.name}: ₹{(p.value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const { can } = useAuth();
  const [summary, setSummary] = useState(null);
  const [trends,  setTrends]  = useState([]);
  const [recent,  setRecent]  = useState([]);
  const [byCat,   setByCat]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [rec] = await Promise.all([api.getRecent()]);
        setRecent(rec.recent || []);
        if (can.analytics) {
          const [sum, tre] = await Promise.all([api.getSummary(), api.getTrends({ year: '2025' })]);
          setSummary(sum.summary);
          setByCat(sum.by_category || []);
          setTrends(tre.trends || []);
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }
    load();
  }, [can.analytics]);

  const incomeTotal = summary?.total_income ?? 0;
  const expTotal    = summary?.total_expenses ?? 0;
  const net         = summary?.net_balance ?? 0;

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      <Spinner size={32} />
    </div>
  );

  return (
    <div className="fade-in" style={{ padding: 32, maxWidth: 1200 }}>
      <SectionHeader title="Dashboard" sub={`Financial overview · ${can.analytics ? 'Full analytics' : 'Limited view — Analyst or Admin required for analytics'}`} />

      {/* Stats */}
      {can.analytics ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 28 }}>
          <StatCard label="Total Income"   value={incomeTotal} color="var(--accent)" delay={0}   sub={`${summary?.total_records} records`} />
          <StatCard label="Total Expenses" value={expTotal}    color="var(--red)"    delay={60} />
          <StatCard label="Net Balance"    value={net}         color={net >= 0 ? 'var(--accent)' : 'var(--red)'} delay={120} />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 28 }}>
          {[0,1,2].map(i => (
            <Card key={i} style={{ opacity: .5, filter: 'blur(1.5px)', pointerEvents:'none' }}>
              <div className="skeleton" style={{ height: 12, width: '50%', marginBottom: 14 }} />
              <div className="skeleton" style={{ height: 28, width: '70%' }} />
            </Card>
          ))}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Trend chart */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <MonoLabel>Monthly Trends · 2025</MonoLabel>
            <div style={{ display: 'flex', gap: 16 }}>
              {[['Income','var(--accent)'], ['Expenses','var(--red)']].map(([l,c]) => (
                <div key={l} style={{ display:'flex', alignItems:'center', gap:5, fontFamily:'var(--mono)', fontSize:10, color:'var(--text2)' }}>
                  <span style={{ width:8, height:8, borderRadius:2, background:c, display:'inline-block' }} />{l}
                </div>
              ))}
            </div>
          </div>
          {can.analytics && trends.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={trends} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="income" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#00e5a0" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#00e5a0" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#ff4d6d" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#ff4d6d" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fontFamily:'var(--mono)', fontSize:10, fill:'var(--muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontFamily:'var(--mono)', fontSize:10, fill:'var(--muted)' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="income"   name="Income"   stroke="#00e5a0" strokeWidth={2} fill="url(#income)" />
                <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#ff4d6d" strokeWidth={2} fill="url(#expense)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 200, display:'flex', alignItems:'center', justifyContent:'center', border:'1px dashed var(--border2)', borderRadius:8 }}>
              <span style={{ fontFamily:'var(--mono)', fontSize:12, color:'var(--muted)' }}>🔒 Analyst or Admin role required</span>
            </div>
          )}
        </Card>

        {/* Category breakdown */}
        <Card>
          <MonoLabel>Category Breakdown</MonoLabel>
          {can.analytics && byCat.length > 0 ? (
            <div style={{ marginTop: 16 }}>
              {byCat.slice(0,7).map(c => {
                const max = byCat[0]?.total || 1;
                return (
                  <div key={c.category + c.type} style={{ marginBottom: 13 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                      <span style={{ fontFamily:'var(--mono)', fontSize:11, color:'var(--text2)' }}>{c.category}</span>
                      <span style={{ fontFamily:'var(--mono)', fontSize:11, color: c.type==='income'?'var(--accent)':'var(--red)' }}>
                        ₹{(c.total||0).toLocaleString()}
                      </span>
                    </div>
                    <div style={{ height:4, background:'var(--border)', borderRadius:2, overflow:'hidden' }}>
                      <div style={{
                        height:'100%', borderRadius:2,
                        width:`${((c.total||0)/max)*100}%`,
                        background: c.type==='income'?'var(--accent)':'var(--red)',
                        animation:'slideRight .6s ease both',
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ marginTop:16, color:'var(--muted)', fontFamily:'var(--mono)', fontSize:12 }}>
              🔒 Analyst or Admin role required
            </div>
          )}
        </Card>
      </div>

      {/* Recent activity */}
      <Card>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
          <MonoLabel>Recent Activity</MonoLabel>
          <span style={{ fontFamily:'var(--mono)', fontSize:10, color:'var(--muted)' }}>{recent.length} records</span>
        </div>
        {recent.length === 0 ? <Empty icon="◌" message="No recent records" /> : (
          <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
            {recent.map((r, i) => (
              <div key={r.id} style={{
                display:'flex', alignItems:'center', justifyContent:'space-between',
                padding:'12px 0',
                borderBottom: i < recent.length-1 ? '1px solid var(--border)' : 'none',
                animation:`fadeUp .3s ease ${i*30}ms both`,
              }}>
                <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                  <div style={{
                    width:36, height:36, borderRadius:10, flexShrink:0,
                    background: r.type==='income' ? 'var(--accent)18' : 'var(--red)18',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:16,
                  }}>{r.type==='income' ? '↑' : '↓'}</div>
                  <div>
                    <div style={{ fontSize:14, fontWeight:600, marginBottom:2 }}>{r.category}</div>
                    <div style={{ fontFamily:'var(--mono)', fontSize:11, color:'var(--muted)' }}>{r.date} · {r.created_by_name}</div>
                  </div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontFamily:'var(--mono)', fontSize:15, fontWeight:500, color: r.type==='income'?'var(--accent)':'var(--red)' }}>
                    {r.type==='income'?'+':'-'}₹{(r.amount||0).toLocaleString()}
                  </div>
                  <div style={{ marginTop:4 }}><TypeBadge type={r.type} /></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

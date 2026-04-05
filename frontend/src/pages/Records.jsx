import { useEffect, useState, useCallback } from 'react';
import { api } from '../api/client';
import { useAuth } from '../hooks/useAuth';
import { Btn, Input, Select, Modal, TypeBadge, Empty, Spinner, MonoLabel, useToast, Toast } from '../components/UI';

const CATEGORIES = ['Salary','Freelance','Investment','Bonus','Rent','Utilities','Groceries','Travel','Software','Marketing','Other'];

function RecordForm({ initial, onSave, onCancel, loading }) {
  const [form, setForm] = useState(initial || { amount:'', type:'income', category:'Salary', date:'', notes:'' });
  const set = k => e => setForm(f => ({...f, [k]: e.target.value}));
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
        <Input label="Amount *" type="number" min="0.01" step="0.01" placeholder="5000.00" value={form.amount} onChange={set('amount')} required />
        <Select label="Type *" value={form.type} onChange={set('type')}>
          <option value="income">income</option>
          <option value="expense">expense</option>
        </Select>
        <Select label="Category *" value={form.category} onChange={set('category')}>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </Select>
        <Input label="Date *" type="date" value={form.date} onChange={set('date')} required />
      </div>
      <Input label="Notes" placeholder="Optional notes..." value={form.notes} onChange={set('notes')} />
      <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:4 }}>
        <Btn variant="ghost" onClick={onCancel}>Cancel</Btn>
        <Btn variant="primary" loading={loading} onClick={() => onSave(form)}>
          {initial ? 'Save Changes' : 'Create Record'}
        </Btn>
      </div>
    </div>
  );
}

export default function Records() {
  const { can } = useAuth();
  const { toasts, toast, dismiss } = useToast();
  const [records, setRecords]   = useState([]);
  const [total,   setTotal]     = useState(0);
  const [page,    setPage]      = useState(1);
  const [loading, setLoading]   = useState(true);
  const [saving,  setSaving]    = useState(false);
  const [filters, setFilters]   = useState({ type:'', category:'', date_from:'', date_to:'' });
  const [modal,   setModal]     = useState(null); // null | 'create' | { record }
  const LIMIT = 15;

  const load = useCallback(async (p = page) => {
    setLoading(true);
    try {
      const params = { page: p, limit: LIMIT };
      if (filters.type)      params.type      = filters.type;
      if (filters.category)  params.category  = filters.category;
      if (filters.date_from) params.date_from = filters.date_from;
      if (filters.date_to)   params.date_to   = filters.date_to;
      const data = await api.getRecords(params);
      setRecords(data.records || []);
      setTotal(data.total || 0);
    } catch (e) { toast(e.message, 'error'); }
    finally { setLoading(false); }
  }, [page, filters]);

  useEffect(() => { load(1); setPage(1); }, [filters]);
  useEffect(() => { load(page); }, [page]);

  async function handleCreate(form) {
    if (!form.amount || !form.date) { toast('Fill required fields', 'warn'); return; }
    setSaving(true);
    try {
      await api.createRecord({ ...form, amount: parseFloat(form.amount) });
      toast('Record created ✓');
      setModal(null);
      load(1); setPage(1);
    } catch (e) { toast(e.message, 'error'); }
    finally { setSaving(false); }
  }

  async function handleUpdate(form) {
    setSaving(true);
    try {
      await api.updateRecord(modal.record.id, { ...form, amount: parseFloat(form.amount) });
      toast('Record updated ✓');
      setModal(null);
      load(page);
    } catch (e) { toast(e.message, 'error'); }
    finally { setSaving(false); }
  }

  async function handleDelete(id) {
    if (!confirm('Soft-delete this record?')) return;
    try {
      await api.deleteRecord(id);
      toast('Record deleted ✓');
      load(page);
    } catch (e) { toast(e.message, 'error'); }
  }

  const pages = Math.ceil(total / LIMIT);
  const setF = k => e => setFilters(f => ({...f, [k]: e.target.value}));

  return (
    <div className="fade-in" style={{ padding:32 }}>
      <Toast toasts={toasts} dismiss={dismiss} />

      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24 }}>
        <div>
          <h1 style={{ fontFamily:'var(--sans)', fontWeight:800, fontSize:26, letterSpacing:-.5 }}>Records</h1>
          <p style={{ fontFamily:'var(--mono)', fontSize:12, color:'var(--muted)', marginTop:4 }}>
            {total} records · {can.write ? 'Full access' : 'Read-only'}
          </p>
        </div>
        {can.write && (
          <Btn variant="primary" onClick={() => setModal('create')}>+ New Record</Btn>
        )}
      </div>

      {/* Filters */}
      <div style={{
        display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12,
        background:'var(--card)', border:'1px solid var(--border)', borderRadius:12,
        padding:16, marginBottom:20,
      }}>
        <Select label="Type" value={filters.type} onChange={setF('type')}>
          <option value="">All types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </Select>
        <Select label="Category" value={filters.category} onChange={setF('category')}>
          <option value="">All categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </Select>
        <Input label="From Date" type="date" value={filters.date_from} onChange={setF('date_from')} />
        <Input label="To Date"   type="date" value={filters.date_to}   onChange={setF('date_to')} />
      </div>

      {/* Table */}
      <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:14, overflow:'hidden' }}>
        {loading ? (
          <div style={{ display:'flex', justifyContent:'center', padding:48 }}><Spinner size={28} /></div>
        ) : records.length === 0 ? (
          <Empty icon="◌" message="No records match your filters" />
        ) : (
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ borderBottom:'1px solid var(--border)' }}>
                {['Date','Category','Type','Amount','Notes','Created By', can.write && 'Actions'].filter(Boolean).map(h => (
                  <th key={h} style={{ padding:'12px 16px', textAlign:'left', fontFamily:'var(--mono)', fontSize:9, color:'var(--muted)', letterSpacing:2, fontWeight:400, textTransform:'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.map((r,i) => (
                <tr key={r.id} style={{
                  borderBottom:'1px solid var(--border)',
                  animation:`fadeUp .25s ease ${i*25}ms both`,
                  transition:'background .1s',
                }}
                onMouseEnter={e => e.currentTarget.style.background='var(--card2)'}
                onMouseLeave={e => e.currentTarget.style.background='transparent'}
                >
                  <td style={{ padding:'12px 16px', fontFamily:'var(--mono)', fontSize:12, color:'var(--muted)', whiteSpace:'nowrap' }}>{r.date}</td>
                  <td style={{ padding:'12px 16px', fontFamily:'var(--mono)', fontSize:13 }}>{r.category}</td>
                  <td style={{ padding:'12px 16px' }}><TypeBadge type={r.type} /></td>
                  <td style={{ padding:'12px 16px', fontFamily:'var(--mono)', fontSize:14, fontWeight:500, color: r.type==='income'?'var(--accent)':'var(--text)', whiteSpace:'nowrap' }}>
                    {r.type==='income'?'+':'-'}₹{(r.amount||0).toLocaleString()}
                  </td>
                  <td style={{ padding:'12px 16px', fontFamily:'var(--mono)', fontSize:11, color:'var(--muted)', maxWidth:180, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {r.notes || '—'}
                  </td>
                  <td style={{ padding:'12px 16px', fontFamily:'var(--mono)', fontSize:11, color:'var(--text2)' }}>{r.created_by_name}</td>
                  {can.write && (
                    <td style={{ padding:'12px 16px' }}>
                      <div style={{ display:'flex', gap:8 }}>
                        <Btn size="sm" variant="ghost" onClick={() => setModal({ record: r })}>Edit</Btn>
                        <Btn size="sm" variant="danger" onClick={() => handleDelete(r.id)}>Del</Btn>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 16px', borderTop:'1px solid var(--border)' }}>
            <span style={{ fontFamily:'var(--mono)', fontSize:11, color:'var(--muted)' }}>
              Page {page} of {pages} · {total} total
            </span>
            <div style={{ display:'flex', gap:6 }}>
              <Btn size="sm" variant="ghost" disabled={page===1} onClick={() => setPage(p=>p-1)}>← Prev</Btn>
              {Array.from({length:Math.min(pages,5)},(_,i)=>i+1).map(p=>(
                <Btn key={p} size="sm" variant={p===page?'outline':'ghost'} onClick={()=>setPage(p)}>{p}</Btn>
              ))}
              <Btn size="sm" variant="ghost" disabled={page===pages} onClick={() => setPage(p=>p+1)}>Next →</Btn>
            </div>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {modal === 'create' && (
        <Modal title="New Financial Record" onClose={() => setModal(null)}>
          <RecordForm onSave={handleCreate} onCancel={() => setModal(null)} loading={saving} />
        </Modal>
      )}

      {/* Edit Modal */}
      {modal?.record && (
        <Modal title="Edit Record" onClose={() => setModal(null)}>
          <RecordForm
            initial={{ ...modal.record, amount: String(modal.record.amount) }}
            onSave={handleUpdate}
            onCancel={() => setModal(null)}
            loading={saving}
          />
        </Modal>
      )}
    </div>
  );
}

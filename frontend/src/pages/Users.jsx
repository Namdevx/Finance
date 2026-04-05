import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../hooks/useAuth';
import { RoleBadge, StatusDot, Btn, Modal, Select, Empty, Spinner, Card, MonoLabel, useToast, Toast } from '../components/UI';

function UserCard({ user, onEdit, onDelete, isSelf }) {
  const roleColor = { admin:'#00e5a0', analyst:'#5b6ef5', viewer:'#f5a623' }[user.role] || '#888';
  return (
    <Card style={{ borderLeft:`3px solid ${roleColor}`, display:'flex', flexDirection:'column', gap:14 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{
            width:40, height:40, borderRadius:'50%', flexShrink:0,
            background:`linear-gradient(135deg,${roleColor},${roleColor}55)`,
            display:'flex', alignItems:'center', justifyContent:'center',
            fontWeight:700, fontSize:16, color:'#000',
          }}>{user.name[0]}</div>
          <div>
            <div style={{ fontWeight:700, fontSize:15 }}>
              {user.name} {isSelf && <span style={{ fontFamily:'var(--mono)', fontSize:10, color:'var(--muted)' }}>(you)</span>}
            </div>
            <div style={{ fontFamily:'var(--mono)', fontSize:12, color:'var(--muted)', marginTop:2 }}>{user.email}</div>
          </div>
        </div>
        <RoleBadge role={user.role} />
      </div>

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{ display:'flex', alignItems:'center', gap:16, fontFamily:'var(--mono)', fontSize:11, color:'var(--muted)' }}>
          <span style={{ display:'flex', alignItems:'center' }}><StatusDot status={user.status} />{user.status}</span>
          <span>Since {user.created_at?.slice(0,10)}</span>
        </div>
        {!isSelf && (
          <div style={{ display:'flex', gap:8 }}>
            <Btn size="sm" variant="ghost" onClick={() => onEdit(user)}>Edit</Btn>
            <Btn size="sm" variant="danger" onClick={() => onDelete(user.id)}>Remove</Btn>
          </div>
        )}
      </div>
    </Card>
  );
}

export default function Users() {
  const { user: me } = useAuth();
  const { toasts, toast, dismiss } = useToast();
  const [users,   setUsers]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name:'', email:'', password:'', role:'viewer' });
  const [editForm, setEditForm] = useState({});
  const [filter, setFilter] = useState({ role:'', status:'' });

  async function load() {
    setLoading(true);
    try {
      const data = await api.getUsers(filter);
      setUsers(data.users || []);
    } catch (e) { toast(e.message, 'error'); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [filter]);

  async function handleCreate() {
    if (!form.name || !form.email || !form.password) { toast('Fill all fields', 'warn'); return; }
    setSaving(true);
    try {
      await api.register(form);
      toast('User created ✓');
      setShowCreate(false);
      setForm({ name:'', email:'', password:'', role:'viewer' });
      load();
    } catch (e) { toast(e.message, 'error'); }
    finally { setSaving(false); }
  }

  async function handleUpdate() {
    setSaving(true);
    try {
      await api.updateUser(editUser.id, editForm);
      toast('User updated ✓');
      setEditUser(null);
      load();
    } catch (e) { toast(e.message, 'error'); }
    finally { setSaving(false); }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this user?')) return;
    try {
      await api.deleteUser(id);
      toast('User deleted ✓');
      load();
    } catch (e) { toast(e.message, 'error'); }
  }

  const setF = k => e => setForm(f=>({...f,[k]:e.target.value}));
  const setEF = k => e => setEditForm(f=>({...f,[k]:e.target.value}));

  return (
    <div className="fade-in" style={{ padding:32 }}>
      <Toast toasts={toasts} dismiss={dismiss} />

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24 }}>
        <div>
          <h1 style={{ fontFamily:'var(--sans)', fontWeight:800, fontSize:26, letterSpacing:-.5 }}>Users</h1>
          <p style={{ fontFamily:'var(--mono)', fontSize:12, color:'var(--muted)', marginTop:4 }}>
            {users.length} users · Admin access only
          </p>
        </div>
        <Btn variant="primary" onClick={() => setShowCreate(true)}>+ New User</Btn>
      </div>

      {/* Filters */}
      <div style={{ display:'flex', gap:12, marginBottom:20 }}>
        <Select value={filter.role} onChange={e=>setFilter(f=>({...f,role:e.target.value}))} style={{ width:160 }}>
          <option value="">All roles</option>
          <option value="admin">Admin</option>
          <option value="analyst">Analyst</option>
          <option value="viewer">Viewer</option>
        </Select>
        <Select value={filter.status} onChange={e=>setFilter(f=>({...f,status:e.target.value}))} style={{ width:160 }}>
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </Select>
      </div>

      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:60 }}><Spinner size={28} /></div>
      ) : users.length === 0 ? <Empty icon="◉" message="No users found" /> : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:16 }}>
          {users.map((u,i) => (
            <div key={u.id} className="fade-up" style={{ animationDelay:`${i*50}ms` }}>
              <UserCard user={u} isSelf={u.id===me?.id} onEdit={u=>{setEditUser(u);setEditForm({role:u.role,status:u.status,name:u.name});}} onDelete={handleDelete} />
            </div>
          ))}
        </div>
      )}

      {/* Create modal */}
      {showCreate && (
        <Modal title="Create New User" onClose={() => setShowCreate(false)}>
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {[
              { label:'Full Name *', key:'name', type:'text', ph:'Alice Admin' },
              { label:'Email *',     key:'email', type:'email', ph:'alice@example.com' },
              { label:'Password *',  key:'password', type:'password', ph:'Min. 6 characters' },
            ].map(f => (
              <div key={f.key}>
                <label style={{ fontFamily:'var(--mono)', fontSize:10, color:'var(--text2)', letterSpacing:1.5, textTransform:'uppercase', display:'block', marginBottom:6 }}>{f.label}</label>
                <input type={f.type} placeholder={f.ph} value={form[f.key]} onChange={setF(f.key)} style={{
                  width:'100%', background:'var(--bg)', border:'1px solid var(--border2)',
                  borderRadius:8, padding:'9px 13px', color:'var(--text)', fontFamily:'var(--mono)', fontSize:13,
                }} />
              </div>
            ))}
            <Select label="Role" value={form.role} onChange={setF('role')}>
              <option value="viewer">Viewer</option>
              <option value="analyst">Analyst</option>
              <option value="admin">Admin</option>
            </Select>
            <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:8 }}>
              <Btn variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Btn>
              <Btn variant="primary" loading={saving} onClick={handleCreate}>Create User</Btn>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit modal */}
      {editUser && (
        <Modal title={`Edit · ${editUser.name}`} onClose={() => setEditUser(null)}>
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div>
              <label style={{ fontFamily:'var(--mono)', fontSize:10, color:'var(--text2)', letterSpacing:1.5, textTransform:'uppercase', display:'block', marginBottom:6 }}>Full Name</label>
              <input value={editForm.name||''} onChange={setEF('name')} style={{
                width:'100%', background:'var(--bg)', border:'1px solid var(--border2)',
                borderRadius:8, padding:'9px 13px', color:'var(--text)', fontFamily:'var(--mono)', fontSize:13,
              }} />
            </div>
            <Select label="Role" value={editForm.role||'viewer'} onChange={setEF('role')}>
              <option value="viewer">Viewer</option>
              <option value="analyst">Analyst</option>
              <option value="admin">Admin</option>
            </Select>
            <Select label="Status" value={editForm.status||'active'} onChange={setEF('status')}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </Select>
            <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:8 }}>
              <Btn variant="ghost" onClick={() => setEditUser(null)}>Cancel</Btn>
              <Btn variant="primary" loading={saving} onClick={handleUpdate}>Save Changes</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

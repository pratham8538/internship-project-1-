import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';

const emptyForm = { name: '', email: '', role: '', phone: '', avatar: '', status: 'active' };

export default function Staff() {
  const { token } = useAuth();
  const [staff, setStaff] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const load = () => api.adminStaff(token).then((data) => setStaff(data.staff));

  useEffect(() => {
    load();
  }, [token]);

  const submit = async (e) => {
    e.preventDefault();
    if (editingId) await api.adminUpdateStaff(editingId, form, token);
    else await api.adminCreateStaff(form, token);
    setForm(emptyForm);
    setEditingId(null);
    load();
  };

  const edit = (member) => {
    setEditingId(member.id);
    setForm({
      name: member.name,
      email: member.email,
      role: member.role,
      phone: member.phone || '',
      avatar: member.avatar || '',
      status: member.status || 'active',
    });
  };

  const remove = async (id) => {
    if (!confirm('Remove this staff member?')) return;
    await api.adminDeleteStaff(id, token);
    if (editingId === id) {
      setEditingId(null);
      setForm(emptyForm);
    }
    load();
  };

  return (
    <AdminLayout title="Staff Access">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <form onSubmit={submit} className="bg-background border border-outline-variant rounded-xl p-6 flex flex-col gap-4 h-fit">
          <h2 className="font-display text-xl font-bold">{editingId ? 'Edit Staff Member' : 'Invite Staff Member'}</h2>
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" className="px-4 py-3 rounded-md border border-gold bg-background" />
          <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Work email" className="px-4 py-3 rounded-md border border-gold bg-background" />
          <input required value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="Role" className="px-4 py-3 rounded-md border border-gold bg-background" />
          <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone number" className="px-4 py-3 rounded-md border border-gold bg-background" />
          <input value={form.avatar} onChange={(e) => setForm({ ...form, avatar: e.target.value })} placeholder="Avatar URL (optional)" className="px-4 py-3 rounded-md border border-gold bg-background" />
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="px-4 py-3 rounded-md border border-gold bg-background">
            <option value="active">Active</option>
            <option value="invited">Invited</option>
            <option value="inactive">Inactive</option>
          </select>
          <div className="flex gap-3">
            <button type="submit" className="flex-1 bg-primary hover:bg-primary-hover text-white font-bold py-3 rounded-full shadow-glow">
              {editingId ? 'Save Changes' : 'Invite Staff'}
            </button>
            {editingId && (
              <button type="button" onClick={() => { setEditingId(null); setForm(emptyForm); }} className="px-5 py-3 rounded-full border border-outline-variant font-semibold">
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="xl:col-span-2 bg-background border border-outline-variant rounded-xl p-6">
          <h2 className="font-display text-xl font-bold mb-4">Team Directory</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {staff.map((member) => (
              <div key={member.id} className="rounded-xl border border-outline-variant bg-surface-container-low p-4">
                <div className="flex items-start gap-4">
                  {member.avatar ? (
                    <img src={member.avatar} alt={member.name} className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-display text-lg font-bold">
                      {member.name[0]?.toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-semibold truncate">{member.name}</h3>
                      <span className={`text-[11px] font-bold px-2 py-1 rounded-full ${member.status === 'active' ? 'bg-primary text-white' : 'bg-outline-variant text-on-surface-variant'}`}>
                        {member.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-on-surface-variant">{member.role}</p>
                    <p className="text-sm text-on-surface mt-2">{member.email}</p>
                    <p className="text-sm text-on-surface-variant">{member.phone || 'No phone added'}</p>
                  </div>
                </div>
                <div className="flex gap-4 mt-4 text-sm font-semibold">
                  <button onClick={() => edit(member)} className="text-primary hover:underline">Edit</button>
                  <button onClick={() => remove(member.id)} className="text-on-surface-variant hover:text-primary">Remove</button>
                </div>
              </div>
            ))}
            {staff.length === 0 && <p className="text-on-surface-variant">No staff members yet.</p>}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

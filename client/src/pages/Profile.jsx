import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

export default function Profile() {
  const { user, token, updateUser } = useAuth();
  const [form, setForm] = useState({ name: '', phone: '', address: '' });
  const [orders, setOrders] = useState([]);
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState('orders');

  useEffect(() => {
    if (user) setForm({ name: user.name || '', phone: user.phone || '', address: user.address || '' });
  }, [user]);

  useEffect(() => {
    if (token) api.myOrders(token).then((data) => setOrders(data.orders)).catch(() => {});
  }, [token]);

  const save = async (e) => {
    e.preventDefault();
    const { user: updatedUser } = await api.updateProfile(form, token);
    updateUser(updatedUser);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 md:py-14">
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8">
        <aside className="bg-gradient-to-br from-espresso to-[#28110d] rounded-[28px] p-8 text-cream h-fit relative overflow-hidden">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at top right, #be1a1a 0%, transparent 45%)' }} />
          <div className="relative z-10">
            <div className="w-20 h-20 rounded-full bg-primary text-white flex items-center justify-center font-display font-bold text-3xl mb-5">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <h1 className="font-display text-3xl font-bold">{user?.name}</h1>
            <p className="text-cream/75 text-sm mt-1">{user?.email}</p>
            <div className="grid grid-cols-1 gap-3 mt-8">
              <div className="rounded-2xl bg-white/8 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.18em] text-gold mb-2">Orders</p>
                <p className="font-display text-3xl">{orders.length}</p>
              </div>
              <div className="rounded-2xl bg-white/8 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.18em] text-gold mb-2">Saved Phone</p>
                <p className="text-sm">{user?.phone || 'Add your number'}</p>
              </div>
            </div>
          </div>
        </aside>

        <section>
          <div className="flex gap-2 mb-8 border-b border-outline-variant">
            {['orders', 'details'].map((tabName) => (
              <button key={tabName} onClick={() => setTab(tabName)} className={`px-4 py-2.5 font-semibold text-sm capitalize border-b-2 transition-colors ${tab === tabName ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-primary'}`}>
                {tabName === 'orders' ? 'Order History' : 'Account Details'}
              </button>
            ))}
          </div>

          {tab === 'orders' ? (
            <div className="flex flex-col gap-4">
              {orders.length === 0 && <p className="text-on-surface-variant">No orders yet. <Link to="/menu" className="text-primary font-semibold hover:underline">Start ordering</Link></p>}
              {orders.map((order) => (
                <div key={order.id} className="bg-surface-container rounded-[24px] p-6 border border-outline-variant flex items-center justify-between flex-wrap gap-4 warm-card">
                  <div>
                    <p className="font-display font-bold text-xl">{order.order_number || `Order #${order.id}`}</p>
                    <p className="text-xs text-on-surface-variant mt-1">{new Date(order.created_at).toLocaleString()}</p>
                    <p className="text-sm text-on-surface-variant mt-2">{order.items.map((item) => item.name).join(', ')}</p>
                  </div>
                  <div className="flex items-center gap-4 flex-wrap">
                    <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-gold/40 text-on-surface">{order.status}</span>
                    <span className="font-bold text-primary text-lg">${order.total.toFixed(2)}</span>
                    <Link to={`/track-order?id=${order.id}`} className="bg-primary text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-primary-hover transition-colors">Track</Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <form onSubmit={save} className="bg-surface-container rounded-[24px] p-6 md:p-8 border border-outline-variant max-w-2xl flex flex-col gap-5 warm-card">
              {saved && <div className="bg-primary/10 text-primary text-sm font-semibold rounded-md px-4 py-2">Profile updated!</div>}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-on-surface-variant">Full Name</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full mt-1 px-4 py-3 rounded-xl border border-gold bg-background focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-on-surface-variant">Phone</label>
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full mt-1 px-4 py-3 rounded-xl border border-gold bg-background focus:border-primary focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-on-surface-variant">Delivery Address</label>
                <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} rows={4} className="w-full mt-1 px-4 py-3 rounded-xl border border-gold bg-background focus:border-primary focus:outline-none" />
              </div>
              <button type="submit" className="bg-primary hover:bg-primary-hover text-white font-bold py-3 rounded-xl shadow-glow transition-all hover:scale-[1.02]">Save Changes</button>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}

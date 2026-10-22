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
    <div className="max-w-6xl mx-auto px-4 py-10 md:py-14 animate-in fade-in duration-300">
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8">
        <aside className="bg-gradient-to-br from-espresso via-[#151417] to-[#1e1c20] rounded-[28px] p-8 text-cream h-fit relative overflow-hidden border border-outline-variant/30 shadow-warm">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at top right, #C5A880 0%, transparent 50%)' }} />
          <div className="relative z-10">
            <div className="w-20 h-20 rounded-full bg-primary text-on-primary flex items-center justify-center font-display font-extrabold text-3xl mb-5 shadow-glow">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <h1 className="font-display text-3xl font-black tracking-tight">{user?.name}</h1>
            <p className="text-cream/70 text-sm mt-1">{user?.email}</p>
            <div className="grid grid-cols-1 gap-3 mt-8">
              <div className="rounded-2xl bg-surface-container border border-outline-variant/30 px-4 py-4">
                <p className="text-[10px] uppercase tracking-[0.18em] text-primary font-bold mb-2">Orders Placed</p>
                <p className="font-display text-3xl font-extrabold text-on-surface">{orders.length}</p>
              </div>
              <div className="rounded-2xl bg-surface-container border border-outline-variant/30 px-4 py-4">
                <p className="text-[10px] uppercase tracking-[0.18em] text-primary font-bold mb-2">Saved Phone</p>
                <p className="text-sm font-semibold text-on-surface">{user?.phone || 'Add your number'}</p>
              </div>
            </div>
          </div>
        </aside>

        <section>
          <div className="flex gap-2 mb-8 border-b border-outline-variant/20">
            {['orders', 'details'].map((tabName) => (
              <button key={tabName} onClick={() => setTab(tabName)} className={`px-4 py-3 font-bold text-sm uppercase tracking-wider border-b-2 transition-all ${tab === tabName ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-primary'}`}>
                {tabName === 'orders' ? 'Order History' : 'Account Details'}
              </button>
            ))}
          </div>

          {tab === 'orders' ? (
            <div className="flex flex-col gap-4 animate-in fade-in duration-300">
              {orders.length === 0 && <p className="text-on-surface-variant">No orders yet. <Link to="/menu" className="text-primary font-bold hover:underline">Start ordering</Link></p>}
              {orders.map((order) => (
                <div key={order.id} className="bg-surface-container rounded-[24px] p-6 border border-outline-variant/30 flex items-center justify-between flex-wrap gap-4 warm-card">
                  <div>
                    <p className="font-display font-bold text-xl text-on-surface">{order.order_number || `Order #${order.id}`}</p>
                    <p className="text-xs text-on-surface-variant mt-1 font-semibold">{new Date(order.created_at).toLocaleString()}</p>
                    <p className="text-sm text-on-surface-variant mt-3 pr-2">{order.items.map((item) => item.name).join(', ')}</p>
                  </div>
                  <div className="flex items-center gap-4 flex-wrap">
                    <span className="text-[10px] font-bold px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary uppercase tracking-wider">{order.status}</span>
                    <span className="font-bold text-primary text-lg">${order.total.toFixed(2)}</span>
                    <Link to={`/track-order?id=${order.id}`} className="bg-primary text-on-primary text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-primary-hover transition-colors shadow-glow uppercase tracking-wider">Track</Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <form onSubmit={save} className="bg-surface-container rounded-[24px] p-6 md:p-8 border border-outline-variant/30 max-w-2xl flex flex-col gap-5 warm-card animate-in fade-in duration-300">
              {saved && <div className="bg-primary/10 border border-primary/20 text-primary text-sm font-bold rounded-xl px-4 py-3">Profile updated!</div>}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs uppercase tracking-wider font-bold text-on-surface-variant">Full Name</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full mt-2 px-4 py-3 rounded-xl border border-outline bg-background/50 text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider font-bold text-on-surface-variant">Phone</label>
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full mt-2 px-4 py-3 rounded-xl border border-outline bg-background/50 text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider font-bold text-on-surface-variant">Delivery Address</label>
                <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} rows={4} className="w-full mt-2 px-4 py-3 rounded-xl border border-outline bg-background/50 text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <button type="submit" className="bg-primary hover:bg-primary-hover text-on-primary font-bold py-3.5 rounded-xl shadow-glow transition-all hover:scale-[1.02] uppercase text-sm tracking-wider mt-2">Save Changes</button>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}

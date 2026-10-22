import { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import { api } from '../lib/api';

export default function Profile() {
  const { user, token, updateUser } = useAuth();
  const { addItem } = useCart();
  const { favoritesList, favoriteCount, toggleFavorite, refreshFavorites } = useFavorites();
  const [form, setForm] = useState({ name: '', phone: '', address: '' });
  const [orders, setOrders] = useState([]);
  const [saved, setSaved] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [tab, setTab] = useState(searchParams.get('tab') || 'orders');
  const [addedId, setAddedId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const urlTab = searchParams.get('tab');
    if (urlTab && ['orders', 'favorites', 'details'].includes(urlTab)) {
      setTab(urlTab);
    }
  }, [searchParams]);

  useEffect(() => {
    if (user) setForm({ name: user.name || '', phone: user.phone || '', address: user.address || '' });
  }, [user]);

  useEffect(() => {
    if (token) {
      api.myOrders(token).then((data) => setOrders(data.orders || [])).catch(() => {});
      refreshFavorites();
    }
  }, [token, refreshFavorites]);

  const switchTab = (tabName) => {
    setTab(tabName);
    setSearchParams({ tab: tabName });
  };

  const handleQuickAdd = (p) => {
    addItem({
      pizzaId: p.id,
      name: p.name,
      price: p.price,
      image: p.image,
    });
    setAddedId(p.id);
    setTimeout(() => setAddedId(null), 1800);
  };

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
        {/* User Card Sidebar */}
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
              <div
                onClick={() => switchTab('favorites')}
                className="rounded-2xl bg-surface-container border border-outline-variant/30 px-4 py-4 cursor-pointer hover:border-red-500/40 transition-colors group"
              >
                <p className="text-[10px] uppercase tracking-[0.18em] text-red-400 font-bold mb-2 flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs icon-fill">favorite</span> Saved Favorites
                </p>
                <p className="font-display text-3xl font-extrabold text-on-surface group-hover:text-red-400 transition-colors">
                  {favoriteCount}
                </p>
              </div>
              <div className="rounded-2xl bg-surface-container border border-outline-variant/30 px-4 py-4">
                <p className="text-[10px] uppercase tracking-[0.18em] text-primary font-bold mb-2">Saved Phone</p>
                <p className="text-sm font-semibold text-on-surface">{user?.phone || 'Add your number'}</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Tabs and Tab Content */}
        <section>
          <div className="flex gap-2 mb-8 border-b border-outline-variant/20 flex-wrap">
            <button
              onClick={() => switchTab('orders')}
              className={`px-4 py-3 font-bold text-sm uppercase tracking-wider border-b-2 transition-all ${
                tab === 'orders' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-primary'
              }`}
            >
              Order History ({orders.length})
            </button>
            <button
              onClick={() => switchTab('favorites')}
              className={`px-4 py-3 font-bold text-sm uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 ${
                tab === 'favorites' ? 'border-red-500 text-red-400' : 'border-transparent text-on-surface-variant hover:text-red-400'
              }`}
            >
              <span className={`material-symbols-outlined text-sm ${tab === 'favorites' ? 'icon-fill' : ''}`}>favorite</span>
              Saved Favorites ({favoriteCount})
            </button>
            <button
              onClick={() => switchTab('details')}
              className={`px-4 py-3 font-bold text-sm uppercase tracking-wider border-b-2 transition-all ${
                tab === 'details' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-primary'
              }`}
            >
              Account Details
            </button>
          </div>

          {/* TAB 1: ORDER HISTORY */}
          {tab === 'orders' && (
            <div className="flex flex-col gap-4 animate-in fade-in duration-300">
              {orders.length === 0 ? (
                <div className="bg-surface-container rounded-2xl p-10 text-center border border-outline-variant/30">
                  <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2">local_pizza</span>
                  <p className="font-bold text-on-surface">No orders yet</p>
                  <p className="text-sm text-on-surface-variant mt-1 mb-5">Start your gourmet pizza journey today.</p>
                  <Link to="/menu" className="bg-primary text-on-primary font-bold px-6 py-2.5 rounded-full shadow-glow text-xs uppercase tracking-wider">
                    Browse Menu
                  </Link>
                </div>
              ) : (
                orders.map((order) => (
                  <div key={order.id} className="bg-surface-container rounded-[24px] p-6 border border-outline-variant/30 flex items-center justify-between flex-wrap gap-4 warm-card">
                    <div>
                      <p className="font-display font-bold text-xl text-on-surface">{order.order_number || `Order #${order.id}`}</p>
                      <p className="text-xs text-on-surface-variant mt-1 font-semibold">{new Date(order.created_at).toLocaleString()}</p>
                      <p className="text-sm text-on-surface-variant mt-3 pr-2">{order.items.map((item) => item.name).join(', ')}</p>
                    </div>
                    <div className="flex items-center gap-4 flex-wrap">
                      <span className="text-[10px] font-bold px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary uppercase tracking-wider">{order.status}</span>
                      <span className="font-bold text-primary text-lg">${order.total.toFixed(2)}</span>
                      <Link to={`/track-order?id=${order.id}`} className="bg-primary text-on-primary text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-primary-hover transition-colors shadow-glow uppercase tracking-wider">
                        Track
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: SAVED FAVORITES */}
          {tab === 'favorites' && (
            <div className="animate-in fade-in duration-300">
              {favoritesList.length === 0 ? (
                <div className="bg-surface-container rounded-2xl p-12 text-center border border-outline-variant/30">
                  <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-4">
                    <span className="material-symbols-outlined text-3xl">favorite_border</span>
                  </div>
                  <h3 className="font-display font-bold text-xl text-on-surface">No Favorites Saved Yet</h3>
                  <p className="text-sm text-on-surface-variant max-w-md mx-auto mt-2 mb-6">
                    Click the heart icon on any pizza in our menu to save it here for instant 1-click reordering!
                  </p>
                  <Link to="/menu" className="bg-primary text-on-primary font-bold px-8 py-3 rounded-full shadow-glow hover:bg-primary-hover transition-all text-xs uppercase tracking-wider inline-flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">restaurant_menu</span> Explore Artisanal Pizzas
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {favoritesList.map((p) => (
                    <div
                      key={p.id}
                      className="bg-surface-container rounded-2xl overflow-hidden border border-outline-variant/30 shadow-warm warm-card relative group flex flex-col justify-between"
                    >
                      {/* Remove Favorite Button */}
                      <button
                        type="button"
                        onClick={() => toggleFavorite(p)}
                        className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-red-500 hover:text-red-400 flex items-center justify-center transition-all hover:scale-110"
                        title="Remove from favorites"
                      >
                        <span className="material-symbols-outlined text-base icon-fill">favorite</span>
                      </button>

                      <div>
                        <div
                          className="h-44 overflow-hidden cursor-pointer relative"
                          onClick={() => navigate(`/pizza/${p.id}`)}
                        >
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                        <div className="p-5">
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <h3
                              onClick={() => navigate(`/pizza/${p.id}`)}
                              className="font-display font-bold text-lg text-on-surface hover:text-primary cursor-pointer transition-colors"
                            >
                              {p.name}
                            </h3>
                            <span className="text-[10px] bg-primary/10 border border-primary/20 text-primary px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider whitespace-nowrap">
                              {p.category}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 mb-2">
                            <div className="flex items-center text-xs font-semibold text-primary">
                              <span className="material-symbols-outlined icon-fill text-sm" style={{ color: '#C5A880' }}>star</span>
                              <span className="ml-0.5">{p.rating ? Number(p.rating).toFixed(1) : '4.8'}</span>
                            </div>
                            <span className="text-xs text-on-surface-variant/60">• Verified Favorite</span>
                          </div>

                          <p className="text-xs text-on-surface-variant line-clamp-2 mb-4 leading-relaxed">
                            {p.description}
                          </p>
                        </div>
                      </div>

                      <div className="p-5 pt-0 flex items-center justify-between border-t border-outline-variant/20 mt-2">
                        <span className="font-display font-black text-2xl text-primary">${p.price.toFixed(2)}</span>
                        <button
                          onClick={() => handleQuickAdd(p)}
                          className="bg-primary hover:bg-primary-hover text-on-primary text-xs uppercase tracking-wider font-bold px-5 py-2.5 rounded-full shadow-glow transition-all hover:scale-105 flex items-center gap-1.5"
                        >
                          <span className="material-symbols-outlined text-base">
                            {addedId === p.id ? 'check' : 'shopping_bag'}
                          </span>
                          {addedId === p.id ? 'Added!' : 'Order Now'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ACCOUNT DETAILS */}
          {tab === 'details' && (
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

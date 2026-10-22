import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

const STAGE_ICONS = {
  Placed: 'receipt_long',
  Confirmed: 'task_alt',
  Preparing: 'skillet',
  'Out for Delivery': 'delivery_dining',
  Delivered: 'home',
};

export default function TrackOrder() {
  const [params] = useSearchParams();
  const [orderId, setOrderId] = useState(params.get('id') || '');
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const { token } = useAuth();

  const search = async (e) => {
    e?.preventDefault();
    if (!orderId) return;
    setError('');
    setOrder(null);
    try {
      const data = await api.getOrder(orderId, token);
      setOrder(data.order);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (params.get('id') && token) search();
  }, [token]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 md:py-16">
      <div className="grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr] gap-8 items-start">
        <section className="bg-gradient-to-br from-espresso to-[#28110d] rounded-[28px] p-8 md:p-10 text-cream relative overflow-hidden">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at top right, #be1a1a 0%, transparent 45%)' }} />
          <div className="relative z-10">
            <p className="uppercase tracking-[0.2em] text-gold text-xs font-bold mb-4">Live Tracker</p>
            <h1 className="font-display text-4xl md:text-5xl font-black mb-4 uppercase tracking-wider">Track Your Order</h1>
            <p className="text-cream/80 mb-8 max-w-sm leading-relaxed">Enter your order number to watch every stage from placement to doorstep delivery.</p>

            <form onSubmit={search} className="flex flex-col sm:flex-row gap-3">
              <input
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="Order ID, e.g. 1"
                className="flex-1 px-4 py-3 rounded-xl border border-outline bg-background/50 text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder-on-surface-variant/40"
              />
              <button type="submit" className="bg-primary hover:bg-primary-hover text-on-primary font-bold px-8 py-3 rounded-xl shadow-glow transition-colors uppercase text-sm tracking-wider">
                Track
              </button>
            </form>

            {!token && (
              <p className="text-sm text-cream/75 mt-4">
                Please <Link to="/login" className="text-primary font-semibold hover:underline">login</Link> to track your orders.
              </p>
            )}
            {error && <div className="bg-[#2A1415]/80 text-red-200 text-sm font-semibold rounded-xl px-4 py-3 border border-red-900/40 mt-4">{error}</div>}
          </div>
        </section>

        {order ? (
          <section className="bg-surface-container rounded-[28px] p-8 border border-outline-variant/30 warm-card">
            <div className="flex justify-between items-center mb-8 border-b border-outline-variant/20 pb-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-on-surface-variant">Order #{order.id}</p>
                <p className="font-display font-black text-2xl text-primary mt-1">{order.status}</p>
              </div>
              <span className="font-display font-black text-primary text-2xl">${Number(order.total).toFixed(2)}</span>
            </div>

            <div className="flex justify-between relative gap-2 py-4">
              <div className="absolute top-9 left-0 right-0 h-1 bg-outline-variant/30 z-0 rounded-full" />
              <div className="absolute top-9 left-0 h-1 bg-primary z-0 transition-all rounded-full" style={{ width: `${(order.stageIndex / (order.stages.length - 1)) * 100}%` }} />
              {order.stages.map((stage, index) => (
                <div key={stage} className="relative z-10 flex flex-col items-center gap-3 flex-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all ${index <= order.stageIndex ? 'bg-primary text-on-primary border-primary shadow-glow' : 'bg-surface-container border-outline text-on-surface-variant'}`}>
                    <span className="material-symbols-outlined text-lg">{STAGE_ICONS[stage] || 'circle'}</span>
                  </div>
                  <span className="text-[11px] md:text-xs font-bold text-center text-on-surface-variant max-w-[80px]">{stage}</span>
                </div>
              ))}
            </div>

            <div className="mt-10 border-t border-outline-variant/25 pt-6">
              <h3 className="font-display font-bold mb-4 uppercase tracking-wider text-xs">Items</h3>
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm mb-3 gap-4 border-b border-outline-variant/10 pb-2 last:border-0">
                  <span className="text-on-surface-variant">{item.qty} x {item.name}</span>
                  <span className="font-bold text-on-surface shrink-0">${(item.price * item.qty).toFixed(2)}</span>
                </div>
              ))}
              <p className="text-sm text-on-surface-variant mt-6 bg-surface/50 border border-outline-variant/15 p-4 rounded-xl"><span className="font-bold text-on-surface uppercase tracking-wider text-[11px] block mb-1">Delivering to</span> {order.address}</p>
            </div>
          </section>
        ) : (
          <section className="bg-surface-container rounded-[28px] p-8 border border-outline-variant/30 min-h-[420px] flex flex-col justify-center shadow-warm">
            <div>
              <h2 className="font-display text-2xl font-black mb-3 uppercase tracking-wider">Order Journey Preview</h2>
              <p className="text-on-surface-variant mb-8 leading-relaxed">Once you enter a valid order ID, this panel will show the live kitchen progress, delivery stage, and a full item summary.</p>
              <div className="grid grid-cols-5 gap-2">
                {['Placed', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered'].map((stage, index) => (
                  <div key={stage} className="flex flex-col items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border border-outline-variant/20 ${index < 2 ? 'bg-primary/20 text-primary border-primary/30' : 'bg-surface-container-high text-on-surface-variant'}`}>
                      <span className="material-symbols-outlined text-lg">{STAGE_ICONS[stage]}</span>
                    </div>
                    <span className="text-[10px] font-bold text-center text-on-surface-variant leading-tight">{stage}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

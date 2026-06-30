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
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">Track Your Order</h1>
            <p className="text-cream/80 mb-8 max-w-sm">Enter your order number to watch every stage from placement to doorstep delivery.</p>

            <form onSubmit={search} className="flex flex-col sm:flex-row gap-3">
              <input
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="Order ID, e.g. 1"
                className="flex-1 px-4 py-3 rounded-xl border border-cream/10 bg-white/95 text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button type="submit" className="bg-primary hover:bg-primary-hover text-white font-bold px-8 py-3 rounded-xl shadow-glow transition-colors">
                Track
              </button>
            </form>

            {!token && (
              <p className="text-sm text-cream/75 mt-4">
                Please <Link to="/login" className="text-gold font-semibold hover:underline">login</Link> to track your orders.
              </p>
            )}
            {error && <div className="bg-red-50 text-primary text-sm font-medium rounded-md px-4 py-3 border border-primary/20 mt-4">{error}</div>}
          </div>
        </section>

        {order ? (
          <section className="bg-surface-container rounded-[28px] p-8 border border-outline-variant warm-card">
            <div className="flex justify-between items-center mb-8">
              <div>
                <p className="text-sm text-on-surface-variant">Order #{order.id}</p>
                <p className="font-display font-bold text-2xl">{order.status}</p>
              </div>
              <span className="font-bold text-primary text-2xl">${Number(order.total).toFixed(2)}</span>
            </div>

            <div className="flex justify-between relative gap-2">
              <div className="absolute top-5 left-0 right-0 h-1 bg-gold/30 z-0" />
              <div className="absolute top-5 left-0 h-1 bg-primary z-0 transition-all" style={{ width: `${(order.stageIndex / (order.stages.length - 1)) * 100}%` }} />
              {order.stages.map((stage, index) => (
                <div key={stage} className="relative z-10 flex flex-col items-center gap-2 flex-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${index <= order.stageIndex ? 'bg-primary text-white border-primary' : 'bg-surface-container-high text-on-surface-variant border-gold/50'}`}>
                    <span className="material-symbols-outlined text-lg">{STAGE_ICONS[stage] || 'circle'}</span>
                  </div>
                  <span className="text-[11px] md:text-xs font-semibold text-center text-on-surface-variant max-w-[70px]">{stage}</span>
                </div>
              ))}
            </div>

            <div className="mt-10 border-t border-outline-variant pt-6">
              <h3 className="font-display font-bold mb-4">Items</h3>
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm mb-2 gap-4">
                  <span className="text-on-surface-variant">{item.qty} x {item.name}</span>
                  <span className="font-semibold shrink-0">${(item.price * item.qty).toFixed(2)}</span>
                </div>
              ))}
              <p className="text-sm text-on-surface-variant mt-5"><span className="font-semibold">Delivering to:</span> {order.address}</p>
            </div>
          </section>
        ) : (
          <section className="bg-background rounded-[28px] p-8 border border-outline-variant min-h-[420px] flex flex-col justify-center">
            <div>
              <h2 className="font-display text-2xl font-bold mb-3">Order journey preview</h2>
              <p className="text-on-surface-variant mb-8">Once you enter a valid order ID, this panel will show the live kitchen progress, delivery stage, and a full item summary.</p>
              <div className="grid grid-cols-5 gap-2">
                {['Placed', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered'].map((stage, index) => (
                  <div key={stage} className="flex flex-col items-center gap-2">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${index < 2 ? 'bg-primary text-white' : 'bg-surface-container-high text-on-surface-variant'}`}>
                      <span className="material-symbols-outlined text-lg">{STAGE_ICONS[stage]}</span>
                    </div>
                    <span className="text-[11px] text-center text-on-surface-variant">{stage}</span>
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

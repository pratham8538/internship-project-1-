import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

export default function OrderSuccess() {
  const { id } = useParams();
  const { token } = useAuth();
  const [order, setOrder] = useState(null);

  const confetti = Array.from({ length: 36 }, (_, index) => ({
    id: index,
    left: `${(index * 13) % 100}%`,
    duration: `${2.8 + (index % 5) * 0.45}s`,
    delay: `${(index % 6) * 0.3}s`,
    color: ['#C5A880', '#D4AF37', '#E5DCD0', '#A0815E'][index % 4],
    circle: index % 3 === 0,
  }));

  useEffect(() => {
    if (token) api.getOrder(id, token).then((data) => setOrder(data.order)).catch(() => {});
  }, [id, token]);

  return (
    <div className="relative overflow-hidden min-h-[82vh] flex items-center justify-center px-4 py-16 animate-in fade-in duration-300">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {confetti.map((piece) => (
          <span
            key={piece.id}
            className="confetti-piece"
            style={{
              left: piece.left,
              animationDuration: piece.duration,
              animationDelay: piece.delay,
              backgroundColor: piece.color,
              borderRadius: piece.circle ? '9999px' : '0.25rem',
              width: piece.circle ? '10px' : '12px',
              height: piece.circle ? '10px' : '20px',
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-2xl w-full bg-surface-container rounded-[28px] border border-outline-variant/30 p-8 md:p-12 text-center warm-card shadow-warm">
        <div className="relative mb-8">
          <div className="w-44 h-44 md:w-48 md:h-48 rounded-full bg-surface-container-low flex items-center justify-center mx-auto relative success-pulse border border-outline-variant/30">
            <img
              className="w-36 h-36 md:w-40 md:h-40 object-cover rounded-full shadow-sm border border-outline-variant/20"
              src={order?.items?.[0]?.image || 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=600'}
              alt="Fresh pizza"
            />
            <div className="absolute -bottom-2 -right-1 bg-primary text-on-primary rounded-full p-2.5 border-4 border-surface shadow-md flex items-center justify-center">
              <span className="material-symbols-outlined icon-fill text-2xl font-black">check</span>
            </div>
          </div>
        </div>

        <h1 className="font-display text-3xl md:text-4xl font-extrabold text-on-surface mb-2">Order Placed Successfully!</h1>
        <p className="text-on-surface-variant text-base md:text-lg mb-6 leading-relaxed max-w-md mx-auto">Thank you for your order. Our master chef is preparing your artisanal creation.</p>
        <div className="inline-flex items-center gap-2 bg-surface border border-outline/35 px-5 py-2.5 rounded-full text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-8">
          <span className="material-symbols-outlined text-base text-primary">receipt_long</span>
          Order ID: {order?.order_number || `#${id}`}
        </div>

        {order && (
          <div className="bg-background/40 rounded-2xl p-6 text-left mb-8 border border-outline-variant/30">
            <h3 className="font-display font-bold text-sm uppercase tracking-wider mb-4 border-b border-outline-variant/20 pb-2">Order Summary</h3>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm gap-4 border-b border-outline-variant/10 pb-2 last:border-0 last:pb-0">
                  <span className="text-on-surface-variant">{item.qty} x {item.name}</span>
                  <span className="font-bold text-on-surface shrink-0">${(item.price * item.qty).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between font-bold border-t border-outline-variant/30 pt-4 mt-4">
              <span className="text-on-surface-variant font-medium text-sm">Total Paid</span>
              <span className="text-primary font-display font-black text-xl">${Number(order.total).toFixed(2)}</span>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to={`/track-order?id=${id}`} className="bg-primary hover:bg-primary-hover text-on-primary font-bold px-8 py-3.5 rounded-xl shadow-glow transition-colors uppercase text-sm tracking-wider">
            Track Order
          </Link>
          <Link to="/menu" className="bg-surface-container hover:bg-surface-container-high border border-outline-variant/40 text-on-surface font-bold px-8 py-3.5 rounded-xl transition-colors uppercase text-sm tracking-wider">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

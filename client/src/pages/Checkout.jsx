import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import { api } from '../lib/api';

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const { user, token } = useAuth();
  const { isOpen } = useStore();
  const navigate = useNavigate();
  const [address, setAddress] = useState(user?.address || '');
  const [payment, setPayment] = useState('Card');
  const [paymentDetails, setPaymentDetails] = useState({ cardNo: '', expiry: '', cvc: '', cardName: '', upiId: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const deliveryFee = 3.99;
  const tax = +(subtotal * 0.08).toFixed(2);
  const total = +(subtotal + deliveryFee + tax).toFixed(2);

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const placeOrder = async (e) => {
    e.preventDefault();
    if (!isOpen) { setError('The store is currently closed. Orders cannot be placed right now.'); return; }
    if (!token) { navigate('/login', { state: { from: { pathname: '/checkout' } } }); return; }
    if (!address.trim()) { setError('Please enter a delivery address'); return; }
    setError('');
    setLoading(true);
    try {
      const { order } = await api.createOrder({ items, address, payment_method: payment, payment_details: paymentDetails }, token);
      clearCart();
      navigate(`/order-success/${order.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-10 animate-in fade-in duration-300">
      <h1 className="font-display text-4xl font-extrabold mb-8">Checkout</h1>
      <form onSubmit={placeOrder} className="grid grid-cols-1 md:grid-cols-3 gap-10">
        <div className="md:col-span-2 flex flex-col gap-6">
          {error && <div className="bg-[#2A1415]/80 text-red-200 text-sm font-semibold rounded-xl px-4 py-3.5 border border-red-900/40">{error}</div>}

          <div className="bg-surface-container rounded-xl p-6 border border-outline-variant/30">
            <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2"><span className="material-symbols-outlined text-primary">location_on</span> Delivery Address</h3>
            <textarea
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={3}
              placeholder="Street address, city, ZIP code"
              className="w-full px-4 py-3 rounded-xl border border-outline bg-background/50 text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder-on-surface-variant/40"
            />
          </div>

          <div className="bg-surface-container rounded-xl p-6 border border-outline-variant/30">
            <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2"><span className="material-symbols-outlined text-primary">payments</span> Payment Method</h3>
            <div className="flex gap-3 flex-wrap">
              {['Card', 'Cash on Delivery', 'UPI'].map((m) => (
                <button
                  type="button"
                  key={m}
                  onClick={() => setPayment(m)}
                  className={`px-5 py-2.5 rounded-full text-sm font-semibold border transition-colors ${
                    payment === m ? 'bg-primary text-on-primary border-primary shadow-glow' : 'border-outline text-on-surface-variant bg-surface hover:border-primary hover:text-primary'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            {payment === 'Card' && (
              <div className="mt-6 p-5 rounded-xl border border-outline-variant/20 bg-background/30 animate-in fade-in slide-in-from-top-2 duration-300">
                <p className="text-sm font-bold mb-4 text-on-surface uppercase tracking-wider text-xs">Enter Card Details</p>
                <div className="space-y-4">
                  <input type="text" value={paymentDetails.cardNo} onChange={(e) => setPaymentDetails({...paymentDetails, cardNo: e.target.value})} placeholder="Card Number" className="w-full px-4 py-3 rounded-xl border border-outline bg-background/50 text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder-on-surface-variant/40" />
                  <div className="flex gap-4">
                    <input type="text" value={paymentDetails.expiry} onChange={(e) => setPaymentDetails({...paymentDetails, expiry: e.target.value})} placeholder="MM/YY" className="w-1/2 px-4 py-3 rounded-xl border border-outline bg-background/50 text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder-on-surface-variant/40" />
                    <input type="text" value={paymentDetails.cvc} onChange={(e) => setPaymentDetails({...paymentDetails, cvc: e.target.value})} placeholder="CVC" className="w-1/2 px-4 py-3 rounded-xl border border-outline bg-background/50 text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder-on-surface-variant/40" />
                  </div>
                  <input type="text" value={paymentDetails.cardName} onChange={(e) => setPaymentDetails({...paymentDetails, cardName: e.target.value})} placeholder="Name on Card" className="w-full px-4 py-3 rounded-xl border border-outline bg-background/50 text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder-on-surface-variant/40" />
                </div>
              </div>
            )}

            {payment === 'Cash on Delivery' && (
              <div className="mt-6 p-5 rounded-xl border border-outline-variant/20 bg-background/30 flex gap-3 items-start animate-in fade-in slide-in-from-top-2 duration-300">
                <span className="material-symbols-outlined text-primary mt-0.5">local_shipping</span>
                <p className="text-sm leading-relaxed text-on-surface-variant">
                  You can pay in cash to our delivery executive when your order arrives. Please keep exact change if possible to help our drivers!
                </p>
              </div>
            )}

            {payment === 'UPI' && (
              <div className="mt-6 p-5 rounded-xl border border-outline-variant/20 bg-background/30 animate-in fade-in slide-in-from-top-2 duration-300">
                <p className="text-sm font-bold mb-4 text-on-surface uppercase tracking-wider text-xs">Enter UPI ID</p>
                <input type="text" value={paymentDetails.upiId} onChange={(e) => setPaymentDetails({...paymentDetails, upiId: e.target.value})} placeholder="e.g. username@bank" className="w-full px-4 py-3 rounded-xl border border-outline bg-background/50 text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder-on-surface-variant/40" />
                <p className="text-xs text-on-surface-variant mt-3 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-primary">info</span> A payment request will be sent to your UPI app.
                </p>
              </div>
            )}
          </div>

          <div className="bg-surface-container rounded-xl p-6 border border-outline-variant/30">
            <h3 className="font-display font-bold text-lg mb-4">Items</h3>
            <div className="flex flex-col gap-3">
              {items.map((i) => (
                <div key={i.key} className="flex justify-between text-sm py-2 border-b border-outline-variant/10 last:border-0">
                  <span className="text-on-surface-variant">{i.qty} × {i.name}</span>
                  <span className="font-semibold text-on-surface">${(i.price * i.qty).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-surface-container rounded-xl p-6 h-fit shadow-warm border border-outline-variant/30">
          <h3 className="font-display font-bold text-lg mb-5 uppercase tracking-wider text-xs border-b border-outline-variant/30 pb-3">Order Total</h3>
          <div className="flex justify-between text-sm text-on-surface-variant mb-3"><span>Subtotal</span><span className="font-semibold text-on-surface">${subtotal.toFixed(2)}</span></div>
          <div className="flex justify-between text-sm text-on-surface-variant mb-3"><span>Delivery Fee</span><span className="font-semibold text-on-surface">${deliveryFee.toFixed(2)}</span></div>
          <div className="flex justify-between text-sm text-on-surface-variant mb-5"><span>Tax</span><span className="font-semibold text-on-surface">${tax.toFixed(2)}</span></div>
          <div className="flex justify-between font-bold text-lg border-t border-outline-variant/30 pt-4 mb-6"><span>Total</span><span className="text-primary font-display font-black">${total.toFixed(2)}</span></div>

          {!isOpen ? (
            <div className="rounded-xl bg-[#2A1415] border border-red-900/50 p-5 text-center mb-4">
              <span className="material-symbols-outlined text-red-400 text-3xl block mb-2 icon-fill">store</span>
              <p className="font-bold text-red-200">Store is Currently Closed</p>
              <p className="text-xs text-red-300/80 mt-1">We're not accepting orders right now. Please check back later!</p>
            </div>
          ) : (
            <button disabled={loading} type="submit" className="w-full bg-primary hover:bg-primary-hover text-on-primary font-bold py-3.5 rounded-full shadow-glow transition-all hover:scale-[1.02] disabled:opacity-60 uppercase text-sm tracking-wider">
              {loading ? 'Placing order…' : 'Place Order'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

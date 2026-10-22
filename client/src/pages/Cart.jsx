import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';

export default function Cart() {
  const { items, updateQty, removeItem, subtotal } = useCart();
  const { isOpen } = useStore();
  const navigate = useNavigate();
  const deliveryFee = items.length ? 3.99 : 0;
  const tax = +(subtotal * 0.08).toFixed(2);
  const total = +(subtotal + deliveryFee + tax).toFixed(2);

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center animate-in fade-in duration-300">
        <div className="w-20 h-20 bg-surface-container rounded-full flex items-center justify-center mx-auto mb-6 border border-outline-variant/30">
          <span className="material-symbols-outlined text-4xl text-primary">shopping_cart</span>
        </div>
        <h1 className="font-display text-3xl font-extrabold mt-4 mb-3">Your Cart is Empty</h1>
        <p className="text-on-surface-variant mb-8 max-w-sm mx-auto leading-relaxed">It seems you haven't added any artisanal pizzas to your tray yet.</p>
        <Link to="/menu" className="bg-primary text-on-primary font-bold px-8 py-3.5 rounded-full shadow-glow hover:bg-primary-hover transition-colors inline-block uppercase text-sm tracking-wider">Browse Menu</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-10 animate-in fade-in duration-300">
      <h1 className="font-display text-4xl font-extrabold mb-8">Your Cart</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        <div className="md:col-span-2 flex flex-col gap-4">
          {items.map((item) => (
            <div key={item.key} className="flex items-center gap-4 bg-surface-container rounded-xl p-5 border border-outline-variant/30 hover:border-primary/25 transition-all">
              <img src={item.image} alt={item.name} className="w-20 h-20 rounded-lg object-cover border border-outline-variant/20" />
              <div className="flex-1">
                <h3 className="font-display font-bold text-on-surface">{item.name}</h3>
                <p className="text-sm text-on-surface-variant mt-1">${item.price.toFixed(2)} each</p>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => updateQty(item.key, item.qty - 1)} className="w-8 h-8 rounded-full bg-surface-container border border-outline-variant flex items-center justify-center font-bold hover:bg-primary/25 hover:text-primary transition-all">−</button>
                <span className="font-bold w-5 text-center">{item.qty}</span>
                <button onClick={() => updateQty(item.key, item.qty + 1)} className="w-8 h-8 rounded-full bg-surface-container border border-outline-variant flex items-center justify-center font-bold hover:bg-primary/25 hover:text-primary transition-all">+</button>
              </div>
              <span className="font-bold text-primary w-16 text-right">${(item.price * item.qty).toFixed(2)}</span>
              <button onClick={() => removeItem(item.key)} className="text-on-surface-variant hover:text-primary p-1 transition-colors">
                <span className="material-symbols-outlined">delete</span>
              </button>
            </div>
          ))}
        </div>

        <div className="bg-surface-container rounded-xl p-6 h-fit shadow-warm border border-outline-variant/30">
          <h3 className="font-display font-bold text-lg mb-5 uppercase tracking-wider text-xs border-b border-outline-variant/30 pb-3">Order Summary</h3>
          <div className="flex justify-between text-sm text-on-surface-variant mb-3">
            <span>Subtotal</span><span className="font-semibold text-on-surface">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-on-surface-variant mb-3">
            <span>Delivery Fee</span><span className="font-semibold text-on-surface">${deliveryFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-on-surface-variant mb-5">
            <span>Tax (8%)</span><span className="font-semibold text-on-surface">${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg border-t border-outline-variant/30 pt-4 mb-6">
            <span>Total</span><span className="text-primary font-display font-black">${total.toFixed(2)}</span>
          </div>
          {isOpen ? (
            <button onClick={() => navigate('/checkout')} className="w-full bg-primary hover:bg-primary-hover text-on-primary font-bold py-3.5 rounded-full shadow-glow transition-all hover:scale-[1.02] uppercase text-sm tracking-wider">
              Proceed to Checkout
            </button>
          ) : (
            <div className="rounded-xl bg-[#2A1415] border border-red-900/50 p-4 text-center">
              <span className="material-symbols-outlined text-red-400 text-2xl block mb-1 icon-fill">store</span>
              <p className="font-bold text-red-200 text-sm">Store is Currently Closed</p>
              <p className="text-xs text-red-300/80 mt-1">We're not accepting orders right now. Please check back soon!</p>
            </div>
          )}
          <Link to="/menu" className="block text-center text-sm text-primary font-bold mt-5 hover:underline uppercase tracking-wider text-xs">+ Add more items</Link>
        </div>
      </div>
    </div>
  );
}

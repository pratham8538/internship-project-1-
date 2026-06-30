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
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <span className="material-symbols-outlined text-6xl text-outline-variant">shopping_cart</span>
        <h1 className="font-display text-2xl font-bold mt-4 mb-2">Your cart is empty</h1>
        <p className="text-on-surface-variant mb-6">Looks like you haven't added any pizzas yet.</p>
        <Link to="/menu" className="bg-primary text-white font-bold px-8 py-3 rounded-full shadow-glow hover:bg-primary-hover transition-colors">Browse Menu</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-10">
      <h1 className="font-display text-3xl font-bold mb-8">Your Cart</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        <div className="md:col-span-2 flex flex-col gap-4">
          {items.map((item) => (
            <div key={item.key} className="flex items-center gap-4 bg-surface-container rounded-xl p-4 border border-outline-variant">
              <img src={item.image} alt={item.name} className="w-20 h-20 rounded-lg object-cover" />
              <div className="flex-1">
                <h3 className="font-display font-bold text-on-surface">{item.name}</h3>
                <p className="text-sm text-on-surface-variant">${item.price.toFixed(2)} each</p>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => updateQty(item.key, item.qty - 1)} className="w-8 h-8 rounded-full bg-surface-container-high font-bold hover:bg-gold/40">−</button>
                <span className="font-semibold w-5 text-center">{item.qty}</span>
                <button onClick={() => updateQty(item.key, item.qty + 1)} className="w-8 h-8 rounded-full bg-surface-container-high font-bold hover:bg-gold/40">+</button>
              </div>
              <span className="font-bold text-primary w-16 text-right">${(item.price * item.qty).toFixed(2)}</span>
              <button onClick={() => removeItem(item.key)} className="text-on-surface-variant hover:text-primary">
                <span className="material-symbols-outlined">delete</span>
              </button>
            </div>
          ))}
        </div>

        <div className="bg-surface-container rounded-xl p-6 h-fit shadow-warm border border-outline-variant">
          <h3 className="font-display font-bold text-lg mb-4">Order Summary</h3>
          <div className="flex justify-between text-sm text-on-surface-variant mb-2">
            <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-on-surface-variant mb-2">
            <span>Delivery Fee</span><span>${deliveryFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-on-surface-variant mb-4">
            <span>Tax (8%)</span><span>${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg border-t border-outline-variant pt-4 mb-6">
            <span>Total</span><span className="text-primary">${total.toFixed(2)}</span>
          </div>
          {isOpen ? (
            <button onClick={() => navigate('/checkout')} className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3.5 rounded-full shadow-glow transition-all hover:scale-[1.02]">
              Proceed to Checkout
            </button>
          ) : (
            <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-center">
              <span className="material-symbols-outlined text-red-500 text-2xl block mb-1 icon-fill">store</span>
              <p className="font-bold text-red-700 text-sm">Store is Currently Closed</p>
              <p className="text-xs text-red-600 mt-1">We're not accepting orders right now. Please check back soon!</p>
            </div>
          )}
          <Link to="/menu" className="block text-center text-sm text-primary font-semibold mt-4 hover:underline">+ Add more items</Link>
        </div>
      </div>
    </div>
  );
}

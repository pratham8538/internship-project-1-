import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../lib/api';
import { useCart } from '../context/CartContext';

const BASE_PRICE = 9.99;

export default function CustomBuilder() {
  const [toppings, setToppings] = useState([]);
  const [selected, setSelected] = useState({ Base: null, Sauce: null, Cheese: [], Topping: [] });
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();
  const { state } = useLocation();

  useEffect(() => {
    api.getToppings().then((d) => setToppings(d.toppings)).catch(() => {});
  }, []);

  const grouped = toppings.reduce((acc, t) => {
    acc[t.category] = acc[t.category] || [];
    acc[t.category].push(t);
    return acc;
  }, {});

  const toggle = (category, item, single) => {
    setSelected((prev) => {
      if (single) return { ...prev, [category]: prev[category]?.id === item.id ? null : item };
      const list = prev[category] || [];
      const exists = list.find((i) => i.id === item.id);
      return { ...prev, [category]: exists ? list.filter((i) => i.id !== item.id) : [...list, item] };
    });
  };

  const extrasTotal =
    (selected.Base?.price || 0) +
    (selected.Sauce?.price || 0) +
    (selected.Cheese || []).reduce((s, i) => s + i.price, 0) +
    (selected.Topping || []).reduce((s, i) => s + i.price, 0);

  const total = +(BASE_PRICE + extrasTotal).toFixed(2);

  const summaryNames = [
    selected.Base?.name,
    selected.Sauce?.name,
    ...(selected.Cheese || []).map((c) => c.name),
    ...(selected.Topping || []).map((c) => c.name),
  ].filter(Boolean);

  const handleAdd = () => {
    addItem({
      pizzaId: 'custom',
      name: `Custom Pizza${state?.base ? ` (${state.base.name} base)` : ''}`,
      price: total,
      image: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=600',
      customization: selected,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const Section = ({ title, category, single }) => (
    <div className="mb-8">
      <h3 className="font-display font-bold text-lg mb-4 text-on-surface uppercase tracking-wider text-xs border-b border-outline-variant/30 pb-2">{title}</h3>
      <div className="flex flex-wrap gap-3">
        {(grouped[category] || []).map((item) => {
          const isSel = single ? selected[category]?.id === item.id : (selected[category] || []).some((i) => i.id === item.id);
          return (
            <button
              key={item.id}
              onClick={() => toggle(category, item, single)}
              className={`px-4 py-2.5 rounded-full text-sm font-semibold border transition-colors flex items-center gap-2 ${
                isSel ? 'bg-primary text-on-primary border-primary shadow-glow' : 'border-outline text-on-surface-variant hover:border-primary bg-surface hover:text-primary'
              }`}
            >
              {item.name} {item.price > 0 && <span className="opacity-80">+${item.price.toFixed(2)}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-10 animate-in fade-in duration-300">
      <h1 className="font-display text-4xl font-extrabold text-on-surface mb-2">Build Your Own Pizza</h1>
      <p className="text-on-surface-variant mb-10 leading-relaxed max-w-2xl">Pick your base, sauce, cheese and toppings — crafted exactly to your preference.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        <div className="md:col-span-2">
          <Section title="1. Choose Crust" category="Base" single />
          <Section title="2. Choose Sauce" category="Sauce" single />
          <Section title="3. Choose Cheese" category="Cheese" />
          <Section title="4. Choose Toppings" category="Topping" />
        </div>

        <div className="bg-surface-container rounded-xl p-6 h-fit sticky top-24 shadow-warm border border-outline-variant/30">
          <div className="rounded-lg overflow-hidden mb-4 h-40 border border-outline-variant/20">
            <img src="https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=600" alt="Custom pizza" className="w-full h-full object-cover" />
          </div>
          <h3 className="font-display font-bold text-lg mb-3">Your Creation</h3>
          {summaryNames.length === 0 ? (
            <p className="text-sm text-on-surface-variant mb-6">Start picking ingredients to build your pizza.</p>
          ) : (
            <ul className="text-sm text-on-surface-variant mb-6 space-y-2 border-l-2 border-primary/30 pl-4 py-1">
              {summaryNames.map((n) => <li key={n} className="list-none text-on-surface">• {n}</li>)}
            </ul>
          )}
          <div className="flex items-center justify-between border-t border-outline-variant/30 pt-4 mb-6">
            <span className="font-semibold text-on-surface-variant">Total</span>
            <span className="font-display text-3xl font-black text-primary">${total.toFixed(2)}</span>
          </div>
          <button
            onClick={handleAdd}
            className="w-full bg-primary hover:bg-primary-hover text-on-primary font-bold py-3.5 rounded-full shadow-glow transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">{added ? 'check' : 'shopping_cart'}</span>
            {added ? 'Added to Cart!' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
}

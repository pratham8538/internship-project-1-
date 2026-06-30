import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { useCart } from '../context/CartContext';

export default function PizzaDetails() {
  const { id } = useParams();
  const [pizza, setPizza] = useState(null);
  const [size, setSize] = useState('Medium');
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();
  const navigate = useNavigate();

  const sizeMultiplier = { Small: 0.85, Medium: 1, Large: 1.25 };

  useEffect(() => {
    api.getPizza(id).then((d) => setPizza(d.pizza)).catch(() => {});
  }, [id]);

  if (!pizza) return <div className="text-center py-24 text-on-surface-variant">Loading pizza…</div>;

  const price = +(pizza.price * sizeMultiplier[size]).toFixed(2);

  const handleAdd = () => {
    addItem({
      pizzaId: pizza.id,
      name: `${pizza.name} (${size})`,
      price,
      image: pizza.image,
      qty,
      customization: { size },
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-20 py-10">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-on-surface-variant hover:text-primary mb-6">
        <span className="material-symbols-outlined text-base">arrow_back</span> Back
      </button>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="rounded-xl overflow-hidden shadow-warm h-72 md:h-[420px]">
          <img src={pizza.image} alt={pizza.name} className="w-full h-full object-cover" />
        </div>
        <div>
          <span className="text-xs bg-gold/40 text-on-surface px-2 py-1 rounded-full">{pizza.category}</span>
          <h1 className="font-display text-3xl font-bold text-on-surface mt-3 mb-2">{pizza.name}</h1>
          <div className="flex items-center gap-1 mb-3 text-gold">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className="material-symbols-outlined icon-fill text-base" style={{ color: i < Math.round(pizza.rating) ? '#F7D87F' : '#e5beb9' }}>star</span>
            ))}
            <span className="text-sm text-on-surface-variant ml-1">{pizza.rating}</span>
          </div>
          <p className="text-on-surface-variant text-body-lg mb-6">{pizza.description}</p>

          <div className="mb-6">
            <p className="text-sm font-semibold text-on-surface-variant mb-2">Size</p>
            <div className="flex gap-3">
              {Object.keys(sizeMultiplier).map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`px-5 py-2.5 rounded-full text-sm font-semibold border-2 transition-colors ${
                    size === s ? 'bg-primary text-white border-primary' : 'border-gold text-on-surface-variant hover:border-primary'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <p className="text-sm font-semibold text-on-surface-variant mb-2">Quantity</p>
            <div className="flex items-center gap-4">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center font-bold hover:bg-gold/40">−</button>
              <span className="font-bold text-lg w-6 text-center">{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center font-bold hover:bg-gold/40">+</button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="font-display text-3xl font-bold text-primary">${(price * qty).toFixed(2)}</span>
            <button
              onClick={handleAdd}
              className="bg-primary hover:bg-primary-hover text-white font-bold px-8 py-4 rounded-full shadow-glow transition-all hover:scale-105 flex items-center gap-2"
            >
              <span className="material-symbols-outlined">{added ? 'check' : 'shopping_cart'}</span>
              {added ? 'Added!' : 'Add to Cart'}
            </button>
          </div>

          <button onClick={() => navigate('/builder', { state: { base: pizza } })} className="mt-4 text-sm font-semibold text-primary hover:underline flex items-center gap-1">
            <span className="material-symbols-outlined text-base">tune</span> Customize this pizza
          </button>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useCart } from '../context/CartContext';

export default function Home() {
  const [pizzas, setPizzas] = useState([]);
  const navigate = useNavigate();
  const { addItem } = useCart();

  useEffect(() => {
    api.getPizzas().then((d) => setPizzas(d.pizzas.slice(0, 4))).catch(() => {});
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative w-full min-h-[560px] flex items-center overflow-hidden bg-gradient-to-br from-espresso-dark to-[#3a1515]">
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 70% 50%, #BE1A1A 0%, transparent 50%)' }} />
        <div className="w-full max-w-7xl mx-auto px-4 md:px-20 grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10 py-12 md:py-0">
          <div className="flex flex-col justify-center gap-6 max-w-xl">
            <h1 className="font-display text-cream uppercase leading-tight">
              <span className="block text-gold font-medium text-xl tracking-wider mb-2">Savor The</span>
              <span className="text-4xl md:text-5xl font-extrabold">Perfect Slice</span>
            </h1>
            <p className="text-cream/80 text-lg max-w-md">
              Handcrafted pizzas made with the finest ingredients, delivered hot to your door.
            </p>
            <div className="flex flex-wrap items-center gap-4 mt-2">
              <Link to="/menu" className="bg-gold hover:bg-gold/90 text-[#410002] font-bold px-8 py-4 rounded-full shadow-warm transition-all hover:scale-105">
                ORDER NOW
              </Link>
              <Link to="/builder" className="flex items-center gap-2 text-cream hover:text-white font-bold px-4 py-4 transition-colors">
                <span className="material-symbols-outlined icon-fill">tune</span> BUILD YOUR OWN
              </Link>
            </div>
          </div>
          <div className="relative h-[300px] md:h-[480px] flex items-center justify-center">
            <div className="absolute inset-0 bg-primary/10 rounded-full blur-3xl" />
            <img
              className="w-full h-full object-contain rounded-full z-10 drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
              src="https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=800"
              alt="Artisanal pizza"
            />
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="max-w-7xl mx-auto px-4 md:px-20 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-display text-3xl font-bold text-on-surface">Fan Favorites</h2>
          <Link to="/menu" className="text-primary font-semibold hover:underline">View Full Menu →</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pizzas.map((p) => (
            <div key={p.id} className="bg-surface-container rounded-xl overflow-hidden shadow-warm border border-outline-variant group">
              <div className="h-44 overflow-hidden cursor-pointer" onClick={() => navigate(`/pizza/${p.id}`)}>
                <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div className="p-4">
                <h3 className="font-display font-bold text-on-surface mb-1">{p.name}</h3>
                <p className="text-sm text-on-surface-variant line-clamp-2 mb-3">{p.description}</p>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-primary">${p.price.toFixed(2)}</span>
                  <button
                    onClick={() => addItem({ pizzaId: p.id, name: p.name, price: p.price, image: p.image })}
                    className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary-hover transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">add</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Why us */}
      <section className="bg-surface-container-low py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {[
            { icon: 'eco', title: 'Fresh Ingredients', desc: 'Locally-sourced produce and premium imported cheeses.' },
            { icon: 'local_fire_department', title: 'Wood-Fired Oven', desc: 'Authentic char and flavor from our 900° stone ovens.' },
            { icon: 'delivery_dining', title: 'Fast Delivery', desc: 'Hot, fresh pizza at your door in 35 minutes or less.' },
          ].map((f) => (
            <div key={f.title} className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-3xl">{f.icon}</span>
              </div>
              <h3 className="font-display font-bold text-lg">{f.title}</h3>
              <p className="text-sm text-on-surface-variant max-w-xs">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

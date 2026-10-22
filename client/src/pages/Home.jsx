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
      <section className="relative w-full min-h-[580px] flex items-center overflow-hidden bg-gradient-to-br from-espresso-dark via-[#141315] to-[#1e1c20]">
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 75% 50%, #C5A880 0%, transparent 60%)' }} />
        <div className="w-full max-w-7xl mx-auto px-4 md:px-20 grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10 py-16 md:py-0">
          <div className="flex flex-col justify-center gap-6 max-w-xl animate-in fade-in slide-in-from-left-4 duration-500">
            <h1 className="font-display uppercase leading-tight">
              <span className="block text-primary font-bold text-lg tracking-widest mb-3 uppercase">Savor The Masterpiece</span>
              <span className="text-4xl md:text-5xl font-black text-on-background">The Perfect<br /><span className="text-primary font-display font-light italic">Artisanal</span> Slice</span>
            </h1>
            <p className="text-on-surface-variant text-lg max-w-md leading-relaxed">
              Handcrafted, slow-fermented crust topped with the finest imported cheeses and organic ingredients, baked to perfection.
            </p>
            <div className="flex flex-wrap items-center gap-4 mt-2">
              <Link to="/menu" className="bg-primary hover:bg-primary-hover text-on-primary font-bold tracking-wider px-8 py-4 rounded-full shadow-glow transition-all hover:scale-105 uppercase text-sm">
                ORDER NOW
              </Link>
              <Link to="/builder" className="flex items-center gap-2 text-cream hover:text-primary font-bold px-4 py-4 transition-colors uppercase text-sm tracking-wider">
                <span className="material-symbols-outlined icon-fill text-primary">tune</span> BUILD YOUR OWN
              </Link>
            </div>
          </div>
          <div className="relative h-[320px] md:h-[480px] flex items-center justify-center animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="absolute inset-0 bg-primary/5 rounded-full blur-3xl" />
            <img
              className="w-full h-full object-contain rounded-full z-10 drop-shadow-[0_20px_50px_rgba(0,0,0,0.7)] hover:scale-105 transition-transform duration-500"
              src="https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=800"
              alt="Artisanal pizza"
            />
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="max-w-7xl mx-auto px-4 md:px-20 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="text-primary text-xs uppercase tracking-widest font-bold block mb-2">Curated Classics</span>
            <h2 className="font-display text-3xl font-bold text-on-surface">Fan Favorites</h2>
          </div>
          <Link to="/menu" className="text-primary font-bold text-sm tracking-wider uppercase hover:underline flex items-center gap-1">View Full Menu <span className="material-symbols-outlined text-sm">arrow_forward</span></Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pizzas.map((p) => (
            <div key={p.id} className="warm-card bg-surface-container rounded-xl overflow-hidden shadow-warm border border-outline-variant group">
              <div className="h-48 overflow-hidden cursor-pointer relative" onClick={() => navigate(`/pizza/${p.id}`)}>
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors z-10" />
                <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              </div>
              <div className="p-5">
                <span className="text-[10px] bg-primary/10 border border-primary/20 text-primary px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider mb-2 inline-block">{p.category}</span>
                <h3 className="font-display font-bold text-on-surface mb-1 group-hover:text-primary transition-colors cursor-pointer" onClick={() => navigate(`/pizza/${p.id}`)}>{p.name}</h3>
                <p className="text-sm text-on-surface-variant line-clamp-2 mb-4 h-10">{p.description}</p>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-primary text-lg">${p.price.toFixed(2)}</span>
                  <button
                    onClick={() => addItem({ pizzaId: p.id, name: p.name, price: p.price, image: p.image })}
                    className="w-9 h-9 rounded-full bg-primary text-on-primary flex items-center justify-center hover:bg-primary-hover transition-colors"
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
      <section className="bg-surface-container-low border-t border-b border-outline-variant/30 py-20">
        <div className="max-w-7xl mx-auto px-4 md:px-20 grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            { icon: 'eco', title: 'Fresh Ingredients', desc: 'Locally-sourced organic produce and premium imported Italian cheeses.' },
            { icon: 'local_fire_department', title: 'Wood-Fired Oven', desc: 'Authentic smoky char and airy crust from our 900° stone deck ovens.' },
            { icon: 'delivery_dining', title: 'Fast Delivery', desc: 'Hot, fresh pizza delivered securely to your door in 35 minutes or less.' },
          ].map((f) => (
            <div key={f.title} className="flex flex-col items-center gap-4 text-center p-6 bg-surface-container/50 border border-outline-variant/20 rounded-2xl hover:border-primary/25 transition-all">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                <span className="material-symbols-outlined text-primary text-3xl">{f.icon}</span>
              </div>
              <h3 className="font-display font-bold text-xl text-on-surface">{f.title}</h3>
              <p className="text-sm text-on-surface-variant max-w-xs leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

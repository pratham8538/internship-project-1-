import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';

export default function Menu() {
  const [pizzas, setPizzas] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const navigate = useNavigate();

  useEffect(() => {
    api.getCategories().then((d) => setCategories(d.categories)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category !== 'All') params.set('category', category);
    if (search) params.set('search', search);
    api.getPizzas(`?${params.toString()}`)
      .then((d) => setPizzas(d.pizzas))
      .finally(() => setLoading(false));
  }, [category, search]);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-20 py-10 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <span className="text-primary text-xs uppercase tracking-widest font-bold block mb-1">Our Collection</span>
          <h1 className="font-display text-4xl font-bold text-on-surface">Our Menu</h1>
        </div>
        <div className="relative w-full md:w-72">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">search</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search pizzas..."
            className="w-full pl-10 pr-4 py-2.5 rounded-full border border-outline bg-surface-container text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      <div className="flex gap-2 flex-wrap mb-8">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors border ${
              category === c
                ? 'bg-primary text-on-primary border-primary shadow-glow'
                : 'bg-surface-container text-on-surface-variant border-outline-variant/30 hover:bg-surface-container-high'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20 text-on-surface-variant">Loading menu…</div>
      ) : pizzas.length === 0 ? (
        <div className="text-center py-20 text-on-surface-variant">No pizzas found. Try another search.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {pizzas.map((p) => {
            const fav = isFavorite(p.id);
            return (
              <div key={p.id} className="warm-card bg-surface-container rounded-xl overflow-hidden shadow-warm border border-outline-variant group relative">
                {/* Heart wishlist button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(p);
                  }}
                  className={`absolute top-3 right-3 z-20 w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                    fav
                      ? 'bg-red-500/20 backdrop-blur-md border border-red-500/40 text-red-500 scale-110 shadow-lg'
                      : 'bg-black/50 backdrop-blur-md border border-white/10 text-white/80 hover:text-white hover:scale-110'
                  }`}
                  title={fav ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <span className={`material-symbols-outlined text-lg ${fav ? 'icon-fill' : ''}`}>favorite</span>
                </button>

                <div className="h-52 overflow-hidden cursor-pointer relative" onClick={() => navigate(`/pizza/${p.id}`)}>
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors z-10" />
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-display font-bold text-on-surface cursor-pointer hover:text-primary transition-colors text-lg" onClick={() => navigate(`/pizza/${p.id}`)}>{p.name}</h3>
                    <span className="text-[10px] bg-primary/10 border border-primary/20 text-primary px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider whitespace-nowrap">{p.category}</span>
                  </div>

                  <div className="flex items-center gap-1.5 mb-2">
                    <div className="flex items-center text-xs font-semibold text-primary">
                      <span className="material-symbols-outlined icon-fill text-sm" style={{ color: '#C5A880' }}>star</span>
                      <span className="ml-0.5">{p.rating ? Number(p.rating).toFixed(1) : '4.8'}</span>
                    </div>
                    <span className="text-xs text-on-surface-variant/60">• Artisanal</span>
                  </div>

                  <p className="text-sm text-on-surface-variant line-clamp-2 my-2 h-10">{p.description}</p>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-outline-variant/20">
                    <span className="font-bold text-primary text-lg">${p.price.toFixed(2)}</span>
                    <button
                      onClick={() => addItem({ pizzaId: p.id, name: p.name, price: p.price, image: p.image })}
                      className="w-9 h-9 rounded-full bg-primary text-on-primary flex items-center justify-center hover:bg-primary-hover transition-colors shadow-glow"
                      title="Add to cart"
                    >
                      <span className="material-symbols-outlined text-lg">add</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

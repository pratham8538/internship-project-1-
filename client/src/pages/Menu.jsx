import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useCart } from '../context/CartContext';

export default function Menu() {
  const [pizzas, setPizzas] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();
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
    <div className="max-w-7xl mx-auto px-4 md:px-20 py-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-on-surface mb-1">Our Menu</h1>
          <p className="text-on-surface-variant">Handcrafted pizzas, made fresh to order.</p>
        </div>
        <div className="relative w-full md:w-72">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">search</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search pizzas..."
            className="w-full pl-10 pr-4 py-2.5 rounded-full border border-gold bg-background focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      <div className="flex gap-2 flex-wrap mb-8">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${
              category === c ? 'bg-primary text-white' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
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
          {pizzas.map((p) => (
            <div key={p.id} className="bg-surface-container rounded-xl overflow-hidden shadow-warm border border-outline-variant group">
              <div className="h-48 overflow-hidden cursor-pointer" onClick={() => navigate(`/pizza/${p.id}`)}>
                <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-display font-bold text-on-surface cursor-pointer hover:text-primary" onClick={() => navigate(`/pizza/${p.id}`)}>{p.name}</h3>
                  <span className="text-xs bg-gold/40 text-on-surface px-2 py-0.5 rounded-full whitespace-nowrap">{p.category}</span>
                </div>
                <p className="text-sm text-on-surface-variant line-clamp-2 my-2">{p.description}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="font-bold text-primary text-lg">${p.price.toFixed(2)}</span>
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
      )}
    </div>
  );
}

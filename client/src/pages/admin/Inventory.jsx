import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';

const emptyPizza = { name: '', description: '', price: '', category: 'Classic', image: '', stock: 50 };
const emptyTopping = { name: '', category: 'Topping', price: '', stock: 100 };

export default function Inventory() {
  const { token } = useAuth();
  const [pizzas, setPizzas] = useState([]);
  const [toppings, setToppings] = useState([]);
  const [tab, setTab] = useState('pizzas');
  
  const [pizzaForm, setPizzaForm] = useState(emptyPizza);
  const [editingPizzaId, setEditingPizzaId] = useState(null);
  const [showPizzaModal, setShowPizzaModal] = useState(false);

  const [toppingForm, setToppingForm] = useState(emptyTopping);
  const [editingToppingId, setEditingToppingId] = useState(null);
  const [showToppingModal, setShowToppingModal] = useState(false);

  const loadPizzas = () => api.adminPizzas(token).then((d) => setPizzas(d.pizzas));
  const loadToppings = () => api.adminToppings(token).then((d) => setToppings(d.toppings));

  useEffect(() => { loadPizzas(); loadToppings(); // eslint-disable-next-line
  }, [token]);

  // Pizza Actions
  const submitPizza = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...pizzaForm, price: parseFloat(pizzaForm.price), stock: parseInt(pizzaForm.stock, 10) };
      if (editingPizzaId) await api.adminUpdatePizza(editingPizzaId, payload, token);
      else await api.adminCreatePizza(payload, token);
      setPizzaForm(emptyPizza);
      setEditingPizzaId(null);
      setShowPizzaModal(false);
      loadPizzas();
    } catch (err) {
      alert(err.message || 'Failed to save pizza');
    }
  };
  const editPizza = (p) => {
    setPizzaForm({ name: p.name, description: p.description, price: p.price, category: p.category, image: p.image, stock: p.stock });
    setEditingPizzaId(p.id);
    setShowPizzaModal(true);
  };
  const removePizza = async (id) => {
    if (!confirm('Delete this pizza from the menu?')) return;
    await api.adminDeletePizza(id, token);
    loadPizzas();
  };

  // Topping Actions
  const submitTopping = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...toppingForm, price: parseFloat(toppingForm.price), stock: parseInt(toppingForm.stock, 10) };
      if (editingToppingId) await api.adminUpdateTopping(editingToppingId, payload, token);
      else await api.adminCreateTopping(payload, token);
      setToppingForm(emptyTopping);
      setEditingToppingId(null);
      setShowToppingModal(false);
      loadToppings();
    } catch (err) {
      alert(err.message || 'Failed to save topping');
    }
  };
  const editTopping = (t) => {
    setToppingForm({ name: t.name, category: t.category, price: t.price, stock: t.stock });
    setEditingToppingId(t.id);
    setShowToppingModal(true);
  };
  const removeTopping = async (id) => {
    if (!confirm('Delete this topping?')) return;
    await api.adminDeleteTopping(id, token);
    loadToppings();
  };

  return (
    <AdminLayout title="Inventory Management">
      <div className="flex gap-2 mb-6">
        <button onClick={() => setTab('pizzas')} className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${tab === 'pizzas' ? 'bg-primary text-white shadow-glow' : 'bg-background border border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary'}`}>Pizzas</button>
        <button onClick={() => setTab('toppings')} className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${tab === 'toppings' ? 'bg-primary text-white shadow-glow' : 'bg-background border border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary'}`}>Toppings & Ingredients</button>
      </div>

      {/* PIZZAS TAB */}
      {tab === 'pizzas' && (
        <>
          <div className="flex justify-end mb-4">
            <button onClick={() => { setPizzaForm(emptyPizza); setEditingPizzaId(null); setShowPizzaModal(true); }} className="bg-primary hover:bg-primary-hover text-white font-bold px-5 py-2.5 rounded-full shadow-glow flex items-center gap-2 transition-transform hover:scale-[1.02]">
              <span className="material-symbols-outlined text-lg">add</span> Add Pizza
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {pizzas.map((p) => (
              <div key={p.id} className="bg-surface-container rounded-xl overflow-hidden border border-outline-variant shadow-sm hover:shadow-md transition-shadow group relative flex flex-col">
                <div className="h-40 overflow-hidden relative">
                  {p.image ? (
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full bg-surface-container-high flex items-center justify-center text-on-surface-variant"><span className="material-symbols-outlined text-4xl">local_pizza</span></div>
                  )}
                  <div className="absolute top-2 right-2 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-bold text-primary">${p.price.toFixed(2)}</div>
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-display font-bold text-lg mb-1">{p.name}</h3>
                  <p className="text-xs text-on-surface-variant line-clamp-2 mb-3 flex-1">{p.description}</p>
                  <div className="flex justify-between items-center mt-auto pt-3 border-t border-outline-variant">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-md ${p.stock < 20 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>{p.stock} in stock</span>
                    <div className="flex gap-2">
                      <button onClick={() => editPizza(p)} className="p-1.5 rounded-full text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors"><span className="material-symbols-outlined text-[18px]">edit</span></button>
                      <button onClick={() => removePizza(p.id)} className="p-1.5 rounded-full text-on-surface-variant hover:text-red-500 hover:bg-red-50 transition-colors"><span className="material-symbols-outlined text-[18px]">delete</span></button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* TOPPINGS TAB */}
      {tab === 'toppings' && (
        <>
          <div className="flex justify-end mb-4">
            <button onClick={() => { setToppingForm(emptyTopping); setEditingToppingId(null); setShowToppingModal(true); }} className="bg-primary hover:bg-primary-hover text-white font-bold px-5 py-2.5 rounded-full shadow-glow flex items-center gap-2 transition-transform hover:scale-[1.02]">
              <span className="material-symbols-outlined text-lg">add</span> Add Topping
            </button>
          </div>
          <div className="bg-background border border-outline-variant rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-surface-container-high">
                <tr className="text-left text-on-surface-variant">
                  <th className="py-3 px-6 font-semibold">Ingredient</th><th className="font-semibold">Category</th><th className="font-semibold">Price</th><th className="font-semibold">Stock</th><th className="text-right px-6 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {toppings.map((t) => (
                  <tr key={t.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="py-3 px-6 font-semibold">{t.name}</td>
                    <td><span className="px-2.5 py-1 bg-surface-container-high text-xs rounded-full">{t.category}</span></td>
                    <td className="font-semibold text-primary">${t.price.toFixed(2)}</td>
                    <td>
                      <span className={`text-xs font-semibold px-2 py-1 rounded-md ${t.stock < 20 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>{t.stock}</span>
                    </td>
                    <td className="text-right px-6">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => editTopping(t)} className="p-1.5 rounded-md text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-colors"><span className="material-symbols-outlined text-[18px]">edit</span></button>
                        <button onClick={() => removeTopping(t.id)} className="p-1.5 rounded-md text-on-surface-variant hover:text-red-500 hover:bg-red-50 transition-colors"><span className="material-symbols-outlined text-[18px]">delete</span></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* PIZZA MODAL */}
      {showPizzaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-background rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
              <h2 className="font-display font-bold text-xl">{editingPizzaId ? 'Edit Pizza' : 'Add New Pizza'}</h2>
              <button onClick={() => setShowPizzaModal(false)} className="text-on-surface-variant hover:text-primary rounded-full p-1"><span className="material-symbols-outlined">close</span></button>
            </div>
            <form onSubmit={submitPizza} className="p-6">
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-5">
                  <div className="col-span-2 sm:col-span-1 space-y-1.5">
                    <label className="text-sm font-semibold text-on-surface-variant">Pizza Name</label>
                    <input required value={pizzaForm.name} onChange={(e) => setPizzaForm({ ...pizzaForm, name: e.target.value })} className="w-full px-4 py-2.5 rounded-md border border-gold bg-background focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50" placeholder="e.g. Margherita" />
                  </div>
                  <div className="col-span-2 sm:col-span-1 space-y-1.5">
                    <label className="text-sm font-semibold text-on-surface-variant">Category</label>
                    <select value={pizzaForm.category} onChange={(e) => setPizzaForm({ ...pizzaForm, category: e.target.value })} className="w-full px-4 py-2.5 rounded-md border border-gold bg-background focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50">
                      {['Classic', 'Specialty', 'Vegetarian', 'Premium', 'Spicy'].map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-on-surface-variant">Description</label>
                  <textarea required value={pizzaForm.description} onChange={(e) => setPizzaForm({ ...pizzaForm, description: e.target.value })} className="w-full px-4 py-2.5 rounded-md border border-gold bg-background focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50" rows={2} placeholder="Ingredients and details..." />
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-on-surface-variant">Price ($)</label>
                    <input required type="number" step="0.01" value={pizzaForm.price} onChange={(e) => setPizzaForm({ ...pizzaForm, price: e.target.value })} className="w-full px-4 py-2.5 rounded-md border border-gold bg-background focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-on-surface-variant">Initial Stock</label>
                    <input required type="number" value={pizzaForm.stock} onChange={(e) => setPizzaForm({ ...pizzaForm, stock: e.target.value })} className="w-full px-4 py-2.5 rounded-md border border-gold bg-background focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-on-surface-variant">Image URL</label>
                  <input value={pizzaForm.image} onChange={(e) => setPizzaForm({ ...pizzaForm, image: e.target.value })} className="w-full px-4 py-2.5 rounded-md border border-gold bg-background focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50" placeholder="https://..." />
                  {pizzaForm.image && (
                    <div className="mt-3 relative h-32 rounded-md overflow-hidden border border-outline-variant bg-surface-container">
                      <img src={pizzaForm.image} alt="Preview" className="w-full h-full object-cover" onError={(e) => e.target.style.display = 'none'} />
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-outline-variant">
                <button type="button" onClick={() => setShowPizzaModal(false)} className="px-5 py-2.5 rounded-full font-semibold text-on-surface-variant hover:bg-surface-container-high transition-colors">Cancel</button>
                <button type="submit" className="px-6 py-2.5 bg-primary text-white font-bold rounded-full hover:bg-primary-hover shadow-glow transition-all hover:scale-[1.02]">{editingPizzaId ? 'Save Changes' : 'Create Pizza'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TOPPING MODAL */}
      {showToppingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-background rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
              <h2 className="font-display font-bold text-xl">{editingToppingId ? 'Edit Topping' : 'Add New Topping'}</h2>
              <button onClick={() => setShowToppingModal(false)} className="text-on-surface-variant hover:text-primary rounded-full p-1"><span className="material-symbols-outlined">close</span></button>
            </div>
            <form onSubmit={submitTopping} className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-on-surface-variant">Name</label>
                <input required value={toppingForm.name} onChange={(e) => setToppingForm({ ...toppingForm, name: e.target.value })} className="w-full px-4 py-2.5 rounded-md border border-gold bg-background focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50" placeholder="e.g. Extra Cheese" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-on-surface-variant">Category</label>
                <select value={toppingForm.category} onChange={(e) => setToppingForm({ ...toppingForm, category: e.target.value })} className="w-full px-4 py-2.5 rounded-md border border-gold bg-background focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50">
                  {['Base', 'Sauce', 'Cheese', 'Topping'].map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-on-surface-variant">Price ($)</label>
                  <input required type="number" step="0.01" value={toppingForm.price} onChange={(e) => setToppingForm({ ...toppingForm, price: e.target.value })} className="w-full px-4 py-2.5 rounded-md border border-gold bg-background focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-on-surface-variant">Stock</label>
                  <input required type="number" value={toppingForm.stock} onChange={(e) => setToppingForm({ ...toppingForm, stock: e.target.value })} className="w-full px-4 py-2.5 rounded-md border border-gold bg-background focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50" />
                </div>
              </div>
              <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-outline-variant">
                <button type="button" onClick={() => setShowToppingModal(false)} className="px-5 py-2.5 rounded-full font-semibold text-on-surface-variant hover:bg-surface-container-high transition-colors">Cancel</button>
                <button type="submit" className="px-6 py-2.5 bg-primary text-white font-bold rounded-full hover:bg-primary-hover shadow-glow transition-all hover:scale-[1.02]">{editingToppingId ? 'Save' : 'Add Topping'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

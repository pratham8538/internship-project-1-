import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../lib/api';
import { useCart } from '../context/CartContext';

const BASE_PRICE = 9.99;

export default function CustomBuilder() {
  const [toppings, setToppings] = useState([]);
  const [mode, setMode] = useState('whole'); // 'whole' or 'split'
  const [activeSide, setActiveSide] = useState('left'); // 'left' or 'right'

  // Whole pizza state
  const [selectedWhole, setSelectedWhole] = useState({ Base: null, Sauce: null, Cheese: [], Topping: [] });

  // Half & Half split pizza state
  const [sharedCrust, setSharedCrust] = useState(null);
  const [leftHalf, setLeftHalf] = useState({ Sauce: null, Cheese: [], Topping: [] });
  const [rightHalf, setRightHalf] = useState({ Sauce: null, Cheese: [], Topping: [] });

  const [added, setAdded] = useState(false);
  const { addItem } = useCart();
  const { state } = useLocation();

  useEffect(() => {
    api.getToppings().then((d) => {
      setToppings(d.toppings || []);
      // Set default crust if available
      const defaultCrust = (d.toppings || []).find((t) => t.category === 'Base');
      if (defaultCrust) {
        setSelectedWhole((prev) => ({ ...prev, Base: defaultCrust }));
        setSharedCrust(defaultCrust);
      }
    }).catch(() => {});
  }, []);

  const grouped = toppings.reduce((acc, t) => {
    acc[t.category] = acc[t.category] || [];
    acc[t.category].push(t);
    return acc;
  }, {});

  // Toggle for whole pizza
  const toggleWhole = (category, item, single) => {
    setSelectedWhole((prev) => {
      if (single) return { ...prev, [category]: prev[category]?.id === item.id ? null : item };
      const list = prev[category] || [];
      const exists = list.find((i) => i.id === item.id);
      return { ...prev, [category]: exists ? list.filter((i) => i.id !== item.id) : [...list, item] };
    });
  };

  // Toggle for half & half pizza
  const toggleHalf = (side, category, item, single) => {
    const setter = side === 'left' ? setLeftHalf : setRightHalf;
    setter((prev) => {
      if (single) return { ...prev, [category]: prev[category]?.id === item.id ? null : item };
      const list = prev[category] || [];
      const exists = list.find((i) => i.id === item.id);
      return { ...prev, [category]: exists ? list.filter((i) => i.id !== item.id) : [...list, item] };
    });
  };

  // Copy Left Half to Right Half
  const copyLeftToRight = () => {
    setRightHalf({
      Sauce: leftHalf.Sauce,
      Cheese: [...leftHalf.Cheese],
      Topping: [...leftHalf.Topping],
    });
    setActiveSide('right');
  };

  // Calculations
  const wholeExtras =
    (selectedWhole.Base?.price || 0) +
    (selectedWhole.Sauce?.price || 0) +
    (selectedWhole.Cheese || []).reduce((s, i) => s + i.price, 0) +
    (selectedWhole.Topping || []).reduce((s, i) => s + i.price, 0);

  const wholeTotal = +(BASE_PRICE + wholeExtras).toFixed(2);

  const leftExtras =
    (leftHalf.Sauce?.price || 0) * 0.5 +
    (leftHalf.Cheese || []).reduce((s, i) => s + i.price, 0) * 0.5 +
    (leftHalf.Topping || []).reduce((s, i) => s + i.price, 0) * 0.5;

  const rightExtras =
    (rightHalf.Sauce?.price || 0) * 0.5 +
    (rightHalf.Cheese || []).reduce((s, i) => s + i.price, 0) * 0.5 +
    (rightHalf.Topping || []).reduce((s, i) => s + i.price, 0) * 0.5;

  const splitTotal = +(BASE_PRICE + (sharedCrust?.price || 0) + leftExtras + rightExtras).toFixed(2);

  const currentTotal = mode === 'whole' ? wholeTotal : splitTotal;

  const handleAdd = () => {
    if (mode === 'whole') {
      addItem({
        pizzaId: 'custom-whole',
        name: `Custom Pizza${state?.base ? ` (${state.base.name} base)` : ''}`,
        price: wholeTotal,
        image: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=600',
        customization: {
          isHalfAndHalf: false,
          crust: selectedWhole.Base?.name || 'Classic Crust',
          sauce: selectedWhole.Sauce?.name || 'Standard Sauce',
          cheese: (selectedWhole.Cheese || []).map((c) => c.name),
          toppings: (selectedWhole.Topping || []).map((t) => t.name),
        },
      });
    } else {
      const leftSummary = [leftHalf.Sauce?.name, ...leftHalf.Cheese.map(c => c.name), ...leftHalf.Topping.map(t => t.name)].filter(Boolean).join(', ') || 'Cheese';
      const rightSummary = [rightHalf.Sauce?.name, ...rightHalf.Cheese.map(c => c.name), ...rightHalf.Topping.map(t => t.name)].filter(Boolean).join(', ') || 'Cheese';

      addItem({
        pizzaId: 'custom-half-half',
        name: `Half & Half Split Pizza`,
        price: splitTotal,
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600',
        customization: {
          isHalfAndHalf: true,
          crust: sharedCrust?.name || 'Classic Crust',
          left: {
            title: 'Left Half',
            sauce: leftHalf.Sauce?.name || 'None',
            cheese: leftHalf.Cheese.map((c) => c.name),
            toppings: leftHalf.Topping.map((t) => t.name),
            summary: leftSummary,
          },
          right: {
            title: 'Right Half',
            sauce: rightHalf.Sauce?.name || 'None',
            cheese: rightHalf.Cheese.map((c) => c.name),
            toppings: rightHalf.Topping.map((t) => t.name),
            summary: rightSummary,
          },
        },
      });
    }

    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const currentHalfState = activeSide === 'left' ? leftHalf : rightHalf;

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-10 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <span className="text-primary text-xs uppercase tracking-widest font-bold block mb-1">Artisanal Workshop</span>
          <h1 className="font-display text-4xl font-extrabold text-on-surface">Build Your Own Pizza</h1>
          <p className="text-on-surface-variant text-sm mt-1">Pick every crust, sauce, cheese and topping to your exact taste.</p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="bg-surface-container rounded-full p-1.5 border border-outline-variant/40 flex items-center shadow-warm w-fit">
          <button
            type="button"
            onClick={() => setMode('whole')}
            className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
              mode === 'whole'
                ? 'bg-primary text-on-primary shadow-glow scale-102'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-base">local_pizza</span> Whole Pizza
          </button>
          <button
            type="button"
            onClick={() => setMode('split')}
            className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
              mode === 'split'
                ? 'bg-primary text-on-primary shadow-glow scale-102'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-base">pie_chart</span> Half & Half (Split)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* INGREDIENTS SELECTION COLUMN */}
        <div className="lg:col-span-2">
          {/* WHOLE PIZZA MODE */}
          {mode === 'whole' && (
            <div className="animate-in fade-in duration-300 space-y-8">
              {/* Crust */}
              <div>
                <h3 className="font-display font-bold text-xs uppercase tracking-widest text-primary border-b border-outline-variant/30 pb-2 mb-4">
                  1. Choose Crust
                </h3>
                <div className="flex flex-wrap gap-2.5">
                  {(grouped['Base'] || []).map((item) => {
                    const isSel = selectedWhole.Base?.id === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggleWhole('Base', item, true)}
                        className={`px-4 py-2.5 rounded-full text-sm font-semibold border transition-all ${
                          isSel ? 'bg-primary text-on-primary border-primary shadow-glow' : 'border-outline text-on-surface-variant hover:border-primary bg-surface hover:text-primary'
                        }`}
                      >
                        {item.name} {item.price > 0 && <span className="opacity-80">+${item.price.toFixed(2)}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sauce */}
              <div>
                <h3 className="font-display font-bold text-xs uppercase tracking-widest text-primary border-b border-outline-variant/30 pb-2 mb-4">
                  2. Choose Sauce
                </h3>
                <div className="flex flex-wrap gap-2.5">
                  {(grouped['Sauce'] || []).map((item) => {
                    const isSel = selectedWhole.Sauce?.id === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggleWhole('Sauce', item, true)}
                        className={`px-4 py-2.5 rounded-full text-sm font-semibold border transition-all ${
                          isSel ? 'bg-primary text-on-primary border-primary shadow-glow' : 'border-outline text-on-surface-variant hover:border-primary bg-surface hover:text-primary'
                        }`}
                      >
                        {item.name} {item.price > 0 && <span className="opacity-80">+${item.price.toFixed(2)}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Cheese */}
              <div>
                <h3 className="font-display font-bold text-xs uppercase tracking-widest text-primary border-b border-outline-variant/30 pb-2 mb-4">
                  3. Choose Cheeses (Select Multiple)
                </h3>
                <div className="flex flex-wrap gap-2.5">
                  {(grouped['Cheese'] || []).map((item) => {
                    const isSel = (selectedWhole.Cheese || []).some((c) => c.id === item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggleWhole('Cheese', item, false)}
                        className={`px-4 py-2.5 rounded-full text-sm font-semibold border transition-all ${
                          isSel ? 'bg-primary text-on-primary border-primary shadow-glow' : 'border-outline text-on-surface-variant hover:border-primary bg-surface hover:text-primary'
                        }`}
                      >
                        {item.name} {item.price > 0 && <span className="opacity-80">+${item.price.toFixed(2)}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Toppings */}
              <div>
                <h3 className="font-display font-bold text-xs uppercase tracking-widest text-primary border-b border-outline-variant/30 pb-2 mb-4">
                  4. Choose Toppings (Select Multiple)
                </h3>
                <div className="flex flex-wrap gap-2.5">
                  {(grouped['Topping'] || []).map((item) => {
                    const isSel = (selectedWhole.Topping || []).some((t) => t.id === item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggleWhole('Topping', item, false)}
                        className={`px-4 py-2.5 rounded-full text-sm font-semibold border transition-all ${
                          isSel ? 'bg-primary text-on-primary border-primary shadow-glow' : 'border-outline text-on-surface-variant hover:border-primary bg-surface hover:text-primary'
                        }`}
                      >
                        {item.name} {item.price > 0 && <span className="opacity-80">+${item.price.toFixed(2)}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* HALF & HALF (SPLIT PIZZA) MODE */}
          {mode === 'split' && (
            <div className="animate-in fade-in duration-300 space-y-8">
              {/* Step 1: Base Crust for Whole Pizza */}
              <div className="bg-surface-container rounded-2xl p-5 border border-outline-variant/30">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-display font-bold text-xs uppercase tracking-widest text-primary">
                    Step 1: Shared Crust for Whole Pie
                  </h3>
                  <span className="text-[11px] text-on-surface-variant">Applies to both sides</span>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {(grouped['Base'] || []).map((item) => {
                    const isSel = sharedCrust?.id === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSharedCrust(item)}
                        className={`px-4 py-2.5 rounded-full text-sm font-semibold border transition-all ${
                          isSel ? 'bg-primary text-on-primary border-primary shadow-glow' : 'border-outline text-on-surface-variant hover:border-primary bg-surface hover:text-primary'
                        }`}
                      >
                        {item.name} {item.price > 0 && <span className="opacity-80">+${item.price.toFixed(2)}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Choose which half to customize */}
              <div className="bg-surface-container-high rounded-2xl p-4 border border-outline-variant/30">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase tracking-wider font-bold text-on-surface">Now Customizing:</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      activeSide === 'left' ? 'bg-primary text-on-primary' : 'bg-amber-600 text-white'
                    }`}>
                      {activeSide === 'left' ? '🍕 Left Half' : '🍕 Right Half'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveSide('left')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                        activeSide === 'left'
                          ? 'bg-primary text-on-primary border-primary shadow-glow'
                          : 'bg-surface-container border-outline-variant text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      Left Half (Side 1)
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSide('right')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                        activeSide === 'right'
                          ? 'bg-amber-600 text-white border-amber-600 shadow-glow'
                          : 'bg-surface-container border-outline-variant text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      Right Half (Side 2)
                    </button>
                    {activeSide === 'left' && (
                      <button
                        type="button"
                        onClick={copyLeftToRight}
                        title="Duplicate Left Half ingredients onto Right Half"
                        className="text-[11px] font-bold text-primary hover:underline px-2 py-1"
                      >
                        Copy to Right →
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Active Side Sauce */}
              <div>
                <div className="flex items-center justify-between border-b border-outline-variant/30 pb-2 mb-4">
                  <h3 className="font-display font-bold text-xs uppercase tracking-widest text-primary">
                    Sauce for {activeSide === 'left' ? 'Left Half' : 'Right Half'}
                  </h3>
                  <span className="text-xs text-on-surface-variant/70">Half-price per side (+50%)</span>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {(grouped['Sauce'] || []).map((item) => {
                    const isSel = currentHalfState.Sauce?.id === item.id;
                    const halfPrice = item.price * 0.5;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggleHalf(activeSide, 'Sauce', item, true)}
                        className={`px-4 py-2.5 rounded-full text-sm font-semibold border transition-all ${
                          isSel ? 'bg-primary text-on-primary border-primary shadow-glow' : 'border-outline text-on-surface-variant hover:border-primary bg-surface hover:text-primary'
                        }`}
                      >
                        {item.name} {halfPrice > 0 && <span className="opacity-80">+${halfPrice.toFixed(2)}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Side Cheese */}
              <div>
                <div className="flex items-center justify-between border-b border-outline-variant/30 pb-2 mb-4">
                  <h3 className="font-display font-bold text-xs uppercase tracking-widest text-primary">
                    Cheeses for {activeSide === 'left' ? 'Left Half' : 'Right Half'}
                  </h3>
                  <span className="text-xs text-on-surface-variant/70">Select multiple (Half-price per side)</span>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {(grouped['Cheese'] || []).map((item) => {
                    const isSel = (currentHalfState.Cheese || []).some((c) => c.id === item.id);
                    const halfPrice = item.price * 0.5;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggleHalf(activeSide, 'Cheese', item, false)}
                        className={`px-4 py-2.5 rounded-full text-sm font-semibold border transition-all ${
                          isSel ? 'bg-primary text-on-primary border-primary shadow-glow' : 'border-outline text-on-surface-variant hover:border-primary bg-surface hover:text-primary'
                        }`}
                      >
                        {item.name} {halfPrice > 0 && <span className="opacity-80">+${halfPrice.toFixed(2)}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Side Toppings */}
              <div>
                <div className="flex items-center justify-between border-b border-outline-variant/30 pb-2 mb-4">
                  <h3 className="font-display font-bold text-xs uppercase tracking-widest text-primary">
                    Toppings for {activeSide === 'left' ? 'Left Half' : 'Right Half'}
                  </h3>
                  <span className="text-xs text-on-surface-variant/70">Select multiple (Half-price per side)</span>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {(grouped['Topping'] || []).map((item) => {
                    const isSel = (currentHalfState.Topping || []).some((t) => t.id === item.id);
                    const halfPrice = item.price * 0.5;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggleHalf(activeSide, 'Topping', item, false)}
                        className={`px-4 py-2.5 rounded-full text-sm font-semibold border transition-all ${
                          isSel ? 'bg-primary text-on-primary border-primary shadow-glow' : 'border-outline text-on-surface-variant hover:border-primary bg-surface hover:text-primary'
                        }`}
                      >
                        {item.name} {halfPrice > 0 && <span className="opacity-80">+${halfPrice.toFixed(2)}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ORDER SUMMARY & SPLIT PREVIEW CARD */}
        <div className="bg-surface-container rounded-2xl p-6 h-fit sticky top-24 shadow-warm border border-outline-variant/30 flex flex-col justify-between">
          <div>
            {/* Visual Split Representation */}
            {mode === 'split' ? (
              <div className="mb-6">
                <div className="relative w-48 h-48 mx-auto rounded-full overflow-hidden border-4 border-primary/40 shadow-glow flex cursor-pointer group">
                  {/* Left Half Click Area */}
                  <div
                    onClick={() => setActiveSide('left')}
                    className={`w-1/2 h-full flex flex-col items-center justify-center p-2 text-center transition-all ${
                      activeSide === 'left'
                        ? 'bg-primary/25 border-r-2 border-dashed border-white'
                        : 'bg-black/30 border-r-2 border-dashed border-white/40 hover:bg-black/20'
                    }`}
                  >
                    <span className="text-xs font-bold text-on-surface block uppercase">Left</span>
                    <span className="text-[10px] text-primary font-semibold mt-1">
                      {1 + (leftHalf.Cheese?.length || 0) + (leftHalf.Topping?.length || 0)} items
                    </span>
                    {activeSide === 'left' && (
                      <span className="mt-1 text-[9px] bg-primary text-on-primary px-1.5 py-0.5 rounded-full font-bold">ACTIVE</span>
                    )}
                  </div>

                  {/* Right Half Click Area */}
                  <div
                    onClick={() => setActiveSide('right')}
                    className={`w-1/2 h-full flex flex-col items-center justify-center p-2 text-center transition-all ${
                      activeSide === 'right'
                        ? 'bg-amber-600/30'
                        : 'bg-black/30 hover:bg-black/20'
                    }`}
                  >
                    <span className="text-xs font-bold text-on-surface block uppercase">Right</span>
                    <span className="text-[10px] text-amber-400 font-semibold mt-1">
                      {1 + (rightHalf.Cheese?.length || 0) + (rightHalf.Topping?.length || 0)} items
                    </span>
                    {activeSide === 'right' && (
                      <span className="mt-1 text-[9px] bg-amber-600 text-white px-1.5 py-0.5 rounded-full font-bold">ACTIVE</span>
                    )}
                  </div>
                </div>
                <p className="text-[11px] text-center text-on-surface-variant mt-2">Click either half to switch active side</p>
              </div>
            ) : (
              <div className="rounded-xl overflow-hidden mb-6 h-40 border border-outline-variant/20 shadow-inner">
                <img src="https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=600" alt="Custom pizza" className="w-full h-full object-cover" />
              </div>
            )}

            <h3 className="font-display font-bold text-lg text-on-surface mb-3 flex items-center justify-between">
              <span>Your Creation</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                {mode === 'split' ? 'Half & Half' : 'Single Style'}
              </span>
            </h3>

            {/* Customization Details List */}
            {mode === 'whole' ? (
              <div className="text-xs text-on-surface-variant mb-6 space-y-1.5 border-l-2 border-primary/40 pl-3 py-1">
                <p><strong className="text-on-surface">Crust:</strong> {selectedWhole.Base?.name || 'Classic Crust'}</p>
                <p><strong className="text-on-surface">Sauce:</strong> {selectedWhole.Sauce?.name || 'Tomato Sauce'}</p>
                <p><strong className="text-on-surface">Cheese:</strong> {selectedWhole.Cheese.map(c => c.name).join(', ') || 'Standard Mozzarella'}</p>
                <p><strong className="text-on-surface">Toppings:</strong> {selectedWhole.Topping.map(t => t.name).join(', ') || 'No extra toppings'}</p>
              </div>
            ) : (
              <div className="text-xs text-on-surface-variant mb-6 space-y-3">
                <div className="p-2.5 rounded-xl bg-surface-container-high border border-outline-variant/30">
                  <p className="font-bold text-on-surface text-[11px] uppercase tracking-wider mb-1">Shared Crust</p>
                  <p className="text-primary font-semibold">{sharedCrust?.name || 'Classic Crust'}</p>
                </div>

                <div className={`p-2.5 rounded-xl border transition-colors ${activeSide === 'left' ? 'bg-primary/10 border-primary/40' : 'bg-surface-container-high border-outline-variant/20'}`}>
                  <p className="font-bold text-primary text-[11px] uppercase tracking-wider mb-1">Left Half</p>
                  <p className="text-on-surface"><strong>Sauce:</strong> {leftHalf.Sauce?.name || 'None'}</p>
                  <p className="text-on-surface"><strong>Cheese:</strong> {leftHalf.Cheese.map(c => c.name).join(', ') || 'None'}</p>
                  <p className="text-on-surface"><strong>Toppings:</strong> {leftHalf.Topping.map(t => t.name).join(', ') || 'None'}</p>
                </div>

                <div className={`p-2.5 rounded-xl border transition-colors ${activeSide === 'right' ? 'bg-amber-600/10 border-amber-600/40' : 'bg-surface-container-high border-outline-variant/20'}`}>
                  <p className="font-bold text-amber-400 text-[11px] uppercase tracking-wider mb-1">Right Half</p>
                  <p className="text-on-surface"><strong>Sauce:</strong> {rightHalf.Sauce?.name || 'None'}</p>
                  <p className="text-on-surface"><strong>Cheese:</strong> {rightHalf.Cheese.map(c => c.name).join(', ') || 'None'}</p>
                  <p className="text-on-surface"><strong>Toppings:</strong> {rightHalf.Topping.map(t => t.name).join(', ') || 'None'}</p>
                </div>
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between border-t border-outline-variant/30 pt-4 mb-5">
              <span className="font-semibold text-on-surface-variant text-sm">Total Price</span>
              <span className="font-display text-3xl font-black text-primary">${currentTotal.toFixed(2)}</span>
            </div>

            <button
              type="button"
              onClick={handleAdd}
              className="w-full bg-primary hover:bg-primary-hover text-on-primary font-bold py-3.5 rounded-full shadow-glow transition-all hover:scale-[1.02] flex items-center justify-center gap-2 uppercase tracking-wider text-xs"
            >
              <span className="material-symbols-outlined text-lg">{added ? 'check' : 'shopping_cart'}</span>
              {added ? 'Added to Cart!' : 'Add Custom Pie to Cart'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext(null);

function loadCart() {
  try { return JSON.parse(localStorage.getItem('pizzania_cart')) || []; }
  catch { return []; }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart);

  useEffect(() => {
    localStorage.setItem('pizzania_cart', JSON.stringify(items));
  }, [items]);

  const addItem = (item) => {
    setItems((prev) => {
      const key = item.key || `${item.pizzaId}-${JSON.stringify(item.customization || {})}`;
      const existing = prev.find((i) => i.key === key);
      if (existing) {
        return prev.map((i) => i.key === key ? { ...i, qty: i.qty + (item.qty || 1) } : i);
      }
      return [...prev, { ...item, key, qty: item.qty || 1 }];
    });
  };

  const updateQty = (key, qty) => {
    setItems((prev) => qty <= 0 ? prev.filter((i) => i.key !== key) : prev.map((i) => i.key === key ? { ...i, qty } : i));
  };

  const removeItem = (key) => setItems((prev) => prev.filter((i) => i.key !== key));
  const clearCart = () => setItems([]);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const count = items.reduce((sum, i) => sum + i.qty, 0);

  return (
    <CartContext.Provider value={{ items, addItem, updateQty, removeItem, clearCart, subtotal, count }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);

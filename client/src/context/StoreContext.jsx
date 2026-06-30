import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../lib/api';

const StoreContext = createContext({ isOpen: true, estimatedMinutes: 35, storeName: 'Pizzania', loading: true });

export function StoreProvider({ children }) {
  const [status, setStatus] = useState({ isOpen: true, estimatedMinutes: 35, storeName: 'Pizzania', loading: true });

  const refresh = () => {
    api.getStoreStatus()
      .then((d) => setStatus({ ...d, loading: false }))
      .catch(() => setStatus((s) => ({ ...s, loading: false })));
  };

  useEffect(() => {
    refresh();
    // Re-check every 30 seconds so changes by admin are picked up quickly
    const id = setInterval(refresh, 30_000);
    return () => clearInterval(id);
  }, []);

  return <StoreContext.Provider value={status}>{children}</StoreContext.Provider>;
}

export const useStore = () => useContext(StoreContext);

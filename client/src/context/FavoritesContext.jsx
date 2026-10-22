import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from '../lib/api';
import { useAuth } from './AuthContext';

const FavoritesContext = createContext(null);

function loadGuestFavorites() {
  try {
    return JSON.parse(localStorage.getItem('pizzania_guest_favorites')) || [];
  } catch {
    return [];
  }
}

export function FavoritesProvider({ children }) {
  const { user, token } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [favoritesList, setFavoritesList] = useState([]);
  const [loading, setLoading] = useState(false);

  // Sync favorites when user / token changes
  useEffect(() => {
    if (token) {
      setLoading(true);
      api.getFavorites(token)
        .then((res) => {
          const list = res.favorites || [];
          setFavoritesList(list);
          setFavoriteIds(list.map((p) => p.id));
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      const guestIds = loadGuestFavorites();
      setFavoriteIds(guestIds);
      setFavoritesList([]);
    }
  }, [token]);

  const isFavorite = useCallback(
    (pizzaId) => favoriteIds.includes(Number(pizzaId)),
    [favoriteIds]
  );

  const toggleFavorite = async (pizza) => {
    const pizzaId = Number(pizza?.id || pizza);
    if (!pizzaId) return;

    const exists = favoriteIds.includes(pizzaId);
    const nextIds = exists
      ? favoriteIds.filter((id) => id !== pizzaId)
      : [...favoriteIds, pizzaId];

    // Optimistic UI update
    setFavoriteIds(nextIds);

    if (token) {
      try {
        const res = await api.toggleFavorite(pizzaId, token);
        if (res.favorited) {
          if (pizza && typeof pizza === 'object' && pizza.name) {
            setFavoritesList((prev) => [pizza, ...prev.filter((p) => p.id !== pizzaId)]);
          } else {
            api.getFavorites(token).then((d) => setFavoritesList(d.favorites || []));
          }
        } else {
          setFavoritesList((prev) => prev.filter((p) => p.id !== pizzaId));
        }
      } catch (err) {
        // Rollback on error
        setFavoriteIds(favoriteIds);
      }
    } else {
      // Guest mode: save to localStorage
      localStorage.setItem('pizzania_guest_favorites', JSON.stringify(nextIds));
      if (exists) {
        setFavoritesList((prev) => prev.filter((p) => p.id !== pizzaId));
      } else if (pizza && typeof pizza === 'object' && pizza.name) {
        setFavoritesList((prev) => [pizza, ...prev]);
      }
    }
  };

  const refreshFavorites = useCallback(() => {
    if (token) {
      api.getFavorites(token).then((res) => {
        const list = res.favorites || [];
        setFavoritesList(list);
        setFavoriteIds(list.map((p) => p.id));
      });
    }
  }, [token]);

  return (
    <FavoritesContext.Provider
      value={{
        favoriteIds,
        favoritesList,
        favoriteCount: favoriteIds.length,
        isFavorite,
        toggleFavorite,
        refreshFavorites,
        loading,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export const useFavorites = () => useContext(FavoritesContext);

import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import { useFavorites } from '../context/FavoritesContext';

const navLink = ({ isActive }) =>
  `font-body text-sm transition-colors py-1.5 px-3 rounded-full ${
    isActive
      ? 'text-primary font-bold bg-primary/10 border border-primary/20'
      : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-high'
  }`;

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const { count } = useCart();
  const { favoriteCount } = useFavorites();
  const { isOpen } = useStore();
  const navigate = useNavigate();

  return (
    <header className="bg-background/90 border-b border-outline-variant/30 sticky top-0 backdrop-blur-md z-50">
      <div className="flex justify-between items-center px-4 md:px-20 h-20 w-full max-w-7xl mx-auto">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="material-symbols-outlined icon-fill text-primary text-3xl group-hover:rotate-12 transition-transform duration-300">local_pizza</span>
          <span className="font-display text-2xl font-black text-primary tracking-widest uppercase">Pizzania</span>
        </Link>

        <nav className="hidden md:flex items-center gap-4">
          <NavLink to="/" end className={navLink}>Home</NavLink>
          <NavLink to="/menu" className={navLink}>Menu</NavLink>
          <NavLink to="/builder" className={navLink}>Pizza Builder</NavLink>
          <NavLink to="/about" className={navLink}>About Us</NavLink>
          <NavLink to="/track-order" className={navLink}>Track Order</NavLink>
          {user?.role === 'admin' && <NavLink to="/admin" className={navLink}>Admin</NavLink>}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/profile?tab=favorites"
            title="Saved Favorites"
            className="relative p-2 text-on-surface hover:text-red-400 transition-colors rounded-full hover:bg-surface-container"
          >
            <span className="material-symbols-outlined text-[22px] align-middle hover:scale-110 transition-transform">favorite</span>
            {favoriteCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-in zoom-in-50">
                {favoriteCount}
              </span>
            )}
          </Link>
          <Link to="/cart" className="relative p-2 text-on-surface hover:text-primary transition-colors rounded-full hover:bg-surface-container">
            <span className="material-symbols-outlined text-[22px] align-middle">shopping_cart</span>
            {count > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-on-primary text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{count}</span>
            )}
          </Link>
          {user ? (
            <div className="hidden md:flex items-center gap-3 ml-2">
              <Link to="/profile" className="text-sm font-bold text-on-surface hover:text-primary border-r border-outline-variant/50 pr-3">{user.name.split(' ')[0]}</Link>
              <button onClick={() => { logout(); navigate('/'); }} className="text-sm text-on-surface-variant hover:text-primary">Logout</button>
            </div>
          ) : (
            <Link to="/login" className="hidden md:inline-block ml-2 bg-primary hover:bg-primary-hover text-on-primary text-sm font-bold px-6 py-2.5 rounded-full shadow-glow transition-all hover:scale-105">
              Login
            </Link>
          )}
          <button className="md:hidden text-on-background ml-1" onClick={() => setOpen(!open)}>
            <span className="material-symbols-outlined">menu</span>
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden bg-surface-container border-t border-outline-variant px-4 py-4 flex flex-col gap-3">
          <NavLink to="/" end className={navLink} onClick={() => setOpen(false)}>Home</NavLink>
          <NavLink to="/menu" className={navLink} onClick={() => setOpen(false)}>Menu</NavLink>
          <NavLink to="/builder" className={navLink} onClick={() => setOpen(false)}>Pizza Builder</NavLink>
          <NavLink to="/profile?tab=favorites" className={navLink} onClick={() => setOpen(false)}>Saved Favorites ({favoriteCount})</NavLink>
          <NavLink to="/about" className={navLink} onClick={() => setOpen(false)}>About Us</NavLink>
          <NavLink to="/track-order" className={navLink} onClick={() => setOpen(false)}>Track Order</NavLink>
          {user?.role === 'admin' && <NavLink to="/admin" className={navLink} onClick={() => setOpen(false)}>Admin</NavLink>}
          {user ? (
            <>
              <NavLink to="/profile" className={navLink} onClick={() => setOpen(false)}>Profile</NavLink>
              <button onClick={() => { logout(); setOpen(false); navigate('/'); }} className="text-left text-sm text-primary font-semibold pl-3">Logout</button>
            </>
          ) : (
            <Link to="/login" onClick={() => setOpen(false)} className="bg-primary text-on-primary text-sm font-bold px-6 py-2.5 rounded-full text-center">Login</Link>
          )}
        </div>
      )}

      {/* Store-closed banner */}
      {!isOpen && (
        <div className="bg-[#2A1415] border-b border-red-900/30 text-red-200 text-sm font-semibold flex items-center justify-center gap-2 py-2.5 px-4">
          <span className="material-symbols-outlined text-base icon-fill">store</span>
          We're currently closed — no new orders can be placed right now. Check back soon!
        </div>
      )}
    </header>
  );
}

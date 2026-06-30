import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';

const navLink = ({ isActive }) =>
  `font-body text-sm transition-colors py-1 px-2 rounded ${isActive ? 'text-primary font-bold border-b-2 border-primary' : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-low'}`;

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const { count } = useCart();
  const { isOpen } = useStore();
  const navigate = useNavigate();

  return (
    <header className="bg-background/90 border-b border-outline-variant shadow-sm sticky top-0 backdrop-blur-md z-50">
      <div className="flex justify-between items-center px-4 md:px-20 h-20 w-full max-w-7xl mx-auto">
        <Link to="/" className="flex items-center gap-2">
          <span className="material-symbols-outlined icon-fill text-primary text-3xl">local_pizza</span>
          <span className="font-display text-2xl font-bold text-primary tracking-tight">Pizzania</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <NavLink to="/" end className={navLink}>Home</NavLink>
          <NavLink to="/menu" className={navLink}>Menu</NavLink>
          <NavLink to="/about" className={navLink}>About Us</NavLink>
          <NavLink to="/track-order" className={navLink}>Track Order</NavLink>
          {user?.role === 'admin' && <NavLink to="/admin" className={navLink}>Admin</NavLink>}
        </nav>

        <div className="flex items-center gap-3">
          <Link to="/cart" className="relative p-2 text-on-surface hover:text-primary transition-colors">
            <span className="material-symbols-outlined">shopping_cart</span>
            {count > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{count}</span>
            )}
          </Link>
          {user ? (
            <div className="hidden md:flex items-center gap-2">
              <Link to="/profile" className="text-sm font-semibold text-on-surface hover:text-primary">{user.name.split(' ')[0]}</Link>
              <button onClick={() => { logout(); navigate('/'); }} className="text-sm text-on-surface-variant hover:text-primary">Logout</button>
            </div>
          ) : (
            <Link to="/login" className="hidden md:inline-block bg-primary hover:bg-primary-hover text-white text-sm font-bold px-6 py-2.5 rounded-full shadow-glow transition-all hover:scale-105">
              Login
            </Link>
          )}
          <button className="md:hidden text-on-background" onClick={() => setOpen(!open)}>
            <span className="material-symbols-outlined">menu</span>
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden bg-surface-container-low border-t border-outline-variant px-4 py-4 flex flex-col gap-3">
          <NavLink to="/" end className={navLink} onClick={() => setOpen(false)}>Home</NavLink>
          <NavLink to="/menu" className={navLink} onClick={() => setOpen(false)}>Menu</NavLink>
          <NavLink to="/about" className={navLink} onClick={() => setOpen(false)}>About Us</NavLink>
          <NavLink to="/track-order" className={navLink} onClick={() => setOpen(false)}>Track Order</NavLink>
          {user?.role === 'admin' && <NavLink to="/admin" className={navLink} onClick={() => setOpen(false)}>Admin</NavLink>}
          {user ? (
            <>
              <NavLink to="/profile" className={navLink} onClick={() => setOpen(false)}>Profile</NavLink>
              <button onClick={() => { logout(); setOpen(false); navigate('/'); }} className="text-left text-sm text-primary font-semibold">Logout</button>
            </>
          ) : (
            <Link to="/login" onClick={() => setOpen(false)} className="bg-primary text-white text-sm font-bold px-6 py-2.5 rounded-full text-center">Login</Link>
          )}
        </div>
      )}

      {/* Store-closed banner */}
      {!isOpen && (
        <div className="bg-red-600 text-white text-sm font-semibold flex items-center justify-center gap-2 py-2.5 px-4">
          <span className="material-symbols-outlined text-base icon-fill">store</span>
          We're currently closed — no new orders can be placed right now. Check back soon!
        </div>
      )}
    </header>
  );
}

import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-espresso text-cream mt-auto">
      <div className="max-w-7xl mx-auto px-4 md:px-20 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined icon-fill text-gold text-2xl">local_pizza</span>
            <span className="font-display text-xl font-bold">Pizzania</span>
          </div>
          <p className="text-sm text-cream/70">Handcrafted artisanal pizzas, delivered hot and fresh to your door.</p>
        </div>
        <div>
          <h4 className="font-display font-bold mb-3 text-gold">Explore</h4>
          <div className="flex flex-col gap-2 text-sm text-cream/70">
            <Link to="/menu" className="hover:text-gold">Menu</Link>
            <Link to="/about" className="hover:text-gold">About Us</Link>
            <Link to="/track-order" className="hover:text-gold">Track Order</Link>
          </div>
        </div>
        <div>
          <h4 className="font-display font-bold mb-3 text-gold">Account</h4>
          <div className="flex flex-col gap-2 text-sm text-cream/70">
            <Link to="/login" className="hover:text-gold">Login</Link>
            <Link to="/register" className="hover:text-gold">Register</Link>
            <Link to="/profile" className="hover:text-gold">Profile</Link>
          </div>
        </div>
        <div>
          <h4 className="font-display font-bold mb-3 text-gold">Contact</h4>
          <p className="text-sm text-cream/70">123 Slice Street, Flavor Town</p>
          <p className="text-sm text-cream/70">(555) 123-4567</p>
          <p className="text-sm text-cream/70">hello@pizzania.com</p>
        </div>
      </div>
      <div className="border-t border-cream/10 text-center text-xs text-cream/50 py-4">
        © {new Date().getFullYear()} Pizzania. All rights reserved.
      </div>
    </footer>
  );
}

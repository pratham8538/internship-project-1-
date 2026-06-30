import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const update = (key) => (e) => setForm((current) => ({ ...current, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await register({ name: form.name, email: form.email, phone: form.phone, password: form.password });
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell min-h-[88vh] flex items-center justify-center px-4 py-12">
      <div className="auth-panel w-full max-w-[480px] bg-background rounded-2xl border border-outline-variant/70 p-8 md:p-10 relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-secondary-container to-gold" />
        <div className="text-center mb-8">
          <div className="flex items-center gap-2 justify-center mb-4 text-primary">
            <span className="material-symbols-outlined icon-fill text-4xl">local_pizza</span>
            <span className="font-display text-3xl font-bold tracking-tight uppercase">Pizzania</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-on-surface mb-2">Create Account</h1>
          <p className="text-sm text-on-surface-variant">Join us and enjoy the best pizzas.</p>
        </div>

        {error && <div className="bg-red-50 text-primary text-sm font-medium rounded-md px-4 py-3 mb-4 border border-primary/20">{error}</div>}

        <form onSubmit={submit} className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-semibold text-on-surface-variant">Full Name</label>
            <div className="relative mt-1">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">person</span>
              <input required value={form.name} onChange={update('name')} className="w-full pl-12 pr-4 py-3 rounded-xl border border-outline-variant bg-surface-container-lowest focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="Jordan Lee" />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-on-surface-variant">Email</label>
            <div className="relative mt-1">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">mail</span>
              <input type="email" required value={form.email} onChange={update('email')} className="w-full pl-12 pr-4 py-3 rounded-xl border border-outline-variant bg-surface-container-lowest focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="you@example.com" />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-on-surface-variant">Phone</label>
            <div className="relative mt-1">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">call</span>
              <input value={form.phone} onChange={update('phone')} className="w-full pl-12 pr-4 py-3 rounded-xl border border-outline-variant bg-surface-container-lowest focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="(555) 123-4567" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold text-on-surface-variant">Password</label>
              <div className="relative mt-1">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">lock</span>
                <input type="password" required value={form.password} onChange={update('password')} className="w-full pl-12 pr-4 py-3 rounded-xl border border-outline-variant bg-surface-container-lowest focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="Create password" />
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-on-surface-variant">Confirm</label>
              <div className="relative mt-1">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">lock_reset</span>
                <input type="password" required value={form.confirm} onChange={update('confirm')} className="w-full pl-12 pr-4 py-3 rounded-xl border border-outline-variant bg-surface-container-lowest focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="Confirm" />
              </div>
            </div>
          </div>

          <button disabled={loading} type="submit" className="bg-primary hover:bg-primary-hover text-white font-bold py-3.5 rounded-xl shadow-glow transition-all hover:scale-[1.02] disabled:opacity-60 mt-2">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-on-surface-variant mt-6">
          Already have an account? <Link to="/login" className="text-primary font-semibold hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}

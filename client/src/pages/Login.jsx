import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      navigate(user.role === 'admin' ? '/admin' : (location.state?.from?.pathname || '/'));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell min-h-[88vh] flex items-center justify-center px-4 py-12 animate-in fade-in duration-300">
      <div className="auth-panel w-full max-w-md bg-surface-container/95 rounded-2xl border border-outline-variant/40 p-8 md:p-10 relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-secondary to-gold" />
        <div className="text-center mb-8">
          <div className="flex items-center gap-2 justify-center mb-4 text-primary">
            <span className="material-symbols-outlined icon-fill text-4xl">local_pizza</span>
            <span className="font-display text-3xl font-black tracking-widest uppercase">Pizzania</span>
          </div>
          <h1 className="font-display text-3xl font-extrabold text-on-surface mb-2">Welcome Back!</h1>
          <p className="text-sm text-on-surface-variant">Login to continue your pizza journey</p>
        </div>

        {error && <div className="bg-[#2A1415]/80 text-red-200 text-sm font-semibold rounded-xl px-4 py-3.5 border border-red-900/40 mb-4">{error}</div>}

        <form onSubmit={submit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs uppercase tracking-wider font-bold text-on-surface-variant">Email</label>
            <div className="relative mt-1">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">mail</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-outline bg-background/50 text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder-on-surface-variant/40"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider font-bold text-on-surface-variant">Password</label>
            <div className="relative mt-1">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">lock</span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-outline bg-background/50 text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder-on-surface-variant/40"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <button disabled={loading} type="submit" className="mt-4 bg-primary hover:bg-primary-hover text-on-primary font-bold py-3.5 rounded-xl shadow-glow transition-all hover:scale-[1.02] disabled:opacity-60 uppercase text-sm tracking-wider">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="text-center text-sm text-on-surface-variant mt-6">
          Don't have an account? <Link to="/register" className="text-primary font-bold hover:underline transition-colors">Register</Link>
        </p>
      </div>
    </div>
  );
}

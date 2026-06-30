import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';

export default function Customers() {
  const { token } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');

  const load = () => api.adminCustomers(token).then((d) => setCustomers(d.customers));
  useEffect(() => { load(); // eslint-disable-next-line
  }, [token]);

  const remove = async (id) => {
    if (!confirm('Remove this customer account?')) return;
    await api.adminDeleteCustomer(id, token);
    load();
  };

  const filtered = customers.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <AdminLayout title="Customers">
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search customers…"
        className="w-full max-w-sm px-4 py-2.5 rounded-full border border-gold bg-background mb-6 focus:border-primary focus:outline-none"
      />
      <div className="bg-background border border-outline-variant rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface-container-high">
            <tr className="text-left text-on-surface-variant">
              <th className="py-3 px-4">Name</th><th>Email</th><th>Phone</th><th>Orders</th><th>Total Spent</th><th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} className="border-t border-outline-variant">
                <td className="py-2.5 px-4 font-semibold">{c.name}</td>
                <td>{c.email}</td>
                <td>{c.phone || '—'}</td>
                <td>{c.order_count}</td>
                <td className="font-semibold text-primary">${c.total_spent.toFixed(2)}</td>
                <td className="px-4"><button onClick={() => remove(c.id)} className="text-xs font-semibold text-on-surface-variant hover:text-primary">Remove</button></td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={6} className="text-center py-10 text-on-surface-variant">No customers found.</td></tr>}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}

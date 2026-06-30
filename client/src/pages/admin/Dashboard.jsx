import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';

function StatCard({ icon, label, value, accent }) {
  return (
    <div className="bg-background rounded-xl p-5 border border-outline-variant shadow-warm flex items-center gap-4">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${accent}`}>
        <span className="material-symbols-outlined text-2xl">{icon}</span>
      </div>
      <div>
        <p className="text-sm text-on-surface-variant">{label}</p>
        <p className="font-display text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.adminStats(token).then(setStats).catch(() => {});
  }, [token]);

  return (
    <AdminLayout title="Dashboard Overview">
      {!stats ? (
        <p className="text-on-surface-variant">Loading stats…</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard icon="payments" label="Total Revenue" value={`$${stats.revenue.toFixed(2)}`} accent="bg-primary/10 text-primary" />
            <StatCard icon="receipt_long" label="Total Orders" value={stats.totalOrders} accent="bg-gold/30 text-on-surface" />
            <StatCard icon="group" label="Customers" value={stats.totalCustomers} accent="bg-primary/10 text-primary" />
            <StatCard icon="hourglass_top" label="Pending Orders" value={stats.pendingOrders} accent="bg-gold/30 text-on-surface" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-background rounded-xl border border-outline-variant p-6">
              <h3 className="font-display font-bold text-lg mb-4">Recent Orders</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-on-surface-variant border-b border-outline-variant">
                      <th className="py-2">Order</th><th>Customer</th><th>Status</th><th className="text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentOrders.map((o) => (
                      <tr key={o.id} className="border-b border-outline-variant/50">
                        <td className="py-2 font-semibold">#{o.id}</td>
                        <td>{o.customer_name || 'Guest'}</td>
                        <td><span className="text-xs font-bold px-2 py-1 rounded-full bg-gold/40">{o.status}</span></td>
                        <td className="text-right font-semibold text-primary">${o.total.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <div className="bg-background rounded-xl border border-outline-variant p-6">
                <h3 className="font-display font-bold text-lg mb-4">Top Sellers</h3>
                <div className="flex flex-col gap-3">
                  {stats.topPizzas.map((p) => (
                    <div key={p.name} className="flex justify-between text-sm">
                      <span className="text-on-surface-variant">{p.name}</span>
                      <span className="font-semibold">{p.sold} sold</span>
                    </div>
                  ))}
                  {stats.topPizzas.length === 0 && <p className="text-sm text-on-surface-variant">No sales yet.</p>}
                </div>
              </div>
              <div className="bg-background rounded-xl border border-outline-variant p-6">
                <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">warning</span> Low Stock
                </h3>
                <div className="flex flex-col gap-2">
                  {stats.lowStock.map((p) => (
                    <div key={p.name} className="flex justify-between text-sm">
                      <span className="text-on-surface-variant">{p.name}</span>
                      <span className="font-semibold text-primary">{p.stock} left</span>
                    </div>
                  ))}
                  {stats.lowStock.length === 0 && <p className="text-sm text-on-surface-variant">All stocked up!</p>}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}

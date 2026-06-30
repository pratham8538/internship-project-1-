import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';

function Metric({ label, value, icon, accent }) {
  return (
    <div className="bg-background rounded-xl border border-outline-variant p-5 shadow-warm">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${accent}`}>
          <span className="material-symbols-outlined">{icon}</span>
        </div>
      </div>
      <p className="text-sm text-on-surface-variant">{label}</p>
      <p className="font-display text-3xl font-bold mt-1">{value}</p>
    </div>
  );
}

export default function Reports() {
  const { token } = useAuth();
  const [report, setReport] = useState(null);

  useEffect(() => {
    api.adminReports(token).then(setReport).catch(() => {});
  }, [token]);

  const maxSales = Math.max(...(report?.hourlySales?.map((entry) => Number(entry.total)) || [1]));

  return (
    <AdminLayout title="Reports & Analytics">
      {!report ? (
        <p className="text-on-surface-variant">Loading analytics…</p>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <Metric label="Total Revenue" value={`$${Number(report.revenue).toFixed(2)}`} icon="payments" accent="bg-primary/10 text-primary" />
            <Metric label="Total Orders" value={report.totalOrders} icon="receipt_long" accent="bg-gold/30 text-on-surface" />
            <Metric label="Avg. Order Value" value={`$${Number(report.avgOrderValue).toFixed(2)}`} icon="shopping_cart" accent="bg-primary/10 text-primary" />
            <Metric label="Active in Kitchen" value={report.activeKitchen} icon="skillet" accent="bg-gold/30 text-on-surface" />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <section className="xl:col-span-2 bg-background rounded-xl border border-outline-variant p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-display text-xl font-bold">Today’s Sales Flow</h2>
                  <p className="text-sm text-on-surface-variant">Hourly order revenue captured from the live database.</p>
                </div>
              </div>
              <div className="min-h-[280px] flex items-end gap-3 border-b border-outline-variant pb-4">
                {report.hourlySales.length === 0 && <p className="text-sm text-on-surface-variant">No orders placed yet today.</p>}
                {report.hourlySales.map((entry) => {
                  const height = Math.max((Number(entry.total) / maxSales) * 220, 20);
                  return (
                    <div key={entry.hour} className="flex-1 flex flex-col items-center gap-2">
                      <div className="text-xs font-semibold text-on-surface-variant">${Number(entry.total).toFixed(0)}</div>
                      <div className="w-full rounded-t-md bg-primary/85 hover:bg-primary transition-colors" style={{ height }} />
                      <div className="text-xs text-on-surface-variant">{entry.hour}:00</div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="bg-background rounded-xl border border-outline-variant p-6">
              <h2 className="font-display text-xl font-bold mb-4">Status Breakdown</h2>
              <div className="flex flex-col gap-3">
                {report.statusBreakdown.map((item) => (
                  <div key={item.status} className="rounded-lg bg-surface-container-low px-4 py-3 flex items-center justify-between">
                    <span className="font-medium">{item.status}</span>
                    <span className="font-bold text-primary">{item.count}</span>
                  </div>
                ))}
                {report.statusBreakdown.length === 0 && <p className="text-sm text-on-surface-variant">No order statuses yet.</p>}
              </div>
            </section>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <section className="bg-background rounded-xl border border-outline-variant p-6">
              <h2 className="font-display text-xl font-bold mb-4">Trending Pizzas</h2>
              <div className="flex flex-col gap-3">
                {report.topPizzas.map((pizza) => (
                  <div key={pizza.name} className="rounded-lg border border-outline-variant px-4 py-3">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{pizza.name}</span>
                      <span className="text-primary font-bold">{pizza.sold} sold</span>
                    </div>
                    <p className="text-sm text-on-surface-variant mt-1">${Number(pizza.revenue).toFixed(2)} revenue</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="xl:col-span-2 bg-background rounded-xl border border-outline-variant overflow-hidden">
              <div className="px-6 py-5 border-b border-outline-variant">
                <h2 className="font-display text-xl font-bold">Recent Orders Snapshot</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-surface-container-high">
                    <tr className="text-left text-on-surface-variant">
                      <th className="px-4 py-3">Order</th>
                      <th>Customer</th>
                      <th>Items</th>
                      <th>Status</th>
                      <th className="px-4 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.recentOrders.map((order) => (
                      <tr key={order.id} className="border-t border-outline-variant">
                        <td className="px-4 py-3 font-semibold">#{order.id}</td>
                        <td>{order.customer_name || 'Guest'}</td>
                        <td className="text-on-surface-variant">{order.items.map((item) => item.name).join(', ')}</td>
                        <td><span className="px-2.5 py-1 rounded-full bg-gold/40 font-semibold text-xs">{order.status}</span></td>
                        <td className="px-4 text-right font-semibold text-primary">${Number(order.total).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

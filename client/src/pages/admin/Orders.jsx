import { Fragment, useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';

const STATUSES = ['Placed', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'];

export default function AdminOrders() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('All');
  const [expanded, setExpanded] = useState(null);

  const load = () => api.adminOrders(token, filter !== 'All' ? filter : undefined).then((d) => setOrders(d.orders));

  useEffect(() => { load(); // eslint-disable-next-line
  }, [token, filter]);

  const setStatus = async (id, status) => {
    await api.adminUpdateOrderStatus(id, status, token);
    load();
  };

  return (
    <AdminLayout title="Orders">
      <div className="flex gap-2 flex-wrap mb-6">
        {['All', ...STATUSES].map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`px-4 py-2 rounded-full text-sm font-semibold ${filter === s ? 'bg-primary text-white' : 'bg-background text-on-surface-variant border border-outline-variant hover:border-primary'}`}>
            {s}
          </button>
        ))}
      </div>

      <div className="bg-background rounded-xl border border-outline-variant overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface-container-high">
            <tr className="text-left text-on-surface-variant">
              <th className="py-3 px-4">Order</th><th>Customer</th><th>Date</th><th>Status</th><th className="text-right">Total</th><th></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <Fragment key={o.id}>
                <tr className="border-t border-outline-variant">
                  <td className="py-3 px-4 font-mono font-semibold text-primary">{o.order_number || `#${o.id}`}</td>
                  <td>{o.customer_name || 'Guest'}<br /><span className="text-xs text-on-surface-variant">{o.customer_email}</span></td>
                  <td className="text-xs text-on-surface-variant">{new Date(o.created_at).toLocaleString()}</td>
                  <td>
                    <select value={o.status} onChange={(e) => setStatus(o.id, e.target.value)} className="border border-gold rounded-md px-2 py-1.5 text-xs font-semibold bg-background">
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="text-right font-semibold text-primary">${o.total.toFixed(2)}</td>
                  <td className="px-4">
                    <button onClick={() => setExpanded(expanded === o.id ? null : o.id)} className="text-primary text-xs font-semibold hover:underline">
                      {expanded === o.id ? 'Hide' : 'Details'}
                    </button>
                  </td>
                </tr>
                {expanded === o.id && (
                  <tr className="bg-surface-container-low">
                    <td colSpan={6} className="px-6 py-4">
                      <p className="text-xs text-on-surface-variant mb-2"><span className="font-semibold">Address:</span> {o.address}</p>
                      <div className="text-xs text-on-surface-variant mb-2">
                        <span className="font-semibold">Payment:</span> {o.payment_method}
                        {o.payment_details && (() => {
                          try {
                            const pDetails = JSON.parse(o.payment_details);
                            if (o.payment_method === 'Card' && pDetails.cardNo) {
                              return <span className="ml-2 text-primary">({pDetails.cardName} - **** {pDetails.cardNo.slice(-4)})</span>;
                            }
                            if (o.payment_method === 'UPI' && pDetails.upiId) {
                              return <span className="ml-2 text-primary">({pDetails.upiId})</span>;
                            }
                          } catch(e) {}
                          return null;
                        })()}
                      </div>
                      <ul className="text-sm text-on-surface-variant list-disc pl-5">
                        {o.items.map((it) => <li key={it.id}>{it.qty} × {it.name} — ${(it.price * it.qty).toFixed(2)}</li>)}
                      </ul>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
            {orders.length === 0 && (
              <tr><td colSpan={6} className="text-center py-10 text-on-surface-variant">No orders found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}

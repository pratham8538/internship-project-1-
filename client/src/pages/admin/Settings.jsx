import { useEffect, useState, useCallback } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';

/* ─── tiny helpers ─────────────────────────────────────────────── */
function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
        checked ? 'bg-primary' : 'bg-outline-variant'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

function Field({ label, hint, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-semibold text-on-surface-variant">{label}</label>
      {hint && <p className="text-xs text-on-surface-variant/70">{hint}</p>}
      {children}
    </div>
  );
}

function SectionCard({ title, icon, children }) {
  return (
    <div className="bg-background border border-outline-variant rounded-2xl overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-outline-variant bg-surface-container-low">
        <span className="material-symbols-outlined text-primary text-xl">{icon}</span>
        <h2 className="font-display text-base font-bold text-on-surface">{title}</h2>
      </div>
      <div className="p-6 flex flex-col gap-5">{children}</div>
    </div>
  );
}

const INPUT_CLS =
  'w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-low focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none text-sm transition-all';

const SELECT_CLS =
  'w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-low focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none text-sm appearance-none transition-all';

/* ─── operating hours data ─────────────────────────────────────── */
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DEFAULT_HOURS = {
  Monday:    { open: true,  from: '10:00', to: '22:00' },
  Tuesday:   { open: true,  from: '10:00', to: '22:00' },
  Wednesday: { open: true,  from: '10:00', to: '22:00' },
  Thursday:  { open: true,  from: '10:00', to: '22:00' },
  Friday:    { open: true,  from: '10:00', to: '23:00' },
  Saturday:  { open: true,  from: '11:00', to: '23:00' },
  Sunday:    { open: false, from: '12:00', to: '20:00' },
};

function parseHours(raw) {
  try { return JSON.parse(raw); } catch { return DEFAULT_HOURS; }
}

/* ═══════════════════════════════════════════════════════════════ */
export default function Settings() {
  const { token } = useAuth();
  const [settings, setSettings]   = useState({});
  const [hours, setHours]         = useState(DEFAULT_HOURS);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [toast, setToast]         = useState(null);   // { msg, type }
  const [activeTab, setActiveTab] = useState('store');

  /* ── load ───────────────────────────────────────────────────── */
  useEffect(() => {
    api.adminGetSettings(token).then((d) => {
      setSettings(d.settings || {});
      setHours(parseHours(d.settings?.operating_hours));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [token]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  /* ── field helpers ──────────────────────────────────────────── */
  const set = (k) => (e) =>
    setSettings((s) => ({ ...s, [k]: typeof e === 'string' ? e : e.target.value }));

  const toggle = (k) => () =>
    setSettings((s) => ({ ...s, [k]: s[k] === 'true' ? 'false' : 'true' }));

  const setHourField = (day, field, value) =>
    setHours((h) => ({ ...h, [day]: { ...h[day], [field]: value } }));

  /* ── save ───────────────────────────────────────────────────── */
  const save = async (e) => {
    e?.preventDefault();
    setSaving(true);
    try {
      const payload = { ...settings, operating_hours: JSON.stringify(hours) };
      const d = await api.adminUpdateSettings(payload, token);
      setSettings(d.settings || {});
      setHours(parseHours(d.settings?.operating_hours));
      showToast('Settings saved successfully!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  /* ── reset to defaults ──────────────────────────────────────── */
  const resetDefaults = async () => {
    if (!window.confirm('Reset all settings to factory defaults? This cannot be undone.')) return;
    const defaults = {
      store_name: 'Pizzania',
      support_email: 'hello@pizzania.com',
      support_phone: '+1 (555) 019-2837',
      store_address: '124 Baker Street, Artisanal District, Metropolis, NY 10001',
      delivery_fee: '3.99',
      tax_rate: '8',
      min_order_value: '10',
      free_delivery_above: '50',
      estimated_delivery_minutes: '35',
      is_open: 'true',
      payment_provider: 'cash',
      new_order_alerts: 'true',
      inventory_warnings: 'true',
      marketing_summaries: 'false',
      low_stock_threshold: '20',
      currency_symbol: '$',
      timezone: 'America/New_York',
    };
    setSaving(true);
    try {
      const d = await api.adminUpdateSettings({ ...defaults, operating_hours: JSON.stringify(DEFAULT_HOURS) }, token);
      setSettings(d.settings || {});
      setHours(DEFAULT_HOURS);
      showToast('Settings reset to defaults.', 'success');
    } catch {
      showToast('Reset failed.', 'error');
    } finally {
      setSaving(false);
    }
  };

  /* ── tabs config ────────────────────────────────────────────── */
  const tabs = [
    { id: 'store',    label: 'Store Profile', icon: 'storefront'      },
    { id: 'delivery', label: 'Delivery & Tax', icon: 'local_shipping' },
    { id: 'payment',  label: 'Payment',        icon: 'payments'       },
    { id: 'hours',    label: 'Hours',          icon: 'schedule'       },
    { id: 'alerts',   label: 'Notifications',  icon: 'notifications'  },
    { id: 'advanced', label: 'Advanced',       icon: 'tune'           },
  ];

  if (loading) {
    return (
      <AdminLayout title="Store Settings">
        <div className="flex items-center justify-center h-64 text-on-surface-variant">
          <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Store Settings">
      {/* ── toast ─────────────────────────────────────────────── */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-lg text-sm font-semibold transition-all ${
            toast.type === 'success'
              ? 'bg-green-600 text-white'
              : 'bg-red-600 text-white'
          }`}
        >
          <span className="material-symbols-outlined text-xl">
            {toast.type === 'success' ? 'check_circle' : 'error'}
          </span>
          {toast.msg}
        </div>
      )}

      <form onSubmit={save} className="max-w-5xl mx-auto flex flex-col gap-6">

        {/* ── tab bar ───────────────────────────────────────────── */}
        <div className="flex items-center gap-1 bg-surface-container-low border border-outline-variant rounded-xl p-1.5 flex-wrap">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === t.id
                  ? 'bg-primary text-white shadow-md'
                  : 'text-on-surface-variant hover:bg-outline-variant/30'
              }`}
            >
              <span className="material-symbols-outlined text-base">{t.icon}</span>
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>

        {/* ══════════ STORE PROFILE ══════════ */}
        {activeTab === 'store' && (
          <SectionCard title="Store Profile" icon="storefront">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Store Name" hint="Displayed across the site and receipts.">
                <input value={settings.store_name || ''} onChange={set('store_name')} className={INPUT_CLS} placeholder="Pizzania" />
              </Field>
              <Field label="Currency Symbol" hint="e.g. $, €, ₹">
                <input value={settings.currency_symbol || '$'} onChange={set('currency_symbol')} className={INPUT_CLS} placeholder="$" maxLength={3} />
              </Field>
              <Field label="Support Email">
                <input type="email" value={settings.support_email || ''} onChange={set('support_email')} className={INPUT_CLS} placeholder="hello@pizzania.com" />
              </Field>
              <Field label="Support Phone">
                <input value={settings.support_phone || ''} onChange={set('support_phone')} className={INPUT_CLS} placeholder="+1 (555) 019-2837" />
              </Field>
            </div>
            <Field label="Store Address">
              <textarea rows={3} value={settings.store_address || ''} onChange={set('store_address')} className={INPUT_CLS + ' resize-none'} placeholder="124 Baker Street..." />
            </Field>
            <Field label="Timezone">
              <select value={settings.timezone || 'America/New_York'} onChange={set('timezone')} className={SELECT_CLS}>
                <option value="America/New_York">America/New_York (EST/EDT)</option>
                <option value="America/Chicago">America/Chicago (CST/CDT)</option>
                <option value="America/Denver">America/Denver (MST/MDT)</option>
                <option value="America/Los_Angeles">America/Los_Angeles (PST/PDT)</option>
                <option value="Europe/London">Europe/London (GMT/BST)</option>
                <option value="Europe/Paris">Europe/Paris (CET/CEST)</option>
                <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                <option value="Australia/Sydney">Australia/Sydney (AEST)</option>
              </select>
            </Field>

            {/* Store open/closed hero toggle */}
            <div className={`flex items-center justify-between rounded-xl px-5 py-4 border-2 transition-colors ${
              settings.is_open === 'true' ? 'border-green-500 bg-green-50' : 'border-red-400 bg-red-50'
            }`}>
              <div>
                <p className="font-bold text-on-surface">Store Status</p>
                <p className="text-sm text-on-surface-variant">
                  {settings.is_open === 'true'
                    ? 'Your store is currently accepting orders.'
                    : 'Your store is currently closed. No new orders will be accepted.'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-sm font-bold ${settings.is_open === 'true' ? 'text-green-600' : 'text-red-500'}`}>
                  {settings.is_open === 'true' ? 'OPEN' : 'CLOSED'}
                </span>
                <Toggle checked={settings.is_open === 'true'} onChange={toggle('is_open')} />
              </div>
            </div>
          </SectionCard>
        )}

        {/* ══════════ DELIVERY & TAX ══════════ */}
        {activeTab === 'delivery' && (
          <SectionCard title="Delivery & Pricing" icon="local_shipping">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Delivery Fee ($)" hint="Charged per order unless free delivery threshold is met.">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant font-semibold">
                    {settings.currency_symbol || '$'}
                  </span>
                  <input
                    type="number" step="0.01" min="0"
                    value={settings.delivery_fee || ''}
                    onChange={set('delivery_fee')}
                    className={INPUT_CLS + ' pl-8'}
                    placeholder="3.99"
                  />
                </div>
              </Field>
              <Field label="Tax Rate (%)" hint="Applied to subtotal before delivery fee.">
                <div className="relative">
                  <input
                    type="number" step="0.1" min="0" max="100"
                    value={settings.tax_rate || ''}
                    onChange={set('tax_rate')}
                    className={INPUT_CLS + ' pr-8'}
                    placeholder="8"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant font-semibold">%</span>
                </div>
              </Field>
              <Field label="Minimum Order Value" hint="Orders below this amount won't be accepted.">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant font-semibold">
                    {settings.currency_symbol || '$'}
                  </span>
                  <input
                    type="number" step="0.5" min="0"
                    value={settings.min_order_value || ''}
                    onChange={set('min_order_value')}
                    className={INPUT_CLS + ' pl-8'}
                    placeholder="10"
                  />
                </div>
              </Field>
              <Field label="Free Delivery Above" hint="Set 0 to never offer free delivery.">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant font-semibold">
                    {settings.currency_symbol || '$'}
                  </span>
                  <input
                    type="number" step="1" min="0"
                    value={settings.free_delivery_above || ''}
                    onChange={set('free_delivery_above')}
                    className={INPUT_CLS + ' pl-8'}
                    placeholder="50"
                  />
                </div>
              </Field>
              <Field label="Estimated Delivery Time" hint="Shown to customers on the order tracker.">
                <div className="relative">
                  <input
                    type="number" min="1" max="180"
                    value={settings.estimated_delivery_minutes || ''}
                    onChange={set('estimated_delivery_minutes')}
                    className={INPUT_CLS + ' pr-20'}
                    placeholder="35"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">minutes</span>
                </div>
              </Field>
              <Field label="Low Stock Threshold" hint="Items below this count appear in low-stock alerts.">
                <input
                  type="number" min="1"
                  value={settings.low_stock_threshold || ''}
                  onChange={set('low_stock_threshold')}
                  className={INPUT_CLS}
                  placeholder="20"
                />
              </Field>
            </div>

            {/* live preview card */}
            <div className="bg-surface-container-low border border-outline-variant rounded-xl p-5 mt-2">
              <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-3">Order Summary Preview</p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-on-surface-variant">Subtotal</span><span>$20.00</span></div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">
                    Tax ({settings.tax_rate || 0}%)
                  </span>
                  <span>{settings.currency_symbol || '$'}{(20 * (parseFloat(settings.tax_rate) || 0) / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Delivery</span>
                  <span>
                    {20 >= parseFloat(settings.free_delivery_above || 0) && parseFloat(settings.free_delivery_above || 0) > 0
                      ? <span className="text-green-600 font-semibold">FREE</span>
                      : `${settings.currency_symbol || '$'}${parseFloat(settings.delivery_fee || 0).toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between font-bold border-t border-outline-variant pt-1 mt-1">
                  <span>Total</span>
                  <span className="text-primary">
                    {settings.currency_symbol || '$'}
                    {(
                      20 +
                      (20 * (parseFloat(settings.tax_rate) || 0) / 100) +
                      (20 >= parseFloat(settings.free_delivery_above || 0) && parseFloat(settings.free_delivery_above || 0) > 0
                        ? 0
                        : parseFloat(settings.delivery_fee || 0))
                    ).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </SectionCard>
        )}

        {/* ══════════ PAYMENT ══════════ */}
        {activeTab === 'payment' && (
          <SectionCard title="Payment Method" icon="payments">
            <p className="text-sm text-on-surface-variant">Choose the primary payment method shown to customers at checkout.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  value: 'cash',
                  label: 'Cash on Delivery',
                  icon: 'payments',
                  hint: 'Collect payment when the driver arrives. Zero setup required.',
                  badge: 'Recommended',
                },
                {
                  value: 'razorpay',
                  label: 'Razorpay',
                  icon: 'credit_card',
                  hint: 'Accept cards, UPI, net banking, and wallets digitally.',
                  badge: 'Online',
                },
                {
                  value: 'stripe',
                  label: 'Stripe',
                  icon: 'credit_score',
                  hint: 'Global card payments with 135+ currencies supported.',
                  badge: 'Global',
                },
                {
                  value: 'both',
                  label: 'Cash + Online',
                  icon: 'account_balance_wallet',
                  hint: 'Let customers choose between cash or digital payment.',
                  badge: 'Flexible',
                },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSettings((s) => ({ ...s, payment_provider: opt.value }))}
                  className={`relative rounded-xl border-2 p-5 text-left transition-all hover:shadow-md ${
                    settings.payment_provider === opt.value
                      ? 'border-primary bg-primary/5 shadow-md'
                      : 'border-outline-variant bg-surface-container-low hover:border-primary/40'
                  }`}
                >
                  {settings.payment_provider === opt.value && (
                    <span className="absolute top-3 right-3 material-symbols-outlined text-primary text-lg icon-fill">
                      check_circle
                    </span>
                  )}
                  <span className={`material-symbols-outlined text-2xl mb-2 ${settings.payment_provider === opt.value ? 'text-primary' : 'text-on-surface-variant'}`}>
                    {opt.icon}
                  </span>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold text-sm">{opt.label}</p>
                    <span className="text-xs bg-gold/30 text-on-surface px-2 py-0.5 rounded-full font-semibold">{opt.badge}</span>
                  </div>
                  <p className="text-xs text-on-surface-variant leading-relaxed">{opt.hint}</p>
                </button>
              ))}
            </div>

            {(settings.payment_provider === 'razorpay') && (
              <div className="mt-2 rounded-xl border border-outline-variant bg-surface-container-low p-5 flex flex-col gap-4">
                <p className="text-sm font-bold text-on-surface">Razorpay API Keys</p>
                <Field label="Razorpay Key ID">
                  <input
                    value={settings.razorpay_key_id || ''}
                    onChange={set('razorpay_key_id')}
                    className={INPUT_CLS}
                    placeholder="rzp_live_xxxxxxxxxxxx"
                  />
                </Field>
                <Field label="Razorpay Key Secret">
                  <input
                    type="password"
                    value={settings.razorpay_key_secret || ''}
                    onChange={set('razorpay_key_secret')}
                    className={INPUT_CLS}
                    placeholder="••••••••••••"
                  />
                </Field>
              </div>
            )}

            {(settings.payment_provider === 'stripe') && (
              <div className="mt-2 rounded-xl border border-outline-variant bg-surface-container-low p-5 flex flex-col gap-4">
                <p className="text-sm font-bold text-on-surface">Stripe API Keys</p>
                <Field label="Stripe Publishable Key">
                  <input
                    value={settings.stripe_publishable_key || ''}
                    onChange={set('stripe_publishable_key')}
                    className={INPUT_CLS}
                    placeholder="pk_live_xxxxxxxxxxxx"
                  />
                </Field>
                <Field label="Stripe Secret Key">
                  <input
                    type="password"
                    value={settings.stripe_secret_key || ''}
                    onChange={set('stripe_secret_key')}
                    className={INPUT_CLS}
                    placeholder="sk_live_••••••••••••"
                  />
                </Field>
              </div>
            )}
          </SectionCard>
        )}

        {/* ══════════ OPERATING HOURS ══════════ */}
        {activeTab === 'hours' && (
          <SectionCard title="Operating Hours" icon="schedule">
            <p className="text-sm text-on-surface-variant">Set the hours your store accepts orders each day of the week.</p>
            <div className="space-y-3">
              {DAYS.map((day) => {
                const h = hours[day] || { open: true, from: '10:00', to: '22:00' };
                return (
                  <div
                    key={day}
                    className={`flex flex-wrap items-center gap-4 rounded-xl px-5 py-3.5 border transition-colors ${
                      h.open ? 'border-outline-variant bg-surface-container-low' : 'border-outline-variant/40 bg-surface-container-low/40 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3 w-36">
                      <Toggle
                        checked={h.open}
                        onChange={() => setHourField(day, 'open', !h.open)}
                      />
                      <span className="text-sm font-semibold">{day}</span>
                    </div>
                    {h.open ? (
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <input
                          type="time"
                          value={h.from}
                          onChange={(e) => setHourField(day, 'from', e.target.value)}
                          className="px-3 py-2 rounded-lg border border-outline-variant bg-background text-sm focus:border-primary focus:outline-none"
                        />
                        <span className="text-on-surface-variant text-sm font-medium">to</span>
                        <input
                          type="time"
                          value={h.to}
                          onChange={(e) => setHourField(day, 'to', e.target.value)}
                          className="px-3 py-2 rounded-lg border border-outline-variant bg-background text-sm focus:border-primary focus:outline-none"
                        />
                      </div>
                    ) : (
                      <span className="text-sm text-on-surface-variant italic">Closed</span>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  const all = {};
                  DAYS.forEach((d) => { all[d] = { open: true, from: '10:00', to: '22:00' }; });
                  setHours(all);
                }}
                className="text-sm font-semibold text-primary hover:underline"
              >
                Open All Days (10:00 – 22:00)
              </button>
              <span className="text-outline-variant">|</span>
              <button
                type="button"
                onClick={() => setHours(DEFAULT_HOURS)}
                className="text-sm font-semibold text-on-surface-variant hover:underline"
              >
                Reset to Defaults
              </button>
            </div>
          </SectionCard>
        )}

        {/* ══════════ NOTIFICATIONS ══════════ */}
        {activeTab === 'alerts' && (
          <SectionCard title="Notifications & Alerts" icon="notifications">
            {[
              {
                key: 'new_order_alerts',
                label: 'New Order Alerts',
                icon: 'notifications_active',
                hint: 'Ring the kitchen bell whenever a new online order arrives.',
              },
              {
                key: 'inventory_warnings',
                label: 'Inventory Warnings',
                icon: 'warning',
                hint: `Highlight ingredients falling below the low-stock threshold (${settings.low_stock_threshold || 20} units).`,
              },
              {
                key: 'marketing_summaries',
                label: 'Weekly Marketing Digest',
                icon: 'bar_chart',
                hint: 'Receive a weekly email summarising top-sellers, revenue, and customer trends.',
              },
              {
                key: 'order_status_sms',
                label: 'Order Status SMS',
                icon: 'sms',
                hint: 'Text customers automatically when their order status changes.',
              },
              {
                key: 'daily_sales_report',
                label: 'Daily Sales Report',
                icon: 'summarize',
                hint: 'Auto-generate an end-of-day sales summary sent to the support email.',
              },
            ].map(({ key, label, icon, hint }) => (
              <div
                key={key}
                className="flex items-center justify-between gap-4 rounded-xl bg-surface-container-low border border-outline-variant px-5 py-4"
              >
                <div className="flex items-start gap-4 min-w-0">
                  <span className={`material-symbols-outlined text-xl mt-0.5 shrink-0 ${
                    settings[key] === 'true' ? 'text-primary' : 'text-on-surface-variant'
                  }`}>{icon}</span>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm">{label}</p>
                    <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">{hint}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`text-xs font-bold ${settings[key] === 'true' ? 'text-primary' : 'text-on-surface-variant'}`}>
                    {settings[key] === 'true' ? 'ON' : 'OFF'}
                  </span>
                  <Toggle checked={settings[key] === 'true'} onChange={toggle(key)} />
                </div>
              </div>
            ))}
          </SectionCard>
        )}

        {/* ══════════ ADVANCED ══════════ */}
        {activeTab === 'advanced' && (
          <>
            <SectionCard title="Advanced Configuration" icon="tune">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field label="Max Items Per Order" hint="Prevent abnormally large single orders.">
                  <input
                    type="number" min="1"
                    value={settings.max_items_per_order || ''}
                    onChange={set('max_items_per_order')}
                    className={INPUT_CLS}
                    placeholder="20"
                  />
                </Field>
                <Field label="Max Active Orders" hint="Kitchen capacity limit. 0 = unlimited.">
                  <input
                    type="number" min="0"
                    value={settings.max_active_orders || ''}
                    onChange={set('max_active_orders')}
                    className={INPUT_CLS}
                    placeholder="50"
                  />
                </Field>
                <Field label="Prep Time Buffer (min)" hint="Extra time added to estimated delivery for kitchen prep.">
                  <input
                    type="number" min="0"
                    value={settings.prep_time_buffer || ''}
                    onChange={set('prep_time_buffer')}
                    className={INPUT_CLS}
                    placeholder="10"
                  />
                </Field>
                <Field label="Auto-Cancel After (min)" hint="Auto-cancel unconfirmed orders after this many minutes. 0 = never.">
                  <input
                    type="number" min="0"
                    value={settings.auto_cancel_minutes || ''}
                    onChange={set('auto_cancel_minutes')}
                    className={INPUT_CLS}
                    placeholder="60"
                  />
                </Field>
              </div>

              <div className="border-t border-outline-variant pt-4 flex flex-col gap-3">
                {[
                  { key: 'allow_guest_orders', label: 'Allow Guest Orders', hint: 'Let customers order without creating an account.' },
                  { key: 'require_phone', label: 'Require Phone Number', hint: 'Make phone number mandatory at checkout.' },
                  { key: 'show_ratings', label: 'Show Pizza Ratings', hint: 'Display star ratings on the menu page.' },
                  { key: 'show_stock_count', label: 'Show Stock Count', hint: 'Display remaining stock on product pages.' },
                ].map(({ key, label, hint }) => (
                  <div key={key} className="flex items-center justify-between rounded-xl bg-surface-container-low border border-outline-variant px-5 py-3.5">
                    <div>
                      <p className="text-sm font-semibold">{label}</p>
                      <p className="text-xs text-on-surface-variant mt-0.5">{hint}</p>
                    </div>
                    <Toggle checked={settings[key] === 'true'} onChange={toggle(key)} />
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* Danger zone */}
            <div className="bg-background border-2 border-red-300 rounded-2xl overflow-hidden">
              <div className="flex items-center gap-3 px-6 py-4 border-b border-red-200 bg-red-50">
                <span className="material-symbols-outlined text-red-600 text-xl">dangerous</span>
                <h2 className="font-display text-base font-bold text-red-700">Danger Zone</h2>
              </div>
              <div className="p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50/50 px-5 py-4">
                  <div>
                    <p className="font-semibold text-sm text-red-700">Reset to Factory Defaults</p>
                    <p className="text-xs text-red-600/80 mt-0.5">Wipe all custom settings and restore original values.</p>
                  </div>
                  <button
                    type="button"
                    onClick={resetDefaults}
                    className="shrink-0 px-4 py-2 rounded-lg border-2 border-red-500 text-red-600 text-sm font-bold hover:bg-red-500 hover:text-white transition-colors"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── save bar ──────────────────────────────────────────── */}
        <div className="flex items-center justify-between bg-background border border-outline-variant rounded-2xl px-6 py-4 sticky bottom-4 shadow-lg">
          <p className="text-sm text-on-surface-variant hidden sm:block">Changes are saved to the database and take effect immediately.</p>
          <button
            type="submit"
            disabled={saving}
            className="ml-auto flex items-center gap-2 bg-primary hover:bg-primary-hover text-white font-bold px-8 py-3 rounded-full shadow-glow transition-all hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving
              ? <><span className="material-symbols-outlined animate-spin text-lg">progress_activity</span> Saving…</>
              : <><span className="material-symbols-outlined text-lg">save</span> Save Settings</>
            }
          </button>
        </div>
      </form>
    </AdminLayout>
  );
}

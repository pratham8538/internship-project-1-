import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Menu from './pages/Menu';
import PizzaDetails from './pages/PizzaDetails';
import CustomBuilder from './pages/CustomBuilder';
import About from './pages/About';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import TrackOrder from './pages/TrackOrder';
import Profile from './pages/Profile';

import Dashboard from './pages/admin/Dashboard';
import Reports from './pages/admin/Reports';
import AdminOrders from './pages/admin/Orders';
import Inventory from './pages/admin/Inventory';
import Customers from './pages/admin/Customers';
import Staff from './pages/admin/Staff';
import Settings from './pages/admin/Settings';

function StorefrontLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col">{children}</main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<StorefrontLayout><Home /></StorefrontLayout>} />
      <Route path="/login" element={<StorefrontLayout><Login /></StorefrontLayout>} />
      <Route path="/register" element={<StorefrontLayout><Register /></StorefrontLayout>} />
      <Route path="/menu" element={<StorefrontLayout><Menu /></StorefrontLayout>} />
      <Route path="/pizza/:id" element={<StorefrontLayout><PizzaDetails /></StorefrontLayout>} />
      <Route path="/builder" element={<StorefrontLayout><CustomBuilder /></StorefrontLayout>} />
      <Route path="/about" element={<StorefrontLayout><About /></StorefrontLayout>} />
      <Route path="/cart" element={<StorefrontLayout><Cart /></StorefrontLayout>} />
      <Route path="/checkout" element={<StorefrontLayout><Checkout /></StorefrontLayout>} />
      <Route path="/order-success/:id" element={<StorefrontLayout><OrderSuccess /></StorefrontLayout>} />
      <Route path="/track-order" element={<StorefrontLayout><TrackOrder /></StorefrontLayout>} />
      <Route path="/profile" element={<StorefrontLayout><ProtectedRoute><Profile /></ProtectedRoute></StorefrontLayout>} />

      <Route path="/admin" element={<AdminRoute><Dashboard /></AdminRoute>} />
      <Route path="/admin/reports" element={<AdminRoute><Reports /></AdminRoute>} />
      <Route path="/admin/orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />
      <Route path="/admin/inventory" element={<AdminRoute><Inventory /></AdminRoute>} />
      <Route path="/admin/customers" element={<AdminRoute><Customers /></AdminRoute>} />
      <Route path="/admin/staff" element={<AdminRoute><Staff /></AdminRoute>} />
      <Route path="/admin/settings" element={<AdminRoute><Settings /></AdminRoute>} />

      <Route path="*" element={<StorefrontLayout><div className="text-center py-32 text-on-surface-variant">404 — Page not found</div></StorefrontLayout>} />
    </Routes>
  );
}

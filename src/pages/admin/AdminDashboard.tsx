import { NavLink, Navigate, Route, Routes } from 'react-router-dom';
import { Inbox, LayoutGrid, LogOut, Package } from 'lucide-react';
import { signOutAdmin, useAuth } from '../../lib/auth';
import { Container } from '../../components/ui';
import { AdminProductList } from './AdminProductList';
import { AdminProductForm } from './AdminProductForm';
import { AdminCategories } from './AdminCategories';
import { AdminRequestsInbox } from './AdminRequestsInbox';

const tabClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
    isActive ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200/70'
  }`;

export const AdminDashboard = () => {
  const { user } = useAuth();

  return (
    <Container className="py-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Admin</h1>
          <p className="text-xs text-slate-500">Signed in as {user?.email}</p>
        </div>
        <button
          onClick={() => void signOutAdmin()}
          className="self-start inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign out
        </button>
      </div>

      <nav className="flex flex-wrap gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 w-fit">
        <NavLink to="/admin/products" className={tabClass}>
          <Package className="w-3.5 h-3.5" /> Products
        </NavLink>
        <NavLink to="/admin/categories" className={tabClass}>
          <LayoutGrid className="w-3.5 h-3.5" /> Categories
        </NavLink>
        <NavLink to="/admin/requests" className={tabClass}>
          <Inbox className="w-3.5 h-3.5" /> Requests
        </NavLink>
      </nav>

      <Routes>
        <Route index element={<Navigate to="products" replace />} />
        <Route path="products" element={<AdminProductList />} />
        <Route path="products/new" element={<AdminProductForm mode="create" />} />
        <Route path="products/:id" element={<AdminProductForm mode="edit" />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="requests" element={<AdminRequestsInbox />} />
        <Route path="*" element={<Navigate to="products" replace />} />
      </Routes>
    </Container>
  );
};

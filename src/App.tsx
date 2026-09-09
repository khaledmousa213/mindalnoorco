import { lazy, Suspense, useEffect, type ReactNode } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { CatalogPage } from './pages/CatalogPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { QuoteModalProvider } from './components/QuoteModalProvider';
import { PageLoader } from './components/ui';
import { useAuth } from './lib/auth';

const LoginPage = lazy(() =>
  import('./pages/admin/LoginPage').then((m) => ({ default: m.LoginPage })),
);
const AdminDashboard = lazy(() =>
  import('./pages/admin/AdminDashboard').then((m) => ({ default: m.AdminDashboard })),
);

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);
  return null;
}

function RequireAdmin({ children }: { children: ReactNode }) {
  const { isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center py-32 text-sm text-slate-500">
        Checking access…
      </div>
    );
  }
  if (!isAdmin) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }
  return <>{children}</>;
}

export default function App() {
  const location = useLocation();
  const isAdminArea = location.pathname.startsWith('/admin');

  return (
    <QuoteModalProvider>
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-teal-600 selection:text-white">
        <ScrollToTop />
        <Header />
        <main className="flex-1 flex flex-col">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/catalog" element={<CatalogPage />} />
              <Route path="/product/:slug" element={<ProductDetailPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/admin/login" element={<LoginPage />} />
              <Route
                path="/admin/*"
                element={
                  <RequireAdmin>
                    <AdminDashboard />
                  </RequireAdmin>
                }
              />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </main>
        {!isAdminArea && <Footer />}
      </div>
    </QuoteModalProvider>
  );
}

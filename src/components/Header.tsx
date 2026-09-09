import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ChevronDown, LayoutGrid, Lock, Menu, ShieldCheck, X } from 'lucide-react';
import { MindAlnoorLogo } from './MindAlnoorLogo';
import { MindrayLogo } from './MindrayLogo';
import { useCategories } from '../hooks/useCatalog';
import { useAuth } from '../lib/auth';
import { useQuoteModal } from './QuoteModalProvider';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
    isActive
      ? 'bg-teal-600 text-white shadow-sm'
      : 'text-slate-700 hover:text-teal-700 hover:bg-teal-50/70'
  }`;

export const Header = () => {
  const { data: categories } = useCategories();
  const { isAdmin } = useAuth();
  const { open: openQuote } = useQuoteModal();
  const location = useLocation();

  const [catOpen, setCatOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const catRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCatOpen(false);
    setMobileOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (catRef.current && !catRef.current.contains(e.target as Node)) setCatOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 text-slate-900 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-3">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2 sm:gap-3 group shrink-0" title="Mind Alnoor Co. — Home">
          <MindAlnoorLogo className="w-9 h-9 sm:w-11 sm:h-11 transition-transform group-hover:scale-105 shrink-0" />
          <div className="leading-tight">
            <span className="text-base sm:text-lg font-black tracking-tight flex items-center gap-1">
              <span className="text-sky-600">Mind</span>
              <span className="text-teal-600">Alnoor</span>
              <span className="text-lime-600 font-extrabold">Co.</span>
            </span>
            <span className="hidden sm:flex items-center gap-1 text-[10px] text-slate-500 font-medium">
              <span>Authorized distributor of</span>
              <MindrayLogo className="h-2.5 inline-block" />
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100/90 p-1.5 rounded-full border border-slate-200/80">
          <NavLink to="/" end className={navLinkClass}>
            Home
          </NavLink>
          <NavLink to="/catalog" className={navLinkClass}>
            Catalog
          </NavLink>

          <div className="relative" ref={catRef}>
            <button
              onClick={() => setCatOpen((v) => !v)}
              className="px-3.5 py-1.5 rounded-full text-xs font-bold text-slate-700 hover:text-teal-700 hover:bg-teal-50/70 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <LayoutGrid className="w-3.5 h-3.5 text-teal-500" />
              <span>Categories</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${catOpen ? 'rotate-180' : ''}`} />
            </button>
            {catOpen && categories.length > 0 && (
              <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50">
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/catalog?category=${encodeURIComponent(cat.slug)}`}
                    className="block px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-teal-700 transition"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <NavLink to="/about" className={navLinkClass}>
            About
          </NavLink>
          <NavLink to="/contact" className={navLinkClass}>
            Contact
          </NavLink>
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => openQuote({ source: 'header' })}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-teal-600 to-sky-600 hover:from-teal-500 hover:to-sky-500 text-white shadow-sm transition cursor-pointer"
          >
            Request a quote
          </button>

          {isAdmin ? (
            <Link
              to="/admin"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-full text-xs font-bold transition shadow-sm border border-slate-700"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-lime-400" />
              <span className="hidden sm:inline">Admin</span>
            </Link>
          ) : (
            <Link
              to="/admin/login"
              className="hidden md:inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-teal-700 rounded-full text-xs font-bold transition border border-slate-200"
              title="Admin sign in"
            >
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span>Sign in</span>
            </Link>
          )}

          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden p-2 rounded-full hover:bg-slate-100 text-slate-700 transition cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1">
          {[
            { to: '/', label: 'Home', end: true },
            { to: '/catalog', label: 'Catalog' },
            { to: '/about', label: 'About' },
            { to: '/contact', label: 'Contact' },
          ].map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-xl text-sm font-bold ${
                  isActive ? 'bg-teal-50 text-teal-700' : 'text-slate-700 hover:bg-slate-50'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
          {categories.length > 0 && (
            <div className="pt-2 mt-1 border-t border-slate-100">
              <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Categories
              </span>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/catalog?category=${encodeURIComponent(cat.slug)}`}
                  className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          )}
          <button
            onClick={() => openQuote({ source: 'header' })}
            className="w-full mt-2 px-3 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-teal-600 to-sky-600 text-white"
          >
            Request a quote
          </button>
          {!isAdmin && (
            <Link
              to="/admin/login"
              className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-50"
            >
              Admin sign in
            </Link>
          )}
        </div>
      )}
    </header>
  );
};

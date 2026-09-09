import { Link } from 'react-router-dom';
import { Mail, MapPin, PhoneCall } from 'lucide-react';
import { MindAlnoorLogo } from './MindAlnoorLogo';
import { MindrayLogo } from './MindrayLogo';
import { useCategories } from '../hooks/useCatalog';
import { COMPANY } from '../lib/company';

export const Footer = () => {
  const { data: categories } = useCategories();

  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <MindAlnoorLogo className="w-10 h-10" />
              <div>
                <span className="text-lg font-black tracking-tight text-white flex items-center gap-1">
                  <span className="text-sky-400">Mind</span>
                  <span className="text-teal-400">Alnoor</span>
                  <span className="text-lime-400">Co.</span>
                </span>
                <p className="text-[11px] text-slate-400 font-medium">
                  شركة العقل والنور للأجهزة الطبية
                </p>
              </div>
            </Link>

            <p className="text-slate-400 leading-relaxed max-w-sm">
              Supplier of diagnostic ultrasound, digital radiography, and surgical imaging systems for
              hospitals and clinics — with installation, clinical training, and after-sales service.
            </p>

            <div className="flex items-center gap-2 text-slate-300">
              <span>Authorized distributor of</span>
              <MindrayLogo className="h-3 bg-white px-1.5 py-0.5 rounded" />
            </div>

            <div className="space-y-2 pt-1">
              <div className="flex items-center gap-2.5 text-slate-300">
                <MapPin className="w-4 h-4 text-teal-400 shrink-0" />
                <span>{COMPANY.addressLine}</span>
              </div>
              <a href={`tel:${COMPANY.phoneHref}`} className="flex items-center gap-2.5 text-slate-300 hover:text-teal-400 transition">
                <PhoneCall className="w-4 h-4 text-teal-400 shrink-0" />
                <span>{COMPANY.phoneDisplay}</span>
              </a>
              <a href={`mailto:${COMPANY.email}`} className="flex items-center gap-2.5 text-slate-300 hover:text-teal-400 transition">
                <Mail className="w-4 h-4 text-teal-400 shrink-0" />
                <span>{COMPANY.email}</span>
              </a>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-white font-bold uppercase tracking-wider">Catalog</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/catalog" className="hover:text-teal-400 transition">
                  All products
                </Link>
              </li>
              {categories.slice(0, 6).map((cat) => (
                <li key={cat.id}>
                  <Link
                    to={`/catalog?category=${encodeURIComponent(cat.slug)}`}
                    className="hover:text-teal-400 transition"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-white font-bold uppercase tracking-wider">Company</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="hover:text-teal-400 transition">
                  About Mind Alnoor
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-teal-400 transition">
                  Contact &amp; quote requests
                </Link>
              </li>
              <li>
                <Link to="/admin/login" className="hover:text-teal-400 transition">
                  Staff sign in
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <span>© {new Date().getFullYear()} Mind Alnoor Co. All rights reserved.</span>
          <span>{COMPANY.city}</span>
        </div>
      </div>
    </footer>
  );
};

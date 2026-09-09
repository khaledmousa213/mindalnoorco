import { Link } from 'react-router-dom';
import { usePageMeta } from '../lib/meta';

export const NotFoundPage = () => {
  usePageMeta('Page not found');
  return (
    <div className="flex-1 flex items-center justify-center px-4 py-24">
      <div className="text-center space-y-4 max-w-md">
        <p className="text-5xl font-black text-slate-900">404</p>
        <p className="text-sm text-slate-500">
          We couldn&apos;t find that page. It may have moved or the link is out of date.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            to="/"
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition"
          >
            Go home
          </Link>
          <Link
            to="/catalog"
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition"
          >
            Browse catalog
          </Link>
        </div>
      </div>
    </div>
  );
};

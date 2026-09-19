import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useCategories } from '../../hooks/useCatalog';
import { EmptyState, ErrorNote, PageLoader } from '../../components/ui';

const FIXED_PAGES = [
  { id: 'home', label: 'Home', path: '/' },
  { id: 'about', label: 'About', path: '/about' },
  { id: 'contact', label: 'Contact', path: '/contact' },
];

const rowClass =
  'group flex items-center justify-between gap-3 p-4 bg-white border border-slate-200 hover:border-teal-400 rounded-2xl transition';

export const AdminPageBuilder = () => {
  const { data: categories, loading, error } = useCategories();

  return (
    <div className="space-y-8">
      <p className="text-sm text-slate-500 max-w-2xl">
        Pick a page to rearrange its sections by drag and drop, add new ones, or delete ones you don&apos;t
        want. To change the text or pictures inside a section, open the page on the site while signed
        in and click the text or picture.
      </p>

      <section className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Pages</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {FIXED_PAGES.map((page) => (
            <Link key={page.id} to={`/admin/pages/${page.id}`} className={rowClass}>
              <span className="font-bold text-sm text-slate-900">{page.label}</span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 group-hover:translate-x-0.5 transition" />
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Category pages
        </h2>
        <p className="text-xs text-slate-500">
          Every category has its own layout. Until you change one, it uses the standard layout.
        </p>
        {error ? (
          <ErrorNote message={`Could not load categories: ${error}`} />
        ) : loading ? (
          <PageLoader />
        ) : categories.length === 0 ? (
          <EmptyState
            title="No categories yet"
            description="Create categories in the Categories tab, then customise their pages here."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {categories.map((cat) => (
              <Link key={cat.id} to={`/admin/pages/category:${cat.id}`} className={rowClass}>
                <span className="min-w-0">
                  <span className="block font-bold text-sm text-slate-900 truncate">{cat.name}</span>
                  {cat.parentId && (
                    <span className="block text-[11px] text-slate-400">Sub-category</span>
                  )}
                </span>
                <ArrowRight className="w-4 h-4 shrink-0 text-slate-400 group-hover:text-teal-600 group-hover:translate-x-0.5 transition" />
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

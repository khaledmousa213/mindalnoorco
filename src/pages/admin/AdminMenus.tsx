import { useState } from 'react';
import { ErrorNote } from '../../components/ui';
import { NavLinkEditor } from '../../components/NavLinkEditor';
import { useSiteNav } from '../../hooks/useSiteNav';
import { setSiteNavList, type NavLinkItem, type SiteNav } from '../../lib/siteNav';

const MENUS: { key: keyof SiteNav; label: string; hint: string }[] = [
  { key: 'header', label: 'Top menu', hint: 'Links in the bar at the top of every page.' },
  { key: 'footerCompany', label: 'Footer · Company links', hint: 'The “Company” column at the bottom of every page.' },
];

/** Edit the site's menu links (label + path), drag to reorder. Changes go live immediately. */
export function AdminMenus() {
  const nav = useSiteNav();
  const [error, setError] = useState('');

  const save = (key: keyof SiteNav, items: NavLinkItem[]) => {
    setError('');
    setSiteNavList(key, items).catch(() =>
      setError('That change could not be saved. Check you are signed in as an admin and try again.'),
    );
  };

  return (
    <div className="space-y-4">
      {error && <ErrorNote message={error} />}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {MENUS.map((menu) => (
          <div key={menu.key} className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-sm">
            <div>
              <h2 className="text-sm font-black text-slate-900">{menu.label}</h2>
              <p className="text-[11px] text-slate-500">
                {menu.hint} Click a name or path to change it; drag to reorder.
              </p>
            </div>
            <NavLinkEditor items={nav[menu.key]} onChange={(items) => save(menu.key, items)} />
          </div>
        ))}
      </div>
    </div>
  );
}

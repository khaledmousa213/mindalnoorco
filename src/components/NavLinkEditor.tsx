import { InlineEditable } from './InlineEditable';
import { EditableItemList } from './EditableItemList';
import type { NavLinkItem } from '../lib/siteNav';

function randomId(): string {
  return Math.random().toString(36).slice(2, 10);
}

/** Admin-only list editor for a set of nav links (label + path each). */
export function NavLinkEditor({
  items,
  onChange,
  dark = false,
}: {
  items: NavLinkItem[];
  onChange: (items: NavLinkItem[]) => void;
  /** Use light text/dark rows, for the dark footer. */
  dark?: boolean;
}) {
  return (
    <EditableItemList
      items={items}
      isAdmin
      layout="list"
      listClassName="space-y-1.5"
      itemClassName={`rounded-lg border pl-2.5 pr-14 py-1.5 ${
        dark ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'
      }`}
      addLabel="Add link"
      onChange={onChange}
      newItem={() => ({ id: randomId(), label: 'New link', path: '/' })}
      renderItem={(item, update) => (
        <div className="flex items-center gap-2 min-w-0">
          <InlineEditable
            value={item.label}
            onCommit={(label) => update({ label })}
            className={`text-xs font-semibold ${dark ? 'text-slate-100' : 'text-slate-800'}`}
          />
          <InlineEditable
            value={item.path}
            onCommit={(path) => update({ path })}
            className="text-[10px] font-mono text-slate-400"
          />
        </div>
      )}
    />
  );
}

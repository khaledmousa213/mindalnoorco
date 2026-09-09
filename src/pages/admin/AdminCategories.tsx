import { useState, type FormEvent } from 'react';
import { Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import { useCategories, useProducts } from '../../hooks/useCatalog';
import {
  createCategory,
  deleteCategory,
  getNextCategoryOrder,
  slugify,
  updateCategory,
} from '../../lib/categories';
import { EmptyState, ErrorNote, PageLoader } from '../../components/ui';
import type { Category } from '../../lib/types';

const inputClass =
  'w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition';

type Editing = { id?: string; name: string; description: string };

export const AdminCategories = () => {
  const { data: categories, loading, error } = useCategories();
  const { data: products } = useProducts({});
  const [editing, setEditing] = useState<Editing | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const startNew = () => setEditing({ name: '', description: '' });
  const startEdit = (c: Category) =>
    setEditing({ id: c.id, name: c.name, description: c.description });

  const save = async (e: FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    try {
      const payload = {
        name: editing.name.trim(),
        slug: slugify(editing.name),
        description: editing.description.trim(),
      };
      if (editing.id) {
        await updateCategory(editing.id, payload);
      } else {
        await createCategory({ ...payload, order: await getNextCategoryOrder() });
      }
      setEditing(null);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    await deleteCategory(id);
    setConfirmId(null);
  };

  const countFor = (id: string) => products.filter((p) => p.categoryId === id).length;

  return (
    <div className="space-y-4">
      {editing ? (
        <form onSubmit={save} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 max-w-lg">
          <h2 className="text-sm font-black text-slate-900">
            {editing.id ? 'Edit category' : 'New category'}
          </h2>
          <label className="block space-y-1">
            <span className="text-xs font-bold text-slate-700">Name *</span>
            <input
              type="text"
              required
              value={editing.name}
              onChange={(e) => setEditing({ ...editing, name: e.target.value })}
              className={inputClass}
            />
            <span className="text-[11px] text-slate-400 font-mono">/catalog?category={slugify(editing.name) || '…'}</span>
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-bold text-slate-700">Description</span>
            <textarea
              rows={2}
              value={editing.description}
              onChange={(e) => setEditing({ ...editing, description: e.target.value })}
              className={inputClass}
            />
          </label>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-2 disabled:opacity-60"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              Save
            </button>
          </div>
        </form>
      ) : (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">{categories.length} categories</p>
          <button
            onClick={startNew}
            className="inline-flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition"
          >
            <Plus className="w-3.5 h-3.5" /> Add category
          </button>
        </div>
      )}

      {error ? (
        <ErrorNote message={`Could not load categories: ${error}`} />
      ) : loading ? (
        <PageLoader />
      ) : categories.length === 0 && !editing ? (
        <EmptyState title="No categories yet" description="Add categories so products can be grouped and filtered." />
      ) : (
        !editing && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {categories.map((c) => (
              <div key={c.id} className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 text-sm">{c.name}</h3>
                    <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                      {countFor(c.id)} products
                    </span>
                  </div>
                  {c.description && <p className="text-xs text-slate-500 mt-1 leading-relaxed">{c.description}</p>}
                </div>
                <div className="flex items-center justify-end gap-1 pt-3 mt-3 border-t border-slate-100">
                  <button
                    onClick={() => startEdit(c)}
                    className="p-1.5 text-teal-700 hover:bg-teal-50 rounded-lg cursor-pointer"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  {confirmId === c.id ? (
                    <span className="flex items-center gap-1">
                      <button
                        onClick={() => remove(c.id)}
                        className="px-2 py-1 bg-rose-600 text-white rounded text-[10px] font-bold cursor-pointer"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => setConfirmId(null)}
                        className="px-1.5 text-slate-500 text-[10px] cursor-pointer"
                      >
                        Cancel
                      </button>
                    </span>
                  ) : (
                    <button
                      onClick={() => setConfirmId(c.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};

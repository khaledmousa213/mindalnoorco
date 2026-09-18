import { useRef, useState, type FormEvent } from 'react';
import { FolderTree, ImageOff, Loader2, Pencil, Plus, Trash2, Upload, X } from 'lucide-react';
import { useCategories, useProducts } from '../../hooks/useCatalog';
import {
  buildCategoryTree,
  createCategory,
  deleteCategory,
  getNextCategoryOrder,
  slugify,
  updateCategory,
} from '../../lib/categories';
import { deleteStorageFile, uploadCategoryImage, IMAGE_ACCEPT, MAX_IMAGE_BYTES } from '../../lib/storage';
import { EmptyState, ErrorNote, PageLoader } from '../../components/ui';
import type { Category } from '../../lib/types';

const inputClass =
  'w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition';

type Editing = { id?: string; name: string; description: string; parentId: string; imageUrl: string };

export const AdminCategories = () => {
  const { data: categories, loading, error } = useCategories();
  const { data: products } = useProducts({});
  const [editing, setEditing] = useState<Editing | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const tree = buildCategoryTree(categories);
  const topLevelOptions = categories.filter((c) => !c.parentId);

  const startNew = (parentId = '') => setEditing({ name: '', description: '', parentId, imageUrl: '' });
  const startEdit = (c: Category) =>
    setEditing({ id: c.id, name: c.name, description: c.description, parentId: c.parentId, imageUrl: c.imageUrl });

  const handleImage = async (file: File | undefined) => {
    if (!file || !editing) return;
    if (file.size > MAX_IMAGE_BYTES) return;
    setUploading(true);
    try {
      const url = await uploadCategoryImage(file);
      if (editing.imageUrl) void deleteStorageFile(editing.imageUrl);
      setEditing({ ...editing, imageUrl: url });
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = '';
    }
  };

  const save = async (e: FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    try {
      const payload = {
        name: editing.name.trim(),
        slug: slugify(editing.name),
        description: editing.description.trim(),
        parentId: editing.parentId,
        imageUrl: editing.imageUrl,
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

  const CategoryCard = ({ c, isSub }: { c: Category; isSub?: boolean }) => (
    <div
      className={`bg-white border rounded-2xl p-4 flex flex-col justify-between ${
        isSub ? 'border-slate-200/80' : 'border-slate-200 shadow-xs'
      }`}
    >
      <div className="flex gap-3">
        <div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
          {c.imageUrl ? (
            <img src={c.imageUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <ImageOff className="w-5 h-5 text-slate-300" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-bold text-slate-900 text-sm truncate">{c.name}</h3>
            <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full shrink-0">
              {countFor(c.id)} products
            </span>
          </div>
          {c.description && (
            <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">{c.description}</p>
          )}
        </div>
      </div>
      <div className="flex items-center justify-end gap-1 pt-3 mt-3 border-t border-slate-100">
        {!isSub && (
          <button
            onClick={() => startNew(c.id)}
            className="mr-auto text-[11px] font-bold text-teal-700 hover:text-teal-900 hover:underline cursor-pointer flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Sub-category
          </button>
        )}
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
  );

  return (
    <div className="space-y-4">
      {editing ? (
        <form onSubmit={save} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 max-w-lg">
          <h2 className="text-sm font-black text-slate-900">
            {editing.id ? 'Edit category' : editing.parentId ? 'New sub-category' : 'New category'}
          </h2>

          <label className="block space-y-1">
            <span className="text-xs font-bold text-slate-700">Parent category</span>
            <select
              value={editing.parentId}
              onChange={(e) => setEditing({ ...editing, parentId: e.target.value })}
              className={inputClass}
            >
              <option value="">— Top-level category —</option>
              {topLevelOptions
                .filter((c) => c.id !== editing.id)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </select>
          </label>

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

          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-700">Card image</span>
            {editing.imageUrl ? (
              <div className="relative w-full h-32 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                <img src={editing.imageUrl} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    void deleteStorageFile(editing.imageUrl);
                    setEditing({ ...editing, imageUrl: '' });
                  }}
                  className="absolute top-1.5 right-1.5 bg-white/90 hover:bg-white text-rose-600 rounded-full p-1 shadow cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                disabled={uploading}
                className="w-full py-6 border border-dashed border-slate-300 rounded-xl text-xs text-slate-400 hover:border-teal-400 hover:text-teal-600 transition flex flex-col items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                <span>Upload a card image (optional)</span>
              </button>
            )}
            <input
              ref={fileInput}
              type="file"
              accept={IMAGE_ACCEPT}
              hidden
              onChange={(e) => handleImage(e.target.files?.[0])}
            />
          </div>

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
              disabled={saving || uploading}
              className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-2 disabled:opacity-60"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              Save
            </button>
          </div>
        </form>
      ) : (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500 flex items-center gap-1.5">
            <FolderTree className="w-4 h-4 text-slate-400" />
            {categories.length} categories total
          </p>
          <button
            onClick={() => startNew()}
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
          <div className="space-y-5">
            {tree.map((node) => (
              <div key={node.id} className="space-y-2.5">
                <CategoryCard c={node} />
                {node.children.length > 0 && (
                  <div className="pl-5 sm:pl-8 border-l-2 border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {node.children.map((child) => (
                      <CategoryCard key={child.id} c={child} isSub />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};

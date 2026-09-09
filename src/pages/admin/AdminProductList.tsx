import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, ArrowUp, ExternalLink, ImageOff, Pencil, Plus, Sparkles, Trash2 } from 'lucide-react';
import { useProducts } from '../../hooks/useCatalog';
import { deleteProduct, reorderProducts, updateProduct } from '../../lib/products';
import { deleteStorageFile } from '../../lib/storage';
import { EmptyState, ErrorNote, PageLoader } from '../../components/ui';
import type { Product } from '../../lib/types';

export const AdminProductList = () => {
  const { data: products, loading, error } = useProducts({});
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const move = async (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= products.length || busy) return;
    setBusy(true);
    const ids = products.map((p) => p.id);
    [ids[index], ids[target]] = [ids[target], ids[index]];
    try {
      await reorderProducts(ids);
    } finally {
      setBusy(false);
    }
  };

  const toggle = (p: Product, key: 'isPublished' | 'isFeatured') =>
    updateProduct(p.id, { [key]: !p[key] });

  const remove = async (p: Product) => {
    setBusy(true);
    try {
      await deleteProduct(p.id);
      await Promise.all([
        ...p.images.map(deleteStorageFile),
        p.datasheetUrl ? deleteStorageFile(p.datasheetUrl) : Promise.resolve(),
      ]);
    } finally {
      setBusy(false);
      setConfirmId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          {products.length} product{products.length === 1 ? '' : 's'}
        </p>
        <Link
          to="/admin/products/new"
          className="inline-flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition"
        >
          <Plus className="w-3.5 h-3.5" /> Add product
        </Link>
      </div>

      {error ? (
        <ErrorNote message={`Could not load products: ${error}`} />
      ) : loading ? (
        <PageLoader />
      ) : products.length === 0 ? (
        <EmptyState
          title="No products yet"
          description="Add your first product — it appears on the public catalog as soon as it is published."
          action={
            <Link
              to="/admin/products/new"
              className="inline-flex items-center gap-1.5 bg-teal-600 text-white text-xs font-bold px-3.5 py-2 rounded-xl"
            >
              <Plus className="w-3.5 h-3.5" /> Add product
            </Link>
          }
        />
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="py-3 px-3 w-16 text-center">Order</th>
                  <th className="py-3 px-3">Product</th>
                  <th className="py-3 px-3 hidden sm:table-cell">Category</th>
                  <th className="py-3 px-3 text-center">Published</th>
                  <th className="py-3 px-3 text-center">Featured</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p, index) => (
                  <tr key={p.id} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-3">
                      <div className="flex items-center justify-center gap-0.5">
                        <button
                          onClick={() => move(index, -1)}
                          disabled={index === 0 || busy}
                          className="p-1 text-slate-400 hover:text-slate-900 disabled:opacity-20 cursor-pointer"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => move(index, 1)}
                          disabled={index === products.length - 1 || busy}
                          className="p-1 text-slate-400 hover:text-slate-900 disabled:opacity-20 cursor-pointer"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                          {p.images[0] ? (
                            <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <ImageOff className="w-4 h-4 text-slate-300" />
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{p.name}</div>
                          <div className="text-[11px] text-slate-400">{p.brand || '—'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 hidden sm:table-cell">
                      {p.categoryName || '—'}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => toggle(p, 'isPublished')}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition cursor-pointer ${
                          p.isPublished
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        {p.isPublished ? 'Live' : 'Draft'}
                      </button>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => toggle(p, 'isFeatured')}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition cursor-pointer ${
                          p.isFeatured
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                        }`}
                      >
                        <Sparkles className="w-3 h-3" />
                        {p.isFeatured ? 'Yes' : 'No'}
                      </button>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center justify-end gap-1">
                        <a
                          href={`/product/${p.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-100"
                          title="View on site"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <Link
                          to={`/admin/products/${p.id}`}
                          className="p-1.5 text-teal-700 hover:bg-teal-50 rounded-lg"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        {confirmId === p.id ? (
                          <span className="flex items-center gap-1">
                            <button
                              onClick={() => remove(p)}
                              disabled={busy}
                              className="px-2 py-1 bg-rose-600 text-white rounded text-[10px] font-bold cursor-pointer disabled:opacity-50"
                            >
                              Delete
                            </button>
                            <button
                              onClick={() => setConfirmId(null)}
                              className="px-1.5 py-1 text-slate-500 text-[10px] cursor-pointer"
                            >
                              Cancel
                            </button>
                          </span>
                        ) : (
                          <button
                            onClick={() => setConfirmId(p.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

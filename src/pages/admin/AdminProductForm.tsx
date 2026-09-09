import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  GripVertical,
  ImageOff,
  Loader2,
  Plus,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { useCategories } from '../../hooks/useCatalog';
import {
  createProduct,
  getNextOrder,
  getProduct,
  isSlugTaken,
  updateProduct,
} from '../../lib/products';
import { slugify } from '../../lib/categories';
import {
  DATASHEET_ACCEPT,
  IMAGE_ACCEPT,
  MAX_DATASHEET_BYTES,
  MAX_IMAGE_BYTES,
  deleteStorageFile,
  uploadDatasheet,
  uploadProductImage,
} from '../../lib/storage';
import { PageLoader } from '../../components/ui';
import type { ProductDraft, ProductSpecRow } from '../../lib/types';

const EMPTY: ProductDraft = {
  slug: '',
  name: '',
  brand: 'Mindray',
  categoryId: '',
  categoryName: '',
  shortDescription: '',
  description: '',
  images: [],
  keyFeatures: [],
  specs: [],
  priceRange: '',
  datasheetUrl: '',
  isFeatured: false,
  isPublished: true,
  order: 0,
};

const inputClass =
  'w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition';
const labelClass = 'text-xs font-bold text-slate-700';

export const AdminProductForm = ({ mode }: { mode: 'create' | 'edit' }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data: categories } = useCategories();

  const [form, setForm] = useState<ProductDraft>(EMPTY);
  const [slugEdited, setSlugEdited] = useState(mode === 'edit');
  const [loading, setLoading] = useState(mode === 'edit');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const imageInput = useRef<HTMLInputElement>(null);
  const pdfInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (mode !== 'edit' || !id) return;
    getProduct(id)
      .then((p) => {
        if (!p) {
          setError('Product not found.');
          return;
        }
        setForm({
          slug: p.slug,
          name: p.name,
          brand: p.brand,
          categoryId: p.categoryId,
          categoryName: p.categoryName,
          shortDescription: p.shortDescription,
          description: p.description,
          images: p.images,
          keyFeatures: p.keyFeatures,
          specs: p.specs,
          priceRange: p.priceRange,
          datasheetUrl: p.datasheetUrl,
          isFeatured: p.isFeatured,
          isPublished: p.isPublished,
          order: p.order,
        });
      })
      .finally(() => setLoading(false));
  }, [mode, id]);

  const set = <K extends keyof ProductDraft>(key: K, value: ProductDraft[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const onNameChange = (name: string) => {
    setForm((f) => ({
      ...f,
      name,
      slug: slugEdited ? f.slug : slugify(name),
    }));
  };

  const onCategoryChange = (categoryId: string) => {
    const cat = categories.find((c) => c.id === categoryId);
    setForm((f) => ({ ...f, categoryId, categoryName: cat?.name ?? '' }));
  };

  const handleImageFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    setError('');
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        if (file.size > MAX_IMAGE_BYTES) {
          setError(`"${file.name}" is larger than 8 MB and was skipped.`);
          continue;
        }
        uploaded.push(await uploadProductImage(file));
      }
      setForm((f) => ({ ...f, images: [...f.images, ...uploaded] }));
    } catch {
      setError('Image upload failed. Check your connection and Storage rules, then try again.');
    } finally {
      setUploading(false);
      if (imageInput.current) imageInput.current.value = '';
    }
  };

  const removeImage = (url: string) => {
    setForm((f) => ({ ...f, images: f.images.filter((i) => i !== url) }));
    void deleteStorageFile(url);
  };

  const moveImage = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    setForm((f) => {
      if (target < 0 || target >= f.images.length) return f;
      const images = f.images.slice();
      [images[index], images[target]] = [images[target], images[index]];
      return { ...f, images };
    });
  };

  const handlePdf = async (file: File | undefined) => {
    if (!file) return;
    if (file.size > MAX_DATASHEET_BYTES) {
      setError('The datasheet must be 20 MB or smaller.');
      return;
    }
    setUploading(true);
    setError('');
    try {
      const url = await uploadDatasheet(file);
      if (form.datasheetUrl) void deleteStorageFile(form.datasheetUrl);
      set('datasheetUrl', url);
    } catch {
      setError('Datasheet upload failed. Please try again.');
    } finally {
      setUploading(false);
      if (pdfInput.current) pdfInput.current.value = '';
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    const slug = slugify(form.slug || form.name);
    if (!slug) {
      setError('Please provide a name or slug.');
      return;
    }
    if (!form.categoryId) {
      setError('Please choose a category.');
      return;
    }

    setSaving(true);
    try {
      if (await isSlugTaken(slug, mode === 'edit' ? id : undefined)) {
        setError(`The slug "${slug}" is already used by another product. Change it and try again.`);
        setSaving(false);
        return;
      }

      const payload: ProductDraft = {
        ...form,
        slug,
        name: form.name.trim(),
        brand: form.brand.trim(),
        keyFeatures: form.keyFeatures.map((s) => s.trim()).filter(Boolean),
        specs: form.specs
          .map((r) => ({ label: r.label.trim(), value: r.value.trim() }))
          .filter((r) => r.label || r.value),
      };

      if (mode === 'create') {
        payload.order = await getNextOrder();
        await createProduct(payload);
      } else if (id) {
        await updateProduct(id, payload);
      }
      navigate('/admin/products');
    } catch {
      setError('Could not save the product. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const datasheetName = useMemo(() => {
    if (!form.datasheetUrl) return '';
    try {
      return decodeURIComponent(form.datasheetUrl.split('/').pop()?.split('?')[0] ?? 'datasheet.pdf');
    } catch {
      return 'datasheet.pdf';
    }
  }, [form.datasheetUrl]);

  if (loading) return <PageLoader label="Loading product…" />;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <Link
          to="/admin/products"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to products
        </Link>
        <h2 className="text-sm font-black text-slate-900">
          {mode === 'create' ? 'New product' : 'Edit product'}
        </h2>
      </div>

      {error && (
        <p className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl p-3">
          {error}
        </p>
      )}

      {/* Basics */}
      <section className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="space-y-1 sm:col-span-2">
            <span className={labelClass}>Product name *</span>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => onNameChange(e.target.value)}
              className={inputClass}
            />
          </label>

          <label className="space-y-1">
            <span className={labelClass}>URL slug</span>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => {
                setSlugEdited(true);
                set('slug', e.target.value);
              }}
              className={`${inputClass} font-mono`}
            />
            <span className="text-[11px] text-slate-400">/product/{slugify(form.slug || form.name) || '…'}</span>
          </label>

          <label className="space-y-1">
            <span className={labelClass}>Brand</span>
            <input
              type="text"
              list="brand-options"
              value={form.brand}
              onChange={(e) => set('brand', e.target.value)}
              className={inputClass}
            />
            <datalist id="brand-options">
              <option value="Mindray" />
            </datalist>
          </label>

          <label className="space-y-1">
            <span className={labelClass}>Category *</span>
            <select
              required
              value={form.categoryId}
              onChange={(e) => onCategoryChange(e.target.value)}
              className={inputClass}
            >
              <option value="">Select a category…</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {categories.length === 0 && (
              <span className="text-[11px] text-amber-600">
                No categories yet — <Link to="/admin/categories" className="underline">add one first</Link>.
              </span>
            )}
          </label>

          <label className="space-y-1">
            <span className={labelClass}>Price / pricing note</span>
            <input
              type="text"
              value={form.priceRange}
              onChange={(e) => set('priceRange', e.target.value)}
              placeholder="e.g. Request a quote"
              className={inputClass}
            />
          </label>

          <label className="space-y-1 sm:col-span-2">
            <span className={labelClass}>Short description</span>
            <input
              type="text"
              value={form.shortDescription}
              onChange={(e) => set('shortDescription', e.target.value)}
              placeholder="One line shown on product cards"
              className={inputClass}
            />
          </label>

          <label className="space-y-1 sm:col-span-2">
            <span className={labelClass}>Full description</span>
            <textarea
              rows={5}
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              className={inputClass}
            />
          </label>
        </div>

        <div className="flex flex-wrap gap-4 pt-1">
          <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={(e) => set('isPublished', e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
            />
            Published (visible on the site)
          </label>
          <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isFeatured}
              onChange={(e) => set('isFeatured', e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
            />
            Featured on the homepage
          </label>
        </div>
      </section>

      {/* Images */}
      <section className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className={labelClass}>Images</span>
          <button
            type="button"
            onClick={() => imageInput.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-900 disabled:opacity-50 cursor-pointer"
          >
            {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
            Upload
          </button>
          <input
            ref={imageInput}
            type="file"
            accept={IMAGE_ACCEPT}
            multiple
            hidden
            onChange={(e) => handleImageFiles(e.target.files)}
          />
        </div>

        {form.images.length === 0 ? (
          <button
            type="button"
            onClick={() => imageInput.current?.click()}
            className="w-full py-8 border border-dashed border-slate-300 rounded-xl text-xs text-slate-400 hover:border-teal-400 hover:text-teal-600 transition flex flex-col items-center gap-2 cursor-pointer"
          >
            <ImageOff className="w-6 h-6" />
            Click to upload product photos (first image is the main one)
          </button>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {form.images.map((url, index) => (
              <div key={url} className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                <img src={url} alt="" className="w-full h-24 object-cover" />
                {index === 0 && (
                  <span className="absolute top-1 left-1 text-[9px] font-bold bg-slate-900/90 text-white px-1.5 py-0.5 rounded">
                    Main
                  </span>
                )}
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-slate-900/80 px-1.5 py-1 opacity-0 group-hover:opacity-100 transition">
                  <button
                    type="button"
                    onClick={() => moveImage(index, -1)}
                    disabled={index === 0}
                    className="text-white/80 hover:text-white disabled:opacity-30 text-[10px] font-bold cursor-pointer"
                  >
                    ←
                  </button>
                  <GripVertical className="w-3 h-3 text-white/40" />
                  <button
                    type="button"
                    onClick={() => moveImage(index, 1)}
                    disabled={index === form.images.length - 1}
                    className="text-white/80 hover:text-white disabled:opacity-30 text-[10px] font-bold cursor-pointer"
                  >
                    →
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => removeImage(url)}
                  className="absolute top-1 right-1 bg-white/90 hover:bg-white text-rose-600 rounded-full p-0.5 shadow cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Datasheet */}
      <section className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
        <span className={labelClass}>Datasheet (PDF)</span>
        {form.datasheetUrl ? (
          <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
            <a
              href={form.datasheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-teal-700 truncate"
            >
              <FileText className="w-4 h-4 text-teal-600 shrink-0" />
              <span className="truncate">{datasheetName}</span>
            </a>
            <button
              type="button"
              onClick={() => {
                void deleteStorageFile(form.datasheetUrl);
                set('datasheetUrl', '');
              }}
              className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => pdfInput.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-900 disabled:opacity-50 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" /> Upload PDF
          </button>
        )}
        <input
          ref={pdfInput}
          type="file"
          accept={DATASHEET_ACCEPT}
          hidden
          onChange={(e) => handlePdf(e.target.files?.[0])}
        />
      </section>

      {/* Key features */}
      <RepeatableList
        title="Key features"
        addLabel="Add feature"
        rows={form.keyFeatures}
        onChange={(rows) => set('keyFeatures', rows)}
        render={(value, onChange) => (
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="e.g. 21.5-inch HD touchscreen"
            className={inputClass}
          />
        )}
        empty=""
      />

      {/* Specs */}
      <SpecEditor
        rows={form.specs}
        onChange={(rows) => set('specs', rows)}
      />

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-2 sticky bottom-0 bg-slate-50/95 backdrop-blur py-3">
        <Link
          to="/admin/products"
          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={saving || uploading}
          className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-black transition flex items-center gap-2 cursor-pointer disabled:opacity-60"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          {mode === 'create' ? 'Create product' : 'Save changes'}
        </button>
      </div>
    </form>
  );
};

function RepeatableList({
  title,
  addLabel,
  rows,
  onChange,
  render,
  empty,
}: {
  title: string;
  addLabel: string;
  rows: string[];
  onChange: (rows: string[]) => void;
  render: (value: string, onChange: (v: string) => void) => ReactNode;
  empty: string;
}) {
  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
      <div className="flex items-center justify-between">
        <span className={labelClass}>{title}</span>
        <button
          type="button"
          onClick={() => onChange([...rows, empty])}
          className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 hover:text-teal-900 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /> {addLabel}
        </button>
      </div>
      {rows.length === 0 && <p className="text-xs text-slate-400">None added.</p>}
      <div className="space-y-2">
        {rows.map((row, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="flex-1">
              {render(row, (v) => {
                const next = rows.slice();
                next[index] = v;
                onChange(next);
              })}
            </div>
            <button
              type="button"
              onClick={() => onChange(rows.filter((_, i) => i !== index))}
              className="p-1.5 text-slate-400 hover:text-rose-600 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

function SpecEditor({
  rows,
  onChange,
}: {
  rows: ProductSpecRow[];
  onChange: (rows: ProductSpecRow[]) => void;
}) {
  const update = (index: number, patch: Partial<ProductSpecRow>) => {
    const next = rows.slice();
    next[index] = { ...next[index], ...patch };
    onChange(next);
  };
  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
      <div className="flex items-center justify-between">
        <span className={labelClass}>Specifications</span>
        <button
          type="button"
          onClick={() => onChange([...rows, { label: '', value: '' }])}
          className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 hover:text-teal-900 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /> Add row
        </button>
      </div>
      {rows.length === 0 && <p className="text-xs text-slate-400">None added.</p>}
      <div className="space-y-2">
        {rows.map((row, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              type="text"
              value={row.label}
              onChange={(e) => update(index, { label: e.target.value })}
              placeholder="Label"
              className={`${inputClass} sm:w-1/3`}
            />
            <input
              type="text"
              value={row.value}
              onChange={(e) => update(index, { value: e.target.value })}
              placeholder="Value"
              className={`${inputClass} flex-1`}
            />
            <button
              type="button"
              onClick={() => onChange(rows.filter((_, i) => i !== index))}
              className="p-1.5 text-slate-400 hover:text-rose-600 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
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
import { buildCategoryTree, slugify } from '../../lib/categories';
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
import type { ProductDraft, ProductProbe, ProductSpecRow } from '../../lib/types';

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
  photos: [],
  probes: [],
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
  // Features and specs are edited as plain text (one per line) and parsed on save.
  const [featuresText, setFeaturesText] = useState('');
  const [specsText, setSpecsText] = useState('');
  const [slugEdited, setSlugEdited] = useState(mode === 'edit');
  const [loading, setLoading] = useState(mode === 'edit');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const imageInput = useRef<HTMLInputElement>(null);
  const photoInput = useRef<HTMLInputElement>(null);
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
          photos: p.photos,
          probes: p.probes,
          isFeatured: p.isFeatured,
          isPublished: p.isPublished,
          order: p.order,
        });
        setFeaturesText(p.keyFeatures.join('\n'));
        setSpecsText(specsToText(p.specs));
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

  const handleImageFiles = (files: FileList | null) => uploadImagesInto('images', files, imageInput.current);
  const handlePhotoFiles = (files: FileList | null) => uploadImagesInto('photos', files, photoInput.current);

  const uploadImagesInto = async (
    key: 'images' | 'photos',
    files: FileList | null,
    input: HTMLInputElement | null,
  ) => {
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
      setForm((f) => ({ ...f, [key]: [...f[key], ...uploaded] }));
    } catch {
      setError('Image upload failed. Check your connection and Storage rules, then try again.');
    } finally {
      setUploading(false);
      if (input) input.value = '';
    }
  };

  const removePhoto = (url: string) => {
    setForm((f) => ({ ...f, photos: f.photos.filter((i) => i !== url) }));
    void deleteStorageFile(url);
  };

  const uploadProbeImage = async (file: File): Promise<string | null> => {
    if (file.size > MAX_IMAGE_BYTES) {
      setError(`"${file.name}" is larger than 8 MB.`);
      return null;
    }
    setUploading(true);
    setError('');
    try {
      return await uploadProductImage(file);
    } catch {
      setError('Image upload failed. Check your connection and try again.');
      return null;
    } finally {
      setUploading(false);
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
      setError('The catalog PDF must be 20 MB or smaller.');
      return;
    }
    setUploading(true);
    setError('');
    try {
      const url = await uploadDatasheet(file);
      if (form.datasheetUrl) void deleteStorageFile(form.datasheetUrl);
      set('datasheetUrl', url);
    } catch {
      setError('Catalog upload failed. Please try again.');
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
        keyFeatures: featuresText.split('\n').map((s) => s.trim()).filter(Boolean),
        specs: textToSpecs(specsText),
        probes: form.probes
          .map((pr) => ({ ...pr, name: pr.name.trim(), description: pr.description.trim() }))
          .filter((pr) => pr.name || pr.image),
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
              {buildCategoryTree(categories).map((top) =>
                top.children.length > 0 ? (
                  <optgroup key={top.id} label={top.name}>
                    <option value={top.id}>{top.name} (general)</option>
                    {top.children.map((child) => (
                      <option key={child.id} value={child.id}>
                        {'  '}
                        {child.name}
                      </option>
                    ))}
                  </optgroup>
                ) : (
                  <option key={top.id} value={top.id}>
                    {top.name}
                  </option>
                ),
              )}
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

      {/* Real photos */}
      <section className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className={labelClass}>Real photos</span>
            <p className="text-[11px] text-slate-400">
              Photos of the system installed or in use. Shown in their own section on the product page.
            </p>
          </div>
          <button
            type="button"
            onClick={() => photoInput.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-900 disabled:opacity-50 cursor-pointer"
          >
            {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
            Upload
          </button>
          <input
            ref={photoInput}
            type="file"
            accept={IMAGE_ACCEPT}
            multiple
            hidden
            onChange={(e) => handlePhotoFiles(e.target.files)}
          />
        </div>
        {form.photos.length === 0 ? (
          <p className="text-xs text-slate-400">None added.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {form.photos.map((url) => (
              <div key={url} className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                <img src={url} alt="" className="w-full h-24 object-cover" />
                <button
                  type="button"
                  onClick={() => removePhoto(url)}
                  className="absolute top-1 right-1 bg-white/90 hover:bg-white text-rose-600 rounded-full p-0.5 shadow cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Catalog PDF */}
      <section className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
        <div>
          <span className={labelClass}>Catalog (PDF)</span>
          <p className="text-[11px] text-slate-400">
            Shown as a “Catalog” button under the product details. PDF only, up to 20 MB.
          </p>
        </div>
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
      <section className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2">
        <div>
          <span className={labelClass}>Key features</span>
          <p className="text-[11px] text-slate-400">One feature per line. Each line is shown with a ✓ next to the picture.</p>
        </div>
        <textarea
          rows={6}
          value={featuresText}
          onChange={(e) => setFeaturesText(e.target.value)}
          placeholder={'21.5-inch HD touchscreen\nAI-assisted measurements\nFull-featured cardiac package'}
          className={`${inputClass} leading-relaxed`}
        />
      </section>

      {/* Specs */}
      <section className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2">
        <div>
          <span className={labelClass}>Specifications</span>
          <p className="text-[11px] text-slate-400">
            One per line. Write “Name: value” to show it as a table row (e.g. “Monitor: 21.5-inch LED”); a line
            without a colon is shown as plain text.
          </p>
        </div>
        <textarea
          rows={10}
          value={specsText}
          onChange={(e) => setSpecsText(e.target.value)}
          placeholder={'Monitor: 21.5-inch HD LED\nTouch screen: 13.3-inch\nTransducer ports: 4 active\nWeight: approx. 95 kg'}
          className={`${inputClass} font-mono text-[13px] leading-relaxed`}
        />
      </section>

      {/* Probes */}
      <ProbeEditor
        probes={form.probes}
        onChange={(probes) => set('probes', probes)}
        upload={uploadProbeImage}
        uploading={uploading}
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

/** "Label: value" per line; a line without a colon becomes a full-width text row. */
function specsToText(rows: ProductSpecRow[]): string {
  return rows.map((r) => (r.label ? `${r.label}: ${r.value}` : r.value)).join('\n');
}

function textToSpecs(text: string): ProductSpecRow[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const colon = line.indexOf(':');
      // Only treat a short prefix as a label, so "https://..." or prose with a colon stays plain text.
      if (colon > 0 && colon <= 40 && !line.slice(0, colon).includes('//')) {
        return { label: line.slice(0, colon).trim(), value: line.slice(colon + 1).trim() };
      }
      return { label: '', value: line };
    });
}

function ProbeEditor({
  probes,
  onChange,
  upload,
  uploading,
}: {
  probes: ProductProbe[];
  onChange: (probes: ProductProbe[]) => void;
  upload: (file: File) => Promise<string | null>;
  uploading: boolean;
}) {
  const update = (id: string, patch: Partial<ProductProbe>) =>
    onChange(probes.map((p) => (p.id === id ? { ...p, ...patch } : p)));

  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <span className={labelClass}>Probes</span>
          <p className="text-[11px] text-slate-400">
            For ultrasound systems. A name is enough — the picture and description are optional.
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            onChange([...probes, { id: Math.random().toString(36).slice(2, 10), name: '', description: '', image: '' }])
          }
          className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 hover:text-teal-900 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /> Add probe
        </button>
      </div>
      {probes.length === 0 && <p className="text-xs text-slate-400">None added.</p>}
      <div className="space-y-3">
        {probes.map((probe) => (
          <div key={probe.id} className="flex gap-3 border border-slate-200 rounded-xl p-3">
            <label
              className={`relative w-24 h-24 shrink-0 rounded-lg overflow-hidden border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center text-slate-400 hover:border-teal-400 hover:text-teal-600 transition ${
                uploading ? 'opacity-60' : 'cursor-pointer'
              }`}
              title={probe.image ? 'Change picture' : 'Upload picture'}
            >
              {probe.image ? (
                <img src={probe.image} alt="" className="w-full h-full object-contain bg-white" />
              ) : (
                <span className="flex flex-col items-center gap-1 text-[10px] font-semibold text-center leading-tight">
                  <Upload className="w-4 h-4" /> Picture
                  <span className="font-normal">(optional)</span>
                </span>
              )}
              <input
                type="file"
                accept={IMAGE_ACCEPT}
                hidden
                disabled={uploading}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  e.target.value = '';
                  if (!file) return;
                  const url = await upload(file);
                  if (!url) return;
                  if (probe.image) void deleteStorageFile(probe.image);
                  update(probe.id, { image: url });
                }}
              />
            </label>
            <div className="flex-1 space-y-2 min-w-0">
              <input
                type="text"
                value={probe.name}
                onChange={(e) => update(probe.id, { name: e.target.value })}
                placeholder="Probe name, e.g. SC6-1U Convex"
                className={inputClass}
              />
              <textarea
                rows={2}
                value={probe.description}
                onChange={(e) => update(probe.id, { description: e.target.value })}
                placeholder="Short description (optional), e.g. Abdominal, OB/GYN · 1–6 MHz"
                className={inputClass}
              />
            </div>
            <button
              type="button"
              onClick={() => {
                if (probe.image) void deleteStorageFile(probe.image);
                onChange(probes.filter((p) => p.id !== probe.id));
              }}
              className="self-start p-1.5 text-slate-400 hover:text-rose-600 cursor-pointer"
              title="Remove probe"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

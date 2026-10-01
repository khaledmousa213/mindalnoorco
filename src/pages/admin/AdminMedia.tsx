import { useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Film, ImageOff, ImagePlus, Loader2, Plus, Trash2 } from 'lucide-react';
import { ErrorNote, PageLoader } from '../../components/ui';
import { TextField } from './fields';
import { usePageBuilder } from '../../hooks/usePageBuilder';
import { updateBlockProps } from '../../lib/pageBlocks';
import {
  IMAGE_ACCEPT,
  MAX_IMAGE_BYTES,
  MAX_VIDEO_BYTES,
  VIDEO_ACCEPT,
  deleteStorageFile,
  uploadContentImage,
  uploadContentVideo,
} from '../../lib/storage';
import { newHeroSlide, readHeroSliderProps } from '../../components/blocks/HeroSliderBlock';
import { readSectionProps } from '../../components/blocks/SectionBlock';
import { parseVideoUrl } from '../../components/blocks/video';
import type { Block, HeroSlide, PageElement } from '../../components/blocks/types';

const PAGES: { id: string; label: string }[] = [
  { id: 'home', label: 'Home page' },
  { id: 'about', label: 'About page' },
  { id: 'contact', label: 'Contact page' },
];

/**
 * One place to manage every picture and video on the site pages, listed by
 * name ("Home page · Slider 1").
 */
export function AdminMedia() {
  return (
    <div className="space-y-8">
      <p className="text-xs text-slate-500 max-w-2xl">
        Every picture and video shown on the site pages. Upload a file and it appears on the live site
        straight away. Product and category pictures are managed in the{' '}
        <Link to="/admin/products" className="font-bold text-teal-700 hover:underline">
          Products
        </Link>{' '}
        and{' '}
        <Link to="/admin/categories" className="font-bold text-teal-700 hover:underline">
          Categories
        </Link>{' '}
        tabs.
      </p>
      {PAGES.map((page) => (
        <PageMedia key={page.id} pageId={page.id} label={page.label} />
      ))}
    </div>
  );
}

function PageMedia({ pageId, label }: { pageId: string; label: string }) {
  const { blocks, loading } = usePageBuilder(pageId);
  const [error, setError] = useState('');

  // Default blocks have no Firestore doc yet; usePageBuilder is writing them now.
  const ready = !loading && blocks.every((b) => !b.id.startsWith('default-'));

  const save = async (block: Block, patch: Record<string, unknown>) => {
    setError('');
    try {
      await updateBlockProps(block.id, { ...block.props, ...patch });
    } catch {
      setError('That change could not be saved. Check you are signed in as an admin and try again.');
      throw new Error('save failed');
    }
  };

  const slots: ReactNode[] = [];
  if (ready) {
    let sliderCount = 0;
    let sectionCount = 0;
    blocks.forEach((block) => {
      if (block.type === 'heroSlider') {
        sliderCount += 1;
        slots.push(
          <SliderSlots
            key={block.id}
            prefix={`${label} · ${sliderCount > 1 ? `Slider set ${sliderCount} · ` : ''}Slider`}
            block={block}
            onSave={(patch) => save(block, patch)}
          />,
        );
      } else if (block.type === 'section') {
        sectionCount += 1;
        const { elements } = readSectionProps(block.props);
        const media = elements.filter((e) => e.type === 'image' || e.type === 'video' || e.type === 'gallery');
        const kindName = { image: 'Picture', video: 'Video', gallery: 'Photo gallery' } as const;
        media.forEach((element, i) => {
          const name = `${label} · Section ${sectionCount} · ${kindName[element.type as keyof typeof kindName]}${
            media.length > 1 ? ` ${i + 1}` : ''
          }`;
          const patchElement = (patch: Partial<PageElement>) =>
            save(block, {
              elements: elements.map((e) => (e.id === element.id ? ({ ...e, ...patch } as PageElement) : e)),
            });
          slots.push(
            element.type === 'image' ? (
              <MediaCard key={element.id} title={name}>
                <Preview image={element.url} />
                <UploadRow kind="image" current={element.url} onUploaded={(url) => patchElement({ url })} />
              </MediaCard>
            ) : element.type === 'video' ? (
              <MediaCard key={element.id} title={name}>
                <Preview video={element.url} />
                <UploadRow kind="video" current={element.url} onUploaded={(url) => patchElement({ url })} />
                <LinkField value={element.url} onSave={(url) => patchElement({ url })} />
              </MediaCard>
            ) : element.type === 'gallery' ? (
              <MediaCard key={element.id} title={name}>
                <GalleryEditor images={element.images} onChange={(images) => patchElement({ images })} />
              </MediaCard>
            ) : null,
          );
        });
      }
    });
  }

  return (
    <section className="space-y-3">
      <h2 className="text-base font-black text-slate-900">{label}</h2>
      {error && <ErrorNote message={error} />}
      {!ready ? (
        <PageLoader label="Preparing this page…" />
      ) : slots.length === 0 ? (
        <p className="text-xs text-slate-400">This page has no pictures or videos yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">{slots}</div>
      )}
    </section>
  );
}

function SliderSlots({
  prefix,
  block,
  onSave,
}: {
  prefix: string;
  block: Block;
  onSave: (patch: Record<string, unknown>) => Promise<void>;
}) {
  const { slides } = readHeroSliderProps(block.props);
  const setSlides = (next: HeroSlide[]) => onSave({ slides: next });
  const patchSlide = (id: string, patch: Partial<HeroSlide>) =>
    setSlides(slides.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  return (
    <>
      {slides.map((slide, index) => (
        <MediaCard
          key={slide.id}
          title={`${prefix} ${index + 1}`}
          action={
            slides.length > 1 && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`Delete ${prefix} ${index + 1}?`)) {
                    void setSlides(slides.filter((s) => s.id !== slide.id));
                  }
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                title="Delete this slide"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )
          }
        >
          <Preview image={slide.image} video={slide.media === 'video' ? slide.video : ''} />
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-fit">
            {(['image', 'video'] as const).map((media) => (
              <button
                key={media}
                type="button"
                onClick={() => void patchSlide(slide.id, { media })}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  slide.media === media ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {media === 'image' ? 'Picture' : 'Video'}
              </button>
            ))}
          </div>
          {slide.media === 'video' && (
            <>
              <UploadRow kind="video" current={slide.video} onUploaded={(video) => patchSlide(slide.id, { video })} />
              <LinkField value={slide.video} onSave={(video) => patchSlide(slide.id, { video })} />
            </>
          )}
          <UploadRow
            kind="image"
            label={slide.media === 'video' ? 'Cover picture (shown while the video loads)' : undefined}
            current={slide.image}
            onUploaded={(image) => patchSlide(slide.id, { image })}
          />
        </MediaCard>
      ))}
      <button
        type="button"
        onClick={() => void setSlides([...slides, newHeroSlide()])}
        className="min-h-40 rounded-2xl border-2 border-dashed border-slate-300 hover:border-teal-500 text-slate-500 hover:text-teal-700 flex flex-col items-center justify-center gap-1 text-xs font-bold transition cursor-pointer"
      >
        <Plus className="w-5 h-5" />
        Add {prefix} {slides.length + 1}
      </button>
    </>
  );
}

function GalleryEditor({ images, onChange }: { images: string[]; onChange: (images: string[]) => Promise<void> }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const onFiles = async (files: FileList) => {
    setError('');
    setBusy(true);
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        if (file.size > MAX_IMAGE_BYTES) {
          setError(`"${file.name}" is larger than 8 MB and was skipped.`);
          continue;
        }
        uploaded.push(await uploadContentImage(file));
      }
      if (uploaded.length) await onChange([...images, ...uploaded]);
    } catch {
      setError('Upload failed — check you are signed in and try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-2">
      {images.length === 0 ? (
        <div className="aspect-video rounded-xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-center gap-1 text-slate-400">
          <ImageOff className="w-6 h-6" />
          <span className="text-[11px] font-semibold">No photos yet</span>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {images.map((url) => (
            <div key={url} className="relative aspect-[4/3] rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
              <img src={url} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => {
                  void onChange(images.filter((i) => i !== url)).then(() => deleteStorageFile(url));
                }}
                className="absolute top-1 right-1 p-1 rounded-full bg-white/90 text-rose-600 hover:bg-white shadow cursor-pointer"
                title="Remove photo"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition cursor-pointer disabled:opacity-60"
        >
          {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ImagePlus className="w-3.5 h-3.5" />}
          {busy ? 'Uploading…' : 'Add photos'}
        </button>
        <span className="text-[10px] text-slate-400">You can pick several at once · max 8 MB each</span>
      </div>
      {error && <p className="text-[11px] font-bold text-rose-600">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept={IMAGE_ACCEPT}
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) void onFiles(e.target.files);
          e.target.value = '';
        }}
      />
    </div>
  );
}

function MediaCard({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-black text-slate-900">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}

function Preview({ image, video }: { image?: string; video?: string }) {
  const source = parseVideoUrl(video ?? '');
  return (
    <div className="aspect-video rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
      {source.kind === 'file' ? (
        <video src={source.src} poster={image || undefined} muted loop autoPlay playsInline className="w-full h-full object-cover" />
      ) : source.kind === 'embed' ? (
        <iframe src={source.src} title="Video preview" className="w-full h-full" allowFullScreen loading="lazy" />
      ) : image ? (
        <img src={image} alt="" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-slate-400">
          <ImageOff className="w-6 h-6" />
          <span className="text-[11px] font-semibold">Nothing uploaded yet</span>
        </div>
      )}
    </div>
  );
}

function UploadRow({
  kind,
  label,
  current,
  onUploaded,
}: {
  kind: 'image' | 'video';
  label?: string;
  current: string;
  onUploaded: (url: string) => Promise<void>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const max = kind === 'image' ? MAX_IMAGE_BYTES : MAX_VIDEO_BYTES;

  const onFile = async (file: File) => {
    if (file.size > max) {
      setError(`File is too large (max ${max / 1024 / 1024} MB).`);
      return;
    }
    setError('');
    setBusy(true);
    try {
      const url = await (kind === 'image' ? uploadContentImage : uploadContentVideo)(file);
      await onUploaded(url);
      if (current) void deleteStorageFile(current);
    } catch {
      setError('Upload failed — check you are signed in and try again.');
    } finally {
      setBusy(false);
    }
  };

  const Icon = kind === 'image' ? ImagePlus : Film;
  const isUploadedFile = kind === 'image' ? !!current : parseVideoUrl(current).kind === 'file';

  return (
    <div className="space-y-1">
      {label && <p className="text-[11px] text-slate-500">{label}</p>}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition cursor-pointer disabled:opacity-60"
        >
          {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Icon className="w-3.5 h-3.5" />}
          {busy ? 'Uploading…' : `${current ? 'Replace' : 'Upload'} ${kind === 'image' ? 'picture' : 'video'}`}
        </button>
        {isUploadedFile && !busy && (
          <button
            type="button"
            onClick={() => {
              void onUploaded('').then(() => deleteStorageFile(current));
            }}
            className="inline-flex items-center gap-1 px-2.5 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" /> Remove
          </button>
        )}
        <span className="text-[10px] text-slate-400">
          {kind === 'image' ? 'JPG, PNG or WebP · max 8 MB' : 'MP4 or WebM · max 60 MB'}
        </span>
      </div>
      {error && <p className="text-[11px] font-bold text-rose-600">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept={kind === 'image' ? IMAGE_ACCEPT : VIDEO_ACCEPT}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void onFile(file);
          e.target.value = '';
        }}
      />
    </div>
  );
}

function LinkField({ value, onSave }: { value: string; onSave: (url: string) => Promise<void> }) {
  const isLink = parseVideoUrl(value).kind === 'embed';
  return (
    <div className="space-y-1">
      <TextField
        label="…or paste a YouTube / Vimeo link"
        value={isLink ? value : ''}
        placeholder="https://www.youtube.com/watch?v=…"
        allowEmpty
        onSave={onSave}
      />
      {value && parseVideoUrl(value).kind === 'none' && (
        <p className="text-[11px] font-bold text-rose-600">That link isn&apos;t a YouTube, Vimeo or .mp4 address.</p>
      )}
    </div>
  );
}

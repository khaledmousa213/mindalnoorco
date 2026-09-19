import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ArrowLeft, ExternalLink, GripVertical, Plus, Trash2 } from 'lucide-react';
import { useCategories } from '../../hooks/useCatalog';
import { usePageBlocks } from '../../hooks/usePageBlocks';
import { createBlock, deleteBlock, reorderBlocks } from '../../lib/pageBlocks';
import { BLOCK_LABELS, paletteForPage, type PaletteEntry } from '../../components/blocks/palette';
import { EmptyState, ErrorNote, PageLoader } from '../../components/ui';
import type { Block } from '../../components/blocks/types';

const FIXED_LABELS: Record<string, { label: string; path: string }> = {
  home: { label: 'Home', path: '/' },
  about: { label: 'About', path: '/about' },
  contact: { label: 'Contact', path: '/contact' },
};

function blockSummary(block: Block): string {
  const p = block.props;
  const text = (p.heading as string) || (p.title as string) || (p.eyebrow as string) || (p.body as string);
  if (text) return text;
  if (Array.isArray(p.items)) return `${p.items.length} item${p.items.length === 1 ? '' : 's'}`;
  return 'Shows live catalog data';
}

export const AdminPageBuilderEditor = () => {
  const { pageId = '' } = useParams();
  const { data: categories } = useCategories();
  const { blocks, loading } = usePageBlocks(pageId);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));
  const palette = useMemo(() => paletteForPage(pageId), [pageId]);

  const category = pageId.startsWith('category:')
    ? categories.find((c) => `category:${c.id}` === pageId)
    : undefined;
  const fixed = FIXED_LABELS[pageId];
  const label = fixed?.label ?? category?.name ?? 'Unknown page';
  const publicPath = fixed?.path ?? (category ? `/category/${category.slug}` : '/');

  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    setError('');
    try {
      await action();
    } catch {
      setError('That change could not be saved. Check you are signed in as an admin and try again.');
    } finally {
      setBusy(false);
    }
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const from = blocks.findIndex((b) => b.id === active.id);
    const to = blocks.findIndex((b) => b.id === over.id);
    if (from === -1 || to === -1) return;
    void run(() => reorderBlocks(arrayMove(blocks, from, to).map((b) => b.id)));
  };

  const addBlock = (entry: PaletteEntry) => {
    setPaletteOpen(false);
    void run(async () => {
      await createBlock(pageId, entry.type, entry.defaultProps(), blocks.length);
    });
  };

  const remove = (id: string) => {
    setConfirmId(null);
    void run(() => deleteBlock(id));
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/admin/pages"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> All pages
        </Link>
        <a
          href={publicPath}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-900"
        >
          Open page to edit text and pictures <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      <div>
        <h2 className="text-lg font-black text-slate-900 tracking-tight">{label}</h2>
        <p className="text-xs text-slate-500">
          Drag a section by its handle to move it. Sections appear on the page top to bottom.
        </p>
      </div>

      {error && <ErrorNote message={error} />}

      {loading ? (
        <PageLoader />
      ) : blocks.length === 0 ? (
        <EmptyState
          title="This page is still using its standard layout"
          description="Open the page on the site while signed in as an admin — that sets up its sections so they can be rearranged here. Or add a section below to start from scratch."
          action={
            <a
              href={publicPath}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-slate-900 text-white text-xs font-bold px-3.5 py-2 rounded-xl"
            >
              Open page <ExternalLink className="w-3.5 h-3.5" />
            </a>
          }
        />
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {blocks.map((block) => (
                <BlockRow
                  key={block.id}
                  block={block}
                  busy={busy}
                  confirming={confirmId === block.id}
                  onAskDelete={() => setConfirmId(block.id)}
                  onCancelDelete={() => setConfirmId(null)}
                  onConfirmDelete={() => remove(block.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <div className="relative w-fit">
        <button
          onClick={() => setPaletteOpen((v) => !v)}
          disabled={busy}
          className="inline-flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition disabled:opacity-50 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /> Add section
        </button>
        {paletteOpen && (
          <div className="absolute left-0 z-20 mt-2 w-80 max-w-[85vw] bg-white border border-slate-200 rounded-2xl shadow-xl p-2 space-y-0.5">
            {palette.map((entry) => (
              <button
                key={entry.type}
                onClick={() => addBlock(entry)}
                className="w-full flex items-start gap-3 px-3 py-2 rounded-xl text-left hover:bg-teal-50 transition cursor-pointer"
              >
                <entry.icon className="w-4 h-4 mt-0.5 text-teal-600 shrink-0" />
                <span>
                  <span className="block text-xs font-bold text-slate-900">{entry.label}</span>
                  <span className="block text-[11px] text-slate-500">{entry.hint}</span>
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

function BlockRow({
  block,
  busy,
  confirming,
  onAskDelete,
  onCancelDelete,
  onConfirmDelete,
}: {
  block: Block;
  busy: boolean;
  confirming: boolean;
  onAskDelete: () => void;
  onCancelDelete: () => void;
  onConfirmDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between gap-3 bg-white border border-slate-200 rounded-xl px-3 py-2.5"
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <button
          {...attributes}
          {...listeners}
          className="p-1 text-slate-400 hover:text-slate-900 cursor-grab active:cursor-grabbing touch-none"
          title="Drag to reorder"
          aria-label="Drag to reorder"
        >
          <GripVertical className="w-4 h-4" />
        </button>
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-teal-600">
            {BLOCK_LABELS[block.type] ?? block.type}
          </p>
          <p className="text-xs text-slate-600 truncate">{blockSummary(block)}</p>
        </div>
      </div>

      {confirming ? (
        <span className="flex items-center gap-1 shrink-0">
          <button
            onClick={onConfirmDelete}
            disabled={busy}
            className="px-2 py-1 bg-rose-600 text-white rounded text-[10px] font-bold cursor-pointer disabled:opacity-50"
          >
            Delete
          </button>
          <button onClick={onCancelDelete} className="px-1.5 py-1 text-slate-500 text-[10px] cursor-pointer">
            Cancel
          </button>
        </span>
      ) : (
        <button
          onClick={onAskDelete}
          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg shrink-0 cursor-pointer"
          title="Delete section"
          aria-label="Delete section"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

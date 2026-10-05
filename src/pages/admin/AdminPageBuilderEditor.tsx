import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { useCategories } from '../../hooks/useCatalog';
import { usePageBlocks } from '../../hooks/usePageBlocks';
import { createBlock, deleteBlock, reorderBlocks, resetPageBlocks } from '../../lib/pageBlocks';
import { defaultsForPage } from '../../lib/pageDefaults';
import { BLOCK_LABELS, presetsForPage, type SectionPreset } from '../../components/blocks/palette';
import { readSectionProps } from '../../components/blocks/SectionBlock';
import { SortableRow, SortableStack } from '../../components/SortableList';
import { EmptyState, ErrorNote, PageLoader } from '../../components/ui';
import type { Block, PageElement } from '../../components/blocks/types';

const FIXED_LABELS: Record<string, { label: string; path: string }> = {
  home: { label: 'Home', path: '/' },
  about: { label: 'About', path: '/about' },
  contact: { label: 'Contact', path: '/contact' },
};

function firstText(elements: PageElement[]): string {
  for (const el of elements) {
    if (el.type === 'heading' || el.type === 'text' || el.type === 'badge') return el.text;
    if (el.type === 'buttons' && el.items[0]) return el.items[0].label;
  }
  return '';
}

function blockSummary(block: Block): string {
  if (block.type !== 'section') return 'Shows live catalog data';
  const { elements } = readSectionProps(block.props);
  const text = firstText(elements);
  const count = `${elements.length} element${elements.length === 1 ? '' : 's'}`;
  return text ? `${text} · ${count}` : count;
}

export const AdminPageBuilderEditor = () => {
  const { pageId = '' } = useParams();
  const { data: categories } = useCategories();
  const { blocks, loading } = usePageBlocks(pageId);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  const presets = presetsForPage(pageId);
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

  const addBlock = (preset: SectionPreset) => {
    setPaletteOpen(false);
    void run(async () => {
      await createBlock(pageId, preset.type, preset.defaultProps(), blocks.length);
    });
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
          View this page on the site <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      <div>
        <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">{label}</h2>
        <p className="text-xs text-slate-500">
          This page&apos;s sections. Drag one by its handle to move it. Pictures and videos are changed in
          the Images &amp; videos tab.
        </p>
      </div>

      {error && <ErrorNote message={error} />}

      {loading ? (
        <PageLoader />
      ) : blocks.length === 0 ? (
        <EmptyState
          title="This page is still using its standard layout"
          description="Open the page on the site while signed in as an admin — that sets it up so it can be edited."
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
        <SortableStack
          ids={blocks.map((b) => b.id)}
          onReorder={(ids) => void run(() => reorderBlocks(ids))}
        >
          <div className="space-y-2">
            {blocks.map((block) => (
              <SortableRow
                key={block.id}
                id={block.id}
                className="bg-white border border-slate-200 rounded-xl px-3 py-2.5"
              >
                {(handle) => (
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {handle}
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-teal-600">
                          {BLOCK_LABELS[block.type] ?? block.type}
                        </p>
                        <p className="text-xs text-slate-600 truncate">{blockSummary(block)}</p>
                      </div>
                    </div>
                    {confirmId === block.id ? (
                      <span className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => {
                            setConfirmId(null);
                            void run(() => deleteBlock(block.id));
                          }}
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
                        onClick={() => setConfirmId(block.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg shrink-0 cursor-pointer"
                        title="Delete section"
                        aria-label="Delete section"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </SortableRow>
            ))}
          </div>
        </SortableStack>
      )}

      <div className="flex flex-wrap items-start gap-3">
        <div className="relative">
          <button
            onClick={() => setPaletteOpen((v) => !v)}
            disabled={busy}
            className="inline-flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition disabled:opacity-50 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Add section
          </button>
          {paletteOpen && (
            <div className="absolute left-0 z-20 mt-2 w-80 max-w-[85vw] bg-white border border-slate-200 rounded-2xl shadow-xl p-2 space-y-0.5">
              {presets.map((preset) => (
                <button
                  key={preset.key}
                  onClick={() => addBlock(preset)}
                  className="w-full flex items-start gap-3 px-3 py-2 rounded-xl text-left hover:bg-teal-50 transition cursor-pointer"
                >
                  <preset.icon className="w-4 h-4 mt-0.5 text-teal-600 shrink-0" />
                  <span>
                    <span className="block text-xs font-bold text-slate-900">{preset.label}</span>
                    <span className="block text-[11px] text-slate-500">{preset.hint}</span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {confirmReset ? (
          <span className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-600">Replace this page with the standard layout?</span>
            <button
              onClick={() => {
                setConfirmReset(false);
                void run(() => resetPageBlocks(pageId, defaultsForPage(pageId)));
              }}
              disabled={busy}
              className="px-2 py-1 bg-rose-600 text-white rounded text-[10px] font-bold cursor-pointer disabled:opacity-50"
            >
              Yes, reset
            </button>
            <button onClick={() => setConfirmReset(false)} className="px-1.5 py-1 text-slate-500 text-[10px] cursor-pointer">
              Cancel
            </button>
          </span>
        ) : (
          <button
            onClick={() => setConfirmReset(true)}
            disabled={busy}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-rose-700 bg-white border border-slate-200 px-3.5 py-2 rounded-xl transition disabled:opacity-50 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset to standard layout
          </button>
        )}
      </div>
    </div>
  );
};

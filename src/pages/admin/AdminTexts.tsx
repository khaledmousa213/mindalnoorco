import { useState, type ReactNode } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { ErrorNote, PageLoader } from '../../components/ui';
import { SITE_TEXTS, useSiteContent } from '../../components/SiteText';
import { usePageBuilder } from '../../hooks/usePageBuilder';
import { updateBlockProps } from '../../lib/pageBlocks';
import { readHeroSliderProps } from '../../components/blocks/HeroSliderBlock';
import { readSectionProps } from '../../components/blocks/SectionBlock';
import { CARD_ICONS, CARD_ICON_NAMES } from '../../components/blocks/icons';
import type { Block, ButtonItem, CardItem, HeroSlide, PageElement } from '../../components/blocks/types';
import { TextField } from './fields';

const PAGES: { id: string; label: string }[] = [
  { id: 'home', label: 'Home page' },
  { id: 'about', label: 'About page' },
  { id: 'contact', label: 'Contact page' },
];

const LINK_HINT = 'Where it goes: /catalog, /contact, #quote (opens the quote form), https://…, tel:…';

type Save = (value: string) => Promise<void>;

/** Every piece of wording on the site pages, listed by page and section, edited as plain fields. */
export function AdminTexts() {
  return (
    <div className="space-y-8">
      <p className="text-xs text-slate-500 max-w-2xl">
        All the wording on the site pages. Change a field and click outside it — the live site updates straight
        away. Product and category names and descriptions are edited in the Products and Categories tabs.
      </p>
      {PAGES.map((page) => (
        <PageTexts key={page.id} pageId={page.id} label={page.label} />
      ))}
      <SiteWideTexts />
    </div>
  );
}

function PageTexts({ pageId, label }: { pageId: string; label: string }) {
  const { blocks, loading } = usePageBuilder(pageId);
  const [error, setError] = useState('');
  const ready = !loading && blocks.every((b) => !b.id.startsWith('default-'));

  const save = async (block: Block, patch: Record<string, unknown>) => {
    setError('');
    try {
      await updateBlockProps(block.id, { ...block.props, ...patch });
    } catch (e) {
      setError('That change could not be saved. Check you are signed in as an admin and try again.');
      throw e;
    }
  };

  const cards: ReactNode[] = [];
  if (ready) {
    let sectionNo = 0;
    blocks.forEach((block) => {
      if (block.type === 'heroSlider') {
        const { slides } = readHeroSliderProps(block.props);
        const patchSlide = (id: string, patch: Partial<HeroSlide>) =>
          save(block, { slides: slides.map((s) => (s.id === id ? { ...s, ...patch } : s)) });
        slides.forEach((slide, i) => {
          cards.push(
            <TextCard key={slide.id} title={`Slider ${i + 1}`}>
              <TextField label="Small label" allowEmpty value={slide.badge} onSave={(badge) => patchSlide(slide.id, { badge })} />
              <TextField label="Title" value={slide.title} onSave={(title) => patchSlide(slide.id, { title })} />
              <TextField label="Description" multiline value={slide.text} onSave={(text) => patchSlide(slide.id, { text })} />
              <ButtonFields items={slide.buttons} onChange={(buttons) => patchSlide(slide.id, { buttons })} />
            </TextCard>,
          );
        });
      } else if (block.type === 'section') {
        sectionNo += 1;
        const { elements } = readSectionProps(block.props);
        const patchElement = (id: string, patch: Record<string, unknown>) =>
          save(block, {
            elements: elements.map((e) => (e.id === id ? ({ ...e, ...patch } as PageElement) : e)),
          });
        const fields = elements.map((element) => (
          <ElementFields key={element.id} element={element} onPatch={(patch) => patchElement(element.id, patch)} />
        ));
        if (elements.some(hasText)) {
          const heading = elements.find((e) => e.type === 'heading');
          cards.push(
            <TextCard
              key={block.id}
              title={`Section ${sectionNo}`}
              subtitle={heading && heading.type === 'heading' ? heading.text : undefined}
            >
              {fields}
            </TextCard>,
          );
        }
      }
    });
  }

  return (
    <section className="space-y-3">
      <h2 className="text-base font-extrabold text-slate-900">{label}</h2>
      {error && <ErrorNote message={error} />}
      {!ready ? (
        <PageLoader label="Preparing this page…" />
      ) : cards.length === 0 ? (
        <p className="text-xs text-slate-400">This page has no editable text.</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">{cards}</div>
      )}
    </section>
  );
}

function SiteWideTexts() {
  const { content, setValue } = useSiteContent();
  return (
    <section className="space-y-3">
      <h2 className="text-base font-extrabold text-slate-900">Every page</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        <TextCard title="Footer">
          {SITE_TEXTS.map((text) => (
            <TextField
              key={text.id}
              label={text.label.replace(/^Footer · /, '')}
              multiline={text.multiline}
              value={content[text.id] ?? text.defaultValue}
              onSave={(value) => setValue(text.id, value)}
            />
          ))}
        </TextCard>
      </div>
    </section>
  );
}

function hasText(element: PageElement): boolean {
  return ['heading', 'text', 'badge', 'buttons', 'link', 'cards'].includes(element.type);
}

function ElementFields({
  element,
  onPatch,
}: {
  element: PageElement;
  onPatch: (patch: Record<string, unknown>) => Promise<void>;
}) {
  const field = (label: string, value: string, save: Save, opts: { multiline?: boolean; allowEmpty?: boolean; placeholder?: string } = {}) => (
    <TextField label={label} value={value} onSave={save} {...opts} />
  );

  switch (element.type) {
    case 'heading':
      return field('Heading', element.text, (text) => onPatch({ text }));
    case 'text':
      return field('Paragraph', element.text, (text) => onPatch({ text }), { multiline: true });
    case 'badge':
      return field('Small label', element.text, (text) => onPatch({ text }));
    case 'link':
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {field('Link text', element.label, (label) => onPatch({ label }))}
          {field('Link goes to', element.href, (href) => onPatch({ href }), { placeholder: LINK_HINT })}
        </div>
      );
    case 'buttons':
      return <ButtonFields items={element.items} onChange={(items) => onPatch({ items })} />;
    case 'cards':
      return <CardFields items={element.items} onChange={(items) => onPatch({ items })} />;
    default:
      return null;
  }
}

function CardFields({ items, onChange }: { items: CardItem[]; onChange: (items: CardItem[]) => Promise<void> }) {
  const patch = (id: string, p: Partial<CardItem>) => onChange(items.map((c) => (c.id === id ? { ...c, ...p } : c)));

  return (
    <div className="space-y-3">
      {items.map((card, i) => {
        const Icon = CARD_ICONS[card.icon] ?? CARD_ICONS.ShieldCheck;
        return (
          <fieldset key={card.id} className="border border-slate-200 rounded-xl p-3 space-y-2">
            <legend className="px-1 text-[11px] font-bold text-slate-600">Card {i + 1}</legend>
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4" />
              </span>
              <select
                value={card.icon}
                onChange={(e) => void patch(card.id, { icon: e.target.value })}
                className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white text-slate-700 cursor-pointer"
                title="Icon"
              >
                {CARD_ICON_NAMES.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
              <span className="flex-1" />
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`Delete card ${i + 1} (“${card.title}”)?`)) {
                    void onChange(items.filter((c) => c.id !== card.id));
                  }
                }}
                className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete card
              </button>
            </div>
            <TextField label="Title" value={card.title} onSave={(title) => patch(card.id, { title })} />
            <TextField label="Text" multiline value={card.text} onSave={(text) => patch(card.id, { text })} />
            <TextField
              label="Link (optional)"
              allowEmpty
              value={card.href ?? ''}
              placeholder={LINK_HINT}
              onSave={(href) => patch(card.id, { href })}
            />
          </fieldset>
        );
      })}
      <button
        type="button"
        onClick={() =>
          void onChange([
            ...items,
            { id: Math.random().toString(36).slice(2, 10), icon: 'ShieldCheck', title: 'New card', text: 'Describe this card.' },
          ])
        }
        className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl border-2 border-dashed border-slate-300 hover:border-teal-500 text-xs font-bold text-slate-500 hover:text-teal-700 transition cursor-pointer"
      >
        <Plus className="w-3.5 h-3.5" /> Add card
      </button>
    </div>
  );
}

function ButtonFields({ items, onChange }: { items: ButtonItem[]; onChange: (items: ButtonItem[]) => Promise<void> }) {
  const patch = (id: string, p: Partial<ButtonItem>) => onChange(items.map((b) => (b.id === id ? { ...b, ...p } : b)));

  return (
    <div className="space-y-3">
      {items.map((button, i) => (
        <fieldset key={button.id} className="border border-slate-200 rounded-xl p-3 space-y-2">
          <legend className="px-1 text-[11px] font-bold text-slate-600">Button {i + 1}</legend>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              {(['primary', 'secondary'] as const).map((variant) => (
                <button
                  key={variant}
                  type="button"
                  onClick={() => void patch(button.id, { variant })}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${
                    button.variant === variant ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {variant === 'primary' ? 'Colored' : 'Plain'}
                </button>
              ))}
            </div>
            <span className="flex-1" />
            <button
              type="button"
              onClick={() => {
                if (window.confirm(`Delete button ${i + 1} (“${button.label}”)?`)) {
                  void onChange(items.filter((b) => b.id !== button.id));
                }
              }}
              className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete button
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <TextField label="Text" value={button.label} onSave={(label) => patch(button.id, { label })} />
            <TextField
              label="Goes to"
              value={button.href}
              placeholder={LINK_HINT}
              onSave={(href) => patch(button.id, { href })}
            />
          </div>
        </fieldset>
      ))}
      <button
        type="button"
        onClick={() =>
          void onChange([
            ...items,
            {
              id: Math.random().toString(36).slice(2, 10),
              label: 'New button',
              href: '#quote',
              variant: items.length === 0 ? 'primary' : 'secondary',
            },
          ])
        }
        className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl border-2 border-dashed border-slate-300 hover:border-teal-500 text-xs font-bold text-slate-500 hover:text-teal-700 transition cursor-pointer"
      >
        <Plus className="w-3.5 h-3.5" /> Add button
      </button>
    </div>
  );
}

function TextCard({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-sm">
      <div>
        <h3 className="text-sm font-extrabold text-slate-900">{title}</h3>
        {subtitle && <p className="text-[11px] text-slate-400 truncate">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

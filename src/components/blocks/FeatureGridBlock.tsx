import {
  Award,
  CheckCircle2,
  Clock,
  PackageSearch,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Wrench,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { InlineEditable } from '../InlineEditable';
import { EditableItemList } from '../EditableItemList';
import { Container } from '../ui';
import type { Block, FeatureGridProps, FeatureItem } from './types';

/** Curated set the admin can pick from; stored by name so props stay plain JSON. */
export const FEATURE_ICONS: Record<string, LucideIcon> = {
  ShieldCheck,
  Wrench,
  PackageSearch,
  Award,
  Clock,
  Stethoscope,
  Sparkles,
  Zap,
  CheckCircle2,
};
const ICON_NAMES = Object.keys(FEATURE_ICONS);

function randomId(): string {
  return Math.random().toString(36).slice(2, 10);
}

interface Props {
  block: Block;
  isAdmin: boolean;
  onUpdateProps: (patch: Partial<FeatureGridProps>) => void;
}

export function FeatureGridBlock({ block, isAdmin, onUpdateProps }: Props) {
  const props = block.props as unknown as FeatureGridProps;
  const items = props.items ?? [];

  return (
    <Container className="py-4 space-y-3">
      {isAdmin ? (
        <InlineEditable
          as="h2"
          value={props.heading ?? ''}
          placeholder="Heading (optional)"
          onCommit={(heading) => onUpdateProps({ heading })}
          className="block text-xl font-black text-slate-900 tracking-tight"
        />
      ) : props.heading ? (
        <h2 className="text-xl font-black text-slate-900 tracking-tight">{props.heading}</h2>
      ) : null}

      <EditableItemList<FeatureItem>
        items={items}
        isAdmin={isAdmin}
        layout="grid"
        listClassName="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
        itemClassName="bg-white border border-slate-200 rounded-2xl p-4 flex gap-3"
        addLabel="Add item"
        onChange={(next) => onUpdateProps({ items: next })}
        newItem={() => ({
          id: randomId(),
          icon: 'ShieldCheck',
          title: 'New item',
          text: 'Describe this item.',
        })}
        renderItem={(item, update) => {
          const Icon = FEATURE_ICONS[item.icon] ?? ShieldCheck;
          return (
            <>
              <div className="flex flex-col items-center gap-1 shrink-0">
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                  <Icon className="w-4 h-4" />
                </div>
                {isAdmin && (
                  <select
                    value={item.icon}
                    onChange={(e) => update({ icon: e.target.value })}
                    className="w-14 text-[9px] border border-slate-200 rounded px-0.5 py-0.5 text-slate-500 cursor-pointer"
                    title="Change icon"
                  >
                    {ICON_NAMES.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div className="min-w-0 flex-1 pr-10">
                {isAdmin ? (
                  <InlineEditable
                    as="p"
                    value={item.title}
                    onCommit={(title) => update({ title })}
                    className="block text-xs font-bold text-slate-900"
                  />
                ) : (
                  <p className="text-xs font-bold text-slate-900">{item.title}</p>
                )}
                {isAdmin ? (
                  <InlineEditable
                    as="p"
                    multiline
                    value={item.text}
                    onCommit={(text) => update({ text })}
                    className="block text-xs text-slate-500 leading-relaxed mt-0.5"
                  />
                ) : (
                  <p className="text-xs text-slate-500 leading-relaxed mt-0.5">{item.text}</p>
                )}
              </div>
            </>
          );
        }}
      />
    </Container>
  );
}

import type { Block, SpacerProps } from './types';

const HEIGHT: Record<SpacerProps['size'], string> = {
  sm: 'h-4',
  md: 'h-10',
  lg: 'h-20',
};

interface Props {
  block: Block;
  isAdmin: boolean;
  onUpdateProps: (patch: Partial<SpacerProps>) => void;
}

export function SpacerBlock({ block, isAdmin, onUpdateProps }: Props) {
  const props = block.props as unknown as SpacerProps;
  const size = props.size ?? 'md';

  if (!isAdmin) return <div className={HEIGHT[size]} aria-hidden />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1">
      <div
        className={`${HEIGHT[size]} border border-dashed border-slate-300 rounded-lg flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400`}
      >
        Spacer
        <select
          value={size}
          onChange={(e) => onUpdateProps({ size: e.target.value as SpacerProps['size'] })}
          className="text-[10px] normal-case border border-slate-200 rounded px-1 py-0.5 bg-white cursor-pointer"
        >
          <option value="sm">Small</option>
          <option value="md">Medium</option>
          <option value="lg">Large</option>
        </select>
      </div>
    </div>
  );
}

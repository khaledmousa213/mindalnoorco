import type { ReactNode } from 'react';
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
  rectSortingStrategy,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Plus, X } from 'lucide-react';

interface WithId {
  id: string;
}

interface EditableItemListProps<T extends WithId> {
  items: T[];
  /** Called with the full new array after any add / remove / reorder / edit. */
  onChange: (items: T[]) => void;
  /** Renders one item's content. `update` merges a patch into that item. */
  renderItem: (item: T, update: (patch: Partial<T>) => void) => ReactNode;
  newItem: () => T;
  /** When false the list renders plain, with no drag/add/remove controls. */
  isAdmin: boolean;
  layout?: 'grid' | 'list';
  listClassName?: string;
  itemClassName?: string;
  addLabel?: string;
  minItems?: number;
}

/**
 * Sortable list of small repeatable items (feature cards, nav links) with
 * admin-only drag handle, remove button and "add" button. Purely presentational:
 * the parent owns the array and persists it from `onChange`.
 */
export function EditableItemList<T extends WithId>({
  items,
  onChange,
  renderItem,
  newItem,
  isAdmin,
  layout = 'list',
  listClassName = '',
  itemClassName = '',
  addLabel = 'Add item',
  minItems = 0,
}: EditableItemListProps<T>) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  if (!isAdmin) {
    return (
      <div className={listClassName}>
        {items.map((item) => (
          <div key={item.id} className={itemClassName}>
            {renderItem(item, () => {})}
          </div>
        ))}
      </div>
    );
  }

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const from = items.findIndex((i) => i.id === active.id);
    const to = items.findIndex((i) => i.id === over.id);
    if (from === -1 || to === -1) return;
    onChange(arrayMove(items, from, to));
  };

  const update = (id: string, patch: Partial<T>) =>
    onChange(items.map((i) => (i.id === id ? { ...i, ...patch } : i)));

  const removable = items.length > minItems;

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext
        items={items.map((i) => i.id)}
        strategy={layout === 'grid' ? rectSortingStrategy : verticalListSortingStrategy}
      >
        <div className={listClassName}>
          {items.map((item) => (
            <SortableEntry
              key={item.id}
              id={item.id}
              className={itemClassName}
              removable={removable}
              onRemove={() => onChange(items.filter((i) => i.id !== item.id))}
            >
              {renderItem(item, (patch) => update(item.id, patch))}
            </SortableEntry>
          ))}
        </div>
      </SortableContext>
      <button
        type="button"
        onClick={() => onChange([...items, newItem()])}
        className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-900 border border-dashed border-teal-300 hover:border-teal-500 rounded-xl px-3 py-2 transition cursor-pointer"
      >
        <Plus className="w-3.5 h-3.5" /> {addLabel}
      </button>
    </DndContext>
  );
}

function SortableEntry({
  id,
  children,
  className,
  removable,
  onRemove,
}: {
  id: string;
  children: ReactNode;
  className?: string;
  removable: boolean;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className={`relative group/item ${className ?? ''}`}>
      <div className="absolute top-1.5 right-1.5 z-10 flex items-center gap-0.5 opacity-0 group-hover/item:opacity-100 focus-within:opacity-100 transition">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="p-1 rounded-md bg-white/95 border border-slate-200 text-slate-500 hover:text-slate-900 cursor-grab active:cursor-grabbing touch-none"
          title="Drag to reorder"
        >
          <GripVertical className="w-3.5 h-3.5" />
        </button>
        {removable && (
          <button
            type="button"
            onClick={onRemove}
            className="p-1 rounded-md bg-white/95 border border-slate-200 text-rose-500 hover:text-rose-700 cursor-pointer"
            title="Remove"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

import { Loader2 } from 'lucide-react';
import type { ReactNode } from 'react';

export function Container({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>{children}</div>
  );
}

export function PageLoader({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-24 text-sm text-slate-500">
      <Loader2 className="w-4 h-4 animate-spin" />
      <span>{label}</span>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="text-center py-16 px-4 bg-white border border-dashed border-slate-300 rounded-2xl">
      <p className="text-sm font-bold text-slate-800">{title}</p>
      {description && <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorNote({ message }: { message: string }) {
  return (
    <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl p-3">
      {message}
    </div>
  );
}

import { useState } from 'react';
import { ChevronDown, Mail, Phone } from 'lucide-react';
import { useQuoteRequests } from '../../hooks/useCatalog';
import { setQuoteStatus } from '../../lib/quotes';
import { EmptyState, ErrorNote, PageLoader } from '../../components/ui';
import type { QuoteStatus } from '../../lib/types';

const STATUS_STYLE: Record<QuoteStatus, string> = {
  new: 'bg-teal-100 text-teal-800 border-teal-300',
  contacted: 'bg-amber-100 text-amber-800 border-amber-300',
  closed: 'bg-slate-100 text-slate-500 border-slate-300',
};

const NEXT_STATUS: Record<QuoteStatus, QuoteStatus> = {
  new: 'contacted',
  contacted: 'closed',
  closed: 'new',
};

function formatDate(ms: number): string {
  if (!ms) return '';
  return new Date(ms).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export const AdminRequestsInbox = () => {
  const { data: requests, loading, error } = useQuoteRequests();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState<QuoteStatus | 'all'>('all');

  const visible = filter === 'all' ? requests : requests.filter((r) => r.status === filter);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {(['all', 'new', 'contacted', 'closed'] as const).map((key) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize transition cursor-pointer ${
              filter === key ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {key}
            {key !== 'all' && (
              <span className="ml-1.5 opacity-70">
                {requests.filter((r) => r.status === key).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {error ? (
        <ErrorNote message={`Could not load requests: ${error}`} />
      ) : loading ? (
        <PageLoader />
      ) : visible.length === 0 ? (
        <EmptyState
          title="No requests"
          description="Quote and contact form submissions will appear here."
        />
      ) : (
        <div className="space-y-2">
          {visible.map((r) => {
            const open = expanded === r.id;
            return (
              <div key={r.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setExpanded(open ? null : r.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 transition cursor-pointer"
                >
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${STATUS_STYLE[r.status]}`}
                  >
                    {r.status}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">
                      {r.name}
                      {r.organization ? ` · ${r.organization}` : ''}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      {formatDate(r.createdAt)}
                      {r.products.length > 0 && ` · ${r.products.map((p) => p.name).join(', ')}`}
                    </p>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
                  />
                </button>

                {open && (
                  <div className="px-4 pb-4 pt-1 space-y-3 border-t border-slate-100">
                    <div className="flex flex-wrap gap-3 text-xs">
                      <a
                        href={`mailto:${r.email}`}
                        className="inline-flex items-center gap-1.5 font-semibold text-teal-700 hover:underline"
                      >
                        <Mail className="w-3.5 h-3.5" /> {r.email}
                      </a>
                      <a
                        href={`tel:${r.phone}`}
                        className="inline-flex items-center gap-1.5 font-semibold text-teal-700 hover:underline"
                      >
                        <Phone className="w-3.5 h-3.5" /> {r.phone}
                      </a>
                    </div>

                    {r.products.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {r.products.map((p) => (
                          <span
                            key={p.id}
                            className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200"
                          >
                            {p.name}
                          </span>
                        ))}
                      </div>
                    )}

                    {r.message && (
                      <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 border border-slate-200 rounded-xl p-3">
                        {r.message}
                      </p>
                    )}

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400">
                        Source: {r.source || 'unknown'}
                      </span>
                      <button
                        onClick={() => setQuoteStatus(r.id, NEXT_STATUS[r.status])}
                        className="ml-auto px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold transition cursor-pointer"
                      >
                        Mark as {NEXT_STATUS[r.status]}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

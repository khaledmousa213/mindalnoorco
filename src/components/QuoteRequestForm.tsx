import { useState, type FormEvent, type ReactNode } from 'react';
import { CheckCircle2, Loader2, Send } from 'lucide-react';
import { createQuoteRequest } from '../lib/quotes';
import { COMPANY } from '../lib/company';
import type { QuoteRequestProductRef } from '../lib/types';

interface QuoteRequestFormProps {
  products: QuoteRequestProductRef[];
  source: string;
  /** Called after a successful submission (e.g. to close a modal). */
  onSuccess?: () => void;
}

const EMPTY = { name: '', email: '', phone: '', organization: '', message: '' };

const inputClass =
  'w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition';

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-xs font-semibold text-slate-700">{label}</span>
      {children}
    </label>
  );
}

export const QuoteRequestForm = ({ products, source, onSuccess }: QuoteRequestFormProps) => {
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'done' | 'error'>('idle');

  const update = (key: keyof typeof EMPTY) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    try {
      await createQuoteRequest({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        organization: form.organization.trim(),
        message: form.message.trim(),
        products,
        source,
      });
      setStatus('done');
      onSuccess?.();
    } catch {
      setStatus('error');
    }
  };

  if (status === 'done') {
    return (
      <div className="p-6 text-center space-y-3">
        <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
          <CheckCircle2 className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Request sent</h3>
        <p className="text-xs text-slate-600 max-w-sm mx-auto">
          Thank you, {form.name || 'there'}. Our team will reply to <strong>{form.email}</strong>{' '}
          within one business day.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {products.length > 0 && (
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Products in this request
          </span>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {products.map((p) => (
              <span
                key={p.id}
                className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white text-slate-700 border border-slate-200"
              >
                {p.name}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Full name *">
          <input type="text" required value={form.name} onChange={update('name')} className={inputClass} />
        </Field>
        <Field label="Organization / clinic">
          <input
            type="text"
            value={form.organization}
            onChange={update('organization')}
            className={inputClass}
          />
        </Field>
        <Field label="Email *">
          <input type="email" required value={form.email} onChange={update('email')} className={inputClass} />
        </Field>
        <Field label="Phone *">
          <input type="tel" required value={form.phone} onChange={update('phone')} className={inputClass} />
        </Field>
      </div>

      <Field label="Message">
        <textarea
          rows={4}
          value={form.message}
          onChange={update('message')}
          placeholder="Tell us about your requirements, timeline, or budget."
          className={inputClass}
        />
      </Field>

      {status === 'error' && (
        <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-lg p-2.5">
          Something went wrong sending your request. Please email us directly at {COMPANY.salesEmail}.
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-600 to-sky-600 hover:from-teal-500 hover:to-sky-500 text-white font-bold text-sm transition shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
      >
        {status === 'submitting' ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Sending…
          </>
        ) : (
          <>
            <Send className="w-4 h-4" /> Send request
          </>
        )}
      </button>
    </form>
  );
};

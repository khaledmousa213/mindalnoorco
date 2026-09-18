import { Mail, MapPin, PhoneCall } from 'lucide-react';
import { QuoteRequestForm } from '../components/QuoteRequestForm';
import { EditableText } from '../components/EditableText';
import { Container } from '../components/ui';
import { usePageMeta } from '../lib/meta';
import { COMPANY } from '../lib/company';

export const ContactPage = () => {
  usePageMeta('Contact', `Contact ${COMPANY.name} for quotes, demos, and service enquiries.`);

  return (
    <Container className="py-10">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <EditableText
              as="h1"
              id="contact.title"
              defaultValue="Contact us"
              className="block text-3xl font-black text-slate-900 tracking-tight"
            />
            <EditableText
              as="p"
              id="contact.intro"
              multiline
              defaultValue="Send us a message for pricing, a product demonstration, or service and spare parts. We reply within one business day."
              className="block text-sm text-slate-600 mt-2 leading-relaxed"
            />
          </div>

          <div className="space-y-3">
            <a
              href={`tel:${COMPANY.phoneHref}`}
              className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-2xl hover:border-teal-400 transition"
            >
              <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                <PhoneCall className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Phone
                </span>
                <span className="text-sm font-semibold text-slate-900">{COMPANY.phoneDisplay}</span>
              </div>
            </a>

            <a
              href={`mailto:${COMPANY.email}`}
              className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-2xl hover:border-teal-400 transition"
            >
              <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Email
                </span>
                <span className="text-sm font-semibold text-slate-900">{COMPANY.email}</span>
              </div>
            </a>

            <div className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-2xl">
              <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Address
                </span>
                <span className="text-sm font-semibold text-slate-900">{COMPANY.addressLine}</span>
              </div>
            </div>

            {COMPANY.mapUrl && (
              <a
                href={COMPANY.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center text-xs font-bold text-teal-700 hover:underline"
              >
                Open in Google Maps
              </a>
            )}
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
            <EditableText
              as="h2"
              id="contact.formTitle"
              defaultValue="Send a message"
              className="block text-lg font-black text-slate-900 mb-4"
            />
            <QuoteRequestForm products={[]} source="contact" />
          </div>
        </div>
      </div>
    </Container>
  );
};

import { Mail, MapPin, PhoneCall } from 'lucide-react';
import { InlineEditable } from '../InlineEditable';
import { Container } from '../ui';
import { COMPANY } from '../../lib/company';
import type { Block, ContactInfoProps } from './types';

interface Props {
  block: Block;
  isAdmin: boolean;
  onUpdateProps: (patch: Partial<ContactInfoProps>) => void;
}

const cardClass =
  'flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-2xl transition';
const iconClass =
  'w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0';
const labelClass = 'text-[11px] font-bold uppercase tracking-wider text-slate-400 block';

export function ContactInfoBlock({ block, isAdmin, onUpdateProps }: Props) {
  const props = block.props as unknown as ContactInfoProps;

  return (
    <Container className="py-4 space-y-3">
      {isAdmin ? (
        <InlineEditable
          as="h2"
          value={props.heading ?? ''}
          placeholder="Heading (optional)"
          onCommit={(heading) => onUpdateProps({ heading })}
          className="block text-lg font-black text-slate-900"
        />
      ) : props.heading ? (
        <h2 className="text-lg font-black text-slate-900">{props.heading}</h2>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <a href={`tel:${COMPANY.phoneHref}`} className={`${cardClass} hover:border-teal-400`}>
          <div className={iconClass}>
            <PhoneCall className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className={labelClass}>Phone</span>
            <span className="text-sm font-semibold text-slate-900">{COMPANY.phoneDisplay}</span>
          </div>
        </a>
        <a href={`mailto:${COMPANY.email}`} className={`${cardClass} hover:border-teal-400`}>
          <div className={iconClass}>
            <Mail className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className={labelClass}>Email</span>
            <span className="text-sm font-semibold text-slate-900 break-all">{COMPANY.email}</span>
          </div>
        </a>
        <div className={cardClass}>
          <div className={iconClass}>
            <MapPin className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className={labelClass}>Address</span>
            <span className="text-sm font-semibold text-slate-900">{COMPANY.addressLine}</span>
          </div>
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
    </Container>
  );
}

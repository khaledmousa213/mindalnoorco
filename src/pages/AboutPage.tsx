import { Link } from 'react-router-dom';
import { Award, Clock, ShieldCheck, Stethoscope } from 'lucide-react';
import { MindrayLogo } from '../components/MindrayLogo';
import { EditableText } from '../components/EditableText';
import { Container } from '../components/ui';
import { usePageMeta } from '../lib/meta';
import { COMPANY } from '../lib/company';

const PILLARS = [
  {
    key: 'partnership',
    icon: Award,
    title: 'Authorized Mindray partnership',
    text: 'Genuine equipment sourced directly from the manufacturer, with original warranties, OEM software updates, and authentic transducers.',
  },
  {
    key: 'engineering',
    icon: ShieldCheck,
    title: 'Biomedical engineering',
    text: 'Factory-trained service engineers for turnkey installation, calibration, and preventive maintenance.',
  },
  {
    key: 'training',
    icon: Stethoscope,
    title: 'Clinical application training',
    text: 'On-site specialists supporting radiologists, sonographers, and surgeons with workflow setup and protocol presets.',
  },
  {
    key: 'support',
    icon: Clock,
    title: 'Spare parts & support',
    text: 'Local inventory for replacement parts and loaner probes, with fast clinical response times.',
  },
] as const;

export const AboutPage = () => {
  usePageMeta('About');

  return (
    <Container className="py-10 space-y-10 max-w-4xl">
      <div className="space-y-3">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">About {COMPANY.name}</h1>
        <p className="text-xs text-slate-500 font-medium">{COMPANY.nameArabic}</p>
        <EditableText
          as="p"
          id="about.intro"
          multiline
          defaultValue={`${COMPANY.name} is a supplier and authorized distributor of Mindray medical systems, delivering diagnostic ultrasound, digital radiography (DR) suites, surgical C-arms, and point-of-care imaging to hospitals, radiology clinics, and diagnostic centers across Jordan and the region.`}
          className="block text-sm text-slate-700 leading-relaxed"
        />
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <span>Authorized distributor of</span>
          <MindrayLogo className="h-4" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {PILLARS.map(({ key, icon: Icon, title, text }) => (
          <div key={key} className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center">
              <Icon className="w-4 h-4" />
            </div>
            <EditableText
              as="h2"
              id={`about.pillar.${key}.title`}
              defaultValue={title}
              className="block font-black text-slate-900 text-sm"
            />
            <EditableText
              as="p"
              id={`about.pillar.${key}.text`}
              defaultValue={text}
              multiline
              className="block text-xs text-slate-600 leading-relaxed"
            />
          </div>
        ))}
      </div>

      <div className="bg-slate-900 text-white rounded-2xl p-6 space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
          Showroom &amp; regional support
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-slate-300">
          <span>{COMPANY.addressLine}</span>
          <a href={`tel:${COMPANY.phoneHref}`} className="hover:text-teal-400 transition">
            {COMPANY.phoneDisplay}
          </a>
          <a href={`mailto:${COMPANY.email}`} className="hover:text-teal-400 transition">
            {COMPANY.email}
          </a>
        </div>
        <Link
          to="/contact"
          className="inline-block mt-2 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl transition"
        >
          Contact us
        </Link>
      </div>
    </Container>
  );
};

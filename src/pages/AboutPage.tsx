import { BlockRenderer } from '../components/blocks/BlockRenderer';
import type { DefaultBlockInput } from '../components/blocks/types';
import { MindrayLogo } from '../components/MindrayLogo';
import { Container } from '../components/ui';
import { usePageBuilder } from '../hooks/usePageBuilder';
import { usePageMeta } from '../lib/meta';
import { COMPANY } from '../lib/company';

const DEFAULT_ABOUT_BLOCKS: DefaultBlockInput[] = [
  {
    type: 'richText',
    props: {
      body: `${COMPANY.name} is a supplier and authorized distributor of Mindray medical systems, delivering diagnostic ultrasound, digital radiography (DR) suites, surgical C-arms, and point-of-care imaging to hospitals, radiology clinics, and diagnostic centers across Jordan and the region.`,
    },
  },
  {
    type: 'featureGrid',
    props: {
      items: [
        {
          id: 'partnership',
          icon: 'Award',
          title: 'Authorized Mindray partnership',
          text: 'Genuine equipment sourced directly from the manufacturer, with original warranties, OEM software updates, and authentic transducers.',
        },
        {
          id: 'engineering',
          icon: 'ShieldCheck',
          title: 'Biomedical engineering',
          text: 'Factory-trained service engineers for turnkey installation, calibration, and preventive maintenance.',
        },
        {
          id: 'training',
          icon: 'Stethoscope',
          title: 'Clinical application training',
          text: 'On-site specialists supporting radiologists, sonographers, and surgeons with workflow setup and protocol presets.',
        },
        {
          id: 'support',
          icon: 'Clock',
          title: 'Spare parts & support',
          text: 'Local inventory for replacement parts and loaner probes, with fast clinical response times.',
        },
      ],
    },
  },
  {
    type: 'ctaBanner',
    props: {
      eyebrow: 'Showroom & regional support',
      body: `${COMPANY.addressLine} · ${COMPANY.phoneDisplay} · ${COMPANY.email}`,
      buttonLabel: 'Contact us',
      buttonHref: '/contact',
    },
  },
];

export const AboutPage = () => {
  usePageMeta('About');
  const { blocks, editable, updateProps } = usePageBuilder('about', DEFAULT_ABOUT_BLOCKS);

  return (
    <div className="py-10 space-y-6">
      <Container className="max-w-4xl space-y-3">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">About {COMPANY.name}</h1>
        <p className="text-xs text-slate-500 font-medium">{COMPANY.nameArabic}</p>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <span>Authorized distributor of</span>
          <MindrayLogo className="h-4" />
        </div>
      </Container>
      {blocks.map((block) => (
        <BlockRenderer
          key={block.id}
          block={block}
          isAdmin={editable}
          onUpdateProps={(patch) => updateProps(block, patch)}
        />
      ))}
    </div>
  );
};

import { BlockRenderer } from '../components/blocks/BlockRenderer';
import type { DefaultBlockInput } from '../components/blocks/types';
import { usePageBuilder } from '../hooks/usePageBuilder';
import { usePageMeta } from '../lib/meta';
import { COMPANY } from '../lib/company';

const DEFAULT_HOME_BLOCKS: DefaultBlockInput[] = [
  {
    type: 'heroHome',
    props: {
      badge: `Authorized Mindray distributor · ${COMPANY.city}`,
      title: 'Diagnostic imaging equipment for hospitals and clinics',
      subtitle: `Ultrasound systems, digital radiography, and surgical imaging — supplied, installed, and serviced by ${COMPANY.name}, with clinical training and manufacturer warranty.`,
    },
  },
  {
    type: 'featureGrid',
    props: {
      items: [
        {
          id: 'warranty',
          icon: 'ShieldCheck',
          title: 'Manufacturer warranty',
          text: 'Genuine equipment with OEM warranty and software support.',
        },
        {
          id: 'service',
          icon: 'Wrench',
          title: 'Installation & service',
          text: 'Commissioning, preventive maintenance, and spare parts.',
        },
        {
          id: 'training',
          icon: 'PackageSearch',
          title: 'Clinical training',
          text: 'On-site application training for your clinical teams.',
        },
      ],
    },
  },
  {
    type: 'featuredProducts',
    props: { heading: 'Featured systems', subheading: 'A selection from our current catalog.' },
  },
  { type: 'categoryGrid', props: { heading: 'Shop by product line' } },
];

export const HomePage = () => {
  usePageMeta();
  const { blocks, editable, updateProps } = usePageBuilder('home', DEFAULT_HOME_BLOCKS);

  return (
    <div className="pb-16">
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

import { BlockRenderer } from '../components/blocks/BlockRenderer';
import type { DefaultBlockInput } from '../components/blocks/types';
import { usePageBuilder } from '../hooks/usePageBuilder';
import { usePageMeta } from '../lib/meta';
import { COMPANY } from '../lib/company';

const DEFAULT_CONTACT_BLOCKS: DefaultBlockInput[] = [
  {
    type: 'richText',
    props: {
      heading: 'Contact us',
      headingLevel: 'h1',
      body: 'Send us a message for pricing, a product demonstration, or service and spare parts. We reply within one business day.',
    },
  },
  { type: 'contactInfo', props: {} },
  { type: 'quoteForm', props: { heading: 'Send a message' } },
];

export const ContactPage = () => {
  usePageMeta('Contact', `Contact ${COMPANY.name} for quotes, demos, and service enquiries.`);
  const { blocks, editable, updateProps } = usePageBuilder('contact', DEFAULT_CONTACT_BLOCKS);

  return (
    <div className="py-10 space-y-4 max-w-4xl w-full mx-auto">
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

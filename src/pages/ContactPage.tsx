import { PageCanvas } from '../components/blocks/PageCanvas';
import { usePageBuilder } from '../hooks/usePageBuilder';
import { usePageMeta } from '../lib/meta';
import { COMPANY } from '../lib/company';

export const ContactPage = () => {
  usePageMeta('Contact', `Contact ${COMPANY.name} for quotes, demos, and service enquiries.`);
  const page = usePageBuilder('contact');

  return (
    <div className="py-6 pb-16">
      <PageCanvas blocks={page.blocks} />
    </div>
  );
};

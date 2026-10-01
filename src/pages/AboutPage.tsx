import { PageCanvas } from '../components/blocks/PageCanvas';
import { usePageBuilder } from '../hooks/usePageBuilder';
import { usePageMeta } from '../lib/meta';

export const AboutPage = () => {
  usePageMeta('About');
  const page = usePageBuilder('about');

  return (
    <div className="py-6 pb-16">
      <PageCanvas blocks={page.blocks} />
    </div>
  );
};

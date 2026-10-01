import { PageCanvas } from '../components/blocks/PageCanvas';
import { usePageBuilder } from '../hooks/usePageBuilder';
import { usePageMeta } from '../lib/meta';

export const HomePage = () => {
  usePageMeta();
  const page = usePageBuilder('home');

  return (
    <div className="pb-16">
      <PageCanvas blocks={page.blocks} />
    </div>
  );
};

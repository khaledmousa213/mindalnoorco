import { Container } from '../ui';
import { ElementView, type Tone } from './ElementView';
import type { Block, PageElement, SectionProps, SectionStyle, SectionWidth } from './types';

export function readSectionProps(props: Record<string, unknown>): SectionProps {
  return {
    style: (props.style as SectionStyle) ?? 'plain',
    width: (props.width as SectionWidth) ?? 'wide',
    elements: Array.isArray(props.elements) ? (props.elements as PageElement[]) : [],
  };
}

function isEmptyMedia(element: PageElement): boolean {
  if (element.type === 'gallery') return element.images.length === 0;
  if (element.type === 'image' || element.type === 'video') return !element.url;
  return false;
}

export function SectionBlock({ block }: { block: Block }) {
  const { style, width, elements } = readSectionProps(block.props);
  const tone: Tone = style === 'dark' ? 'dark' : 'light';

  // A picture/gallery section with nothing uploaded yet would show only its heading — hide it until it has media.
  const media = elements.filter((e) => e.type === 'gallery' || e.type === 'image' || e.type === 'video');
  if (media.length > 0 && media.every(isEmptyMedia)) return null;

  const content = (
    <div className="space-y-5">
      {elements.map((element) => (
        <ElementView key={element.id} element={element} tone={tone} />
      ))}
    </div>
  );

  const narrow = width === 'narrow' ? 'max-w-4xl mx-auto' : '';

  switch (style) {
    case 'hero':
      return (
        <section className="bg-white border-b border-slate-200">
          <Container className="py-12 sm:py-16">
            <div className={`space-y-5 ${width === 'narrow' ? 'max-w-3xl mx-auto' : 'max-w-3xl'}`}>{content}</div>
          </Container>
        </section>
      );
    case 'card':
      return (
        <Container className="py-6 sm:py-8">
          <div className={narrow}>
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">{content}</div>
          </div>
        </Container>
      );
    case 'dark':
      return (
        <Container className="py-6 sm:py-8">
          <div className={narrow}>
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-6 sm:p-10">{content}</div>
          </div>
        </Container>
      );
    default:
      return (
        <Container className="py-6 sm:py-10">
          <div className={narrow}>{content}</div>
        </Container>
      );
  }
}

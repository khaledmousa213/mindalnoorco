import { InlineEditable } from '../InlineEditable';
import { Container } from '../ui';
import type { Block, RichTextProps } from './types';

interface Props {
  block: Block;
  isAdmin: boolean;
  onUpdateProps: (patch: Partial<RichTextProps>) => void;
}

export function RichTextBlock({ block, isAdmin, onUpdateProps }: Props) {
  const props = block.props as unknown as RichTextProps;
  const HeadingTag = props.headingLevel === 'h1' ? 'h1' : 'h2';
  const headingClass =
    props.headingLevel === 'h1'
      ? 'block text-3xl font-black text-slate-900 tracking-tight'
      : 'block text-xl font-black text-slate-900 tracking-tight';

  return (
    <Container className="py-4">
      <div className={`max-w-3xl space-y-2 ${props.align === 'center' ? 'mx-auto text-center' : ''}`}>
        {isAdmin ? (
          <InlineEditable
            as={HeadingTag}
            value={props.heading ?? ''}
            placeholder="Heading (optional)"
            onCommit={(heading) => onUpdateProps({ heading })}
            className={headingClass}
          />
        ) : props.heading ? (
          <HeadingTag className={headingClass}>{props.heading}</HeadingTag>
        ) : null}
        {isAdmin ? (
          <InlineEditable
            as="p"
            multiline
            value={props.body ?? ''}
            placeholder="Write something…"
            onCommit={(body) => onUpdateProps({ body })}
            className="block text-sm text-slate-700 leading-relaxed"
          />
        ) : (
          <p className="text-sm text-slate-700 leading-relaxed">{props.body}</p>
        )}
      </div>
    </Container>
  );
}

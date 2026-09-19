import { InlineEditable } from '../InlineEditable';
import { QuoteRequestForm } from '../QuoteRequestForm';
import { Container } from '../ui';
import type { Block, QuoteFormProps } from './types';

interface Props {
  block: Block;
  isAdmin: boolean;
  onUpdateProps: (patch: Partial<QuoteFormProps>) => void;
}

export function QuoteFormBlock({ block, isAdmin, onUpdateProps }: Props) {
  const props = block.props as unknown as QuoteFormProps;
  const heading = props.heading ?? 'Send a message';

  return (
    <Container className="py-4">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
        {isAdmin ? (
          <InlineEditable
            as="h2"
            value={heading}
            onCommit={(next) => onUpdateProps({ heading: next })}
            className="block text-lg font-black text-slate-900 mb-4"
          />
        ) : (
          <h2 className="text-lg font-black text-slate-900 mb-4">{heading}</h2>
        )}
        <QuoteRequestForm products={[]} source="contact" />
      </div>
    </Container>
  );
}

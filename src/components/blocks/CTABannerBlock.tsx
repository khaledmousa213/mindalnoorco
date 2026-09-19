import { Link } from 'react-router-dom';
import { InlineEditable } from '../InlineEditable';
import { Container } from '../ui';
import type { Block, CtaBannerProps } from './types';

interface Props {
  block: Block;
  isAdmin: boolean;
  onUpdateProps: (patch: Partial<CtaBannerProps>) => void;
}

export function CTABannerBlock({ block, isAdmin, onUpdateProps }: Props) {
  const props = block.props as unknown as CtaBannerProps;

  return (
    <Container className="py-4">
      <div className="bg-slate-900 text-white rounded-2xl p-6 space-y-3">
        {isAdmin ? (
          <InlineEditable
            as="p"
            value={props.eyebrow ?? ''}
            placeholder="Small label (optional)"
            onCommit={(eyebrow) => onUpdateProps({ eyebrow })}
            className="block text-xs font-bold uppercase tracking-wider text-teal-400"
          />
        ) : props.eyebrow ? (
          <p className="text-xs font-bold uppercase tracking-wider text-teal-400">{props.eyebrow}</p>
        ) : null}

        {isAdmin ? (
          <InlineEditable
            as="h3"
            value={props.heading ?? ''}
            placeholder="Heading (optional)"
            onCommit={(heading) => onUpdateProps({ heading })}
            className="block text-lg font-black"
          />
        ) : props.heading ? (
          <h3 className="text-lg font-black">{props.heading}</h3>
        ) : null}

        {isAdmin ? (
          <InlineEditable
            as="p"
            multiline
            value={props.body ?? ''}
            placeholder="Body text (optional)"
            onCommit={(body) => onUpdateProps({ body })}
            className="block text-sm text-slate-300"
          />
        ) : props.body ? (
          <p className="text-sm text-slate-300">{props.body}</p>
        ) : null}

        {isAdmin ? (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <InlineEditable
              value={props.buttonLabel}
              onCommit={(buttonLabel) => onUpdateProps({ buttonLabel })}
              className="inline-block px-4 py-2 bg-teal-600 text-white text-xs font-bold rounded-xl"
            />
            <span className="text-[10px] text-slate-500">links to</span>
            <InlineEditable
              value={props.buttonHref}
              onCommit={(buttonHref) => onUpdateProps({ buttonHref })}
              className="inline-block text-[10px] font-mono text-slate-400"
            />
          </div>
        ) : (
          <Link
            to={props.buttonHref || '/'}
            className="inline-block mt-1 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl transition"
          >
            {props.buttonLabel}
          </Link>
        )}
      </div>
    </Container>
  );
}

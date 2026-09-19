import { Link } from 'react-router-dom';
import { InlineEditable } from '../InlineEditable';
import { EditableImage } from '../EditableImage';
import { Container } from '../ui';
import { uploadContentImage } from '../../lib/storage';
import type { Block, ImageTextProps } from './types';

interface Props {
  block: Block;
  isAdmin: boolean;
  onUpdateProps: (patch: Partial<ImageTextProps>) => void;
}

export function ImageTextBlock({ block, isAdmin, onUpdateProps }: Props) {
  const props = block.props as unknown as ImageTextProps;
  const imageRight = props.imageSide === 'right';

  return (
    <Container className="py-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <EditableImage
          value={props.imageUrl ?? ''}
          alt={props.heading}
          upload={uploadContentImage}
          onCommit={(imageUrl) => onUpdateProps({ imageUrl })}
          className={`h-56 rounded-2xl overflow-hidden ${imageRight ? 'md:order-2' : ''}`}
        />
        <div className="space-y-2">
          {isAdmin ? (
            <InlineEditable
              as="h3"
              value={props.heading ?? ''}
              onCommit={(heading) => onUpdateProps({ heading })}
              className="block text-xl font-black text-slate-900 tracking-tight"
            />
          ) : (
            <h3 className="text-xl font-black text-slate-900 tracking-tight">{props.heading}</h3>
          )}
          {isAdmin ? (
            <InlineEditable
              as="p"
              multiline
              value={props.body ?? ''}
              onCommit={(body) => onUpdateProps({ body })}
              className="block text-sm text-slate-600 leading-relaxed"
            />
          ) : (
            <p className="text-sm text-slate-600 leading-relaxed">{props.body}</p>
          )}
          {isAdmin ? (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <InlineEditable
                value={props.linkLabel ?? ''}
                placeholder="Link label (optional)"
                onCommit={(linkLabel) => onUpdateProps({ linkLabel })}
                className="inline-block text-xs font-bold text-teal-700"
              />
              <InlineEditable
                value={props.linkHref ?? ''}
                placeholder="/path"
                onCommit={(linkHref) => onUpdateProps({ linkHref })}
                className="inline-block text-[10px] font-mono text-slate-400"
              />
              <button
                type="button"
                onClick={() => onUpdateProps({ imageSide: imageRight ? 'left' : 'right' })}
                className="text-[10px] font-bold text-slate-500 hover:text-teal-700 border border-slate-200 rounded px-1.5 py-0.5 cursor-pointer"
              >
                Image on {imageRight ? 'right' : 'left'} — flip
              </button>
            </div>
          ) : props.linkLabel ? (
            <Link
              to={props.linkHref || '/'}
              className="inline-block pt-1 text-xs font-bold text-teal-700 hover:underline"
            >
              {props.linkLabel}
            </Link>
          ) : null}
        </div>
      </div>
    </Container>
  );
}

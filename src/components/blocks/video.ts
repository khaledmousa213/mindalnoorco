export type VideoSource =
  | { kind: 'embed'; src: string }
  | { kind: 'file'; src: string }
  | { kind: 'none' };

/** Turns a pasted YouTube / Vimeo / direct video link into something we can play. */
export function parseVideoUrl(raw: string): VideoSource {
  const url = raw.trim();
  if (!url) return { kind: 'none' };

  const youtube = url.match(
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/,
  );
  if (youtube) return { kind: 'embed', src: `https://www.youtube-nocookie.com/embed/${youtube[1]}` };

  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo) return { kind: 'embed', src: `https://player.vimeo.com/video/${vimeo[1]}` };

  if (/^https?:\/\/.+\.(mp4|webm|ogg)(\?.*)?$/i.test(url)) return { kind: 'file', src: url };

  return { kind: 'none' };
}

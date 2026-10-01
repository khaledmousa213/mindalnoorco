import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ElementView } from './ElementView';
import { parseVideoUrl } from './video';
import type { Block, HeroSlide, HeroSliderProps } from './types';

function randomId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function newHeroSlide(): HeroSlide {
  return {
    id: randomId(),
    media: 'image',
    image: '',
    video: '',
    badge: '',
    title: 'New slide title',
    text: 'Click here to write a short description for this slide.',
    buttons: [{ id: randomId(), label: 'Request a quote', href: '#quote', variant: 'primary' }],
  };
}

export function readHeroSliderProps(props: Record<string, unknown>): HeroSliderProps {
  const slides = Array.isArray(props.slides) ? (props.slides as HeroSlide[]) : [];
  return {
    slides: slides.length > 0 ? slides : [newHeroSlide()],
    interval: typeof props.interval === 'number' ? props.interval : 6,
  };
}

/** Fixed slider height; the video "cover" sizing below is derived from it. */
const HEIGHT = 'clamp(460px, 78vh, 680px)';

export function HeroSliderBlock({ block }: { block: Block }) {
  const { slides, interval } = readHeroSliderProps(block.props);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef<number | null>(null);

  const count = slides.length;
  const current = Math.min(active, count - 1);
  const go = (index: number) => setActive(((index % count) + count) % count);

  const reducedMotion =
    typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const autoplay = !paused && !reducedMotion && interval > 0 && count > 1;

  useEffect(() => {
    if (!autoplay) return;
    const timer = window.setTimeout(() => go(current + 1), interval * 1000);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, current, interval, count]);

  return (
    <section
      className="relative isolate overflow-hidden bg-slate-950 text-white"
      style={{ height: HEIGHT }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        touchX.current = null;
        if (Math.abs(dx) > 50) go(current + (dx < 0 ? 1 : -1));
      }}
      aria-roledescription="carousel"
    >
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-700 ease-out ${
            index === current ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
          }`}
          aria-hidden={index !== current}
          aria-roledescription="slide"
          aria-label={`${index + 1} of ${count}`}
        >
          <SlideBackground slide={slide} active={index === current} />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/60 to-slate-950/10" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-950/60 to-transparent" />
          <SlideContent slide={slide} visible={index === current} />
        </div>
      ))}

      {count > 1 && (
        <div className="absolute inset-x-0 bottom-6 z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              {slides.map((slide, index) => (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => go(index)}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    index === current ? 'w-10 bg-white' : 'w-4 bg-white/40 hover:bg-white/70'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                  aria-current={index === current}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => go(current - 1)}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur border border-white/20 flex items-center justify-center transition cursor-pointer"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => go(current + 1)}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur border border-white/20 flex items-center justify-center transition cursor-pointer"
                aria-label="Next slide"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

    </section>
  );
}

function SlideBackground({ slide, active }: { slide: HeroSlide; active: boolean }) {
  const fallback = (
    <div className="absolute inset-0 bg-gradient-to-br from-teal-900 via-slate-900 to-sky-950">
      <div className="absolute -top-32 right-0 w-[36rem] h-[36rem] rounded-full bg-teal-500/20 blur-3xl" />
      <div className="absolute -bottom-40 right-1/3 w-[28rem] h-[28rem] rounded-full bg-sky-500/20 blur-3xl" />
    </div>
  );

  if (slide.media === 'video') {
    const source = parseVideoUrl(slide.video);
    // Only the visible slide plays; the others keep a poster/fallback.
    if (!active || source.kind === 'none') {
      return slide.image ? <Img url={slide.image} /> : fallback;
    }
    if (source.kind === 'file') {
      return (
        <video
          src={source.src}
          poster={slide.image || undefined}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
      );
    }
    // YouTube / Vimeo: a muted, chrome-less loop sized to cover the frame like object-cover.
    const cover: CSSProperties = {
      width: `max(100%, calc(${HEIGHT} * 16 / 9))`,
      height: 'max(100%, 56.25vw)',
    };
    return (
      <div className="absolute inset-0 overflow-hidden">
        {slide.image ? <Img url={slide.image} /> : fallback}
        <iframe
          src={backgroundEmbed(source.src)}
          title="Background video"
          allow="autoplay; encrypted-media; picture-in-picture"
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={cover}
          tabIndex={-1}
        />
      </div>
    );
  }

  return slide.image ? <Img url={slide.image} /> : fallback;
}

function Img({ url }: { url: string }) {
  return <img src={url} alt="" className="absolute inset-0 w-full h-full object-cover" />;
}

function backgroundEmbed(src: string): string {
  if (src.includes('vimeo.com')) return `${src}?background=1&autoplay=1&loop=1&muted=1`;
  const id = src.split('/').pop() ?? '';
  return `${src}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=0&modestbranding=1&playsinline=1&rel=0&disablekb=1`;
}

function SlideContent({ slide, visible }: { slide: HeroSlide; visible: boolean }) {
  const enter = `transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`;

  return (
    <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
      <div className={`max-w-2xl space-y-5 pb-10 ${enter}`}>
        {slide.badge && (
          <div>
            <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur text-white text-xs font-bold px-3.5 py-1 rounded-full border border-white/20">
              <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse shrink-0" />
              {slide.badge}
            </span>
          </div>
        )}
        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black leading-[1.05] tracking-tight text-white">
          {slide.title}
        </h2>
        <p className="text-base sm:text-lg leading-relaxed text-slate-200 whitespace-pre-line">{slide.text}</p>
        <ElementView element={{ id: `${slide.id}-buttons`, type: 'buttons', items: slide.buttons }} tone="dark" />
      </div>
    </div>
  );
}

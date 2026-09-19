import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Container } from '../ui';
import type { CategoryBlockContext } from './types';

export function HeroCategoryBlock({ ctx }: { ctx: CategoryBlockContext }) {
  const { category } = ctx;

  return (
    <section className="relative bg-slate-900 text-white overflow-hidden">
      {category.imageUrl && (
        <img
          src={category.imageUrl}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/95 to-teal-950/80" />
      <Container className="relative py-14 sm:py-20 space-y-4">
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <Link to="/catalog" className="hover:text-white font-semibold">
            Catalog
          </Link>
          <span className="text-slate-500">/</span>
          <span className="text-white font-bold">{category.name}</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight max-w-2xl">{category.name}</h1>
        {category.description && (
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
            {category.description}
          </p>
        )}
        <Link
          to={`/catalog?category=${encodeURIComponent(category.slug)}`}
          className="inline-flex items-center gap-2 bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm px-5 py-3 rounded-full transition"
        >
          Shop all {category.name}
          <ArrowRight className="w-4 h-4" />
        </Link>
      </Container>
    </section>
  );
}

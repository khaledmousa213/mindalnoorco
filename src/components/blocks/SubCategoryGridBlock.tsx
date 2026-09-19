import { Link } from 'react-router-dom';
import { ArrowRight, ImageOff } from 'lucide-react';
import { Container } from '../ui';
import type { CategoryBlockContext } from './types';

export function SubCategoryGridBlock({ ctx }: { ctx: CategoryBlockContext }) {
  const { category, children, countFor } = ctx;
  if (children.length === 0) return null;

  return (
    <Container className="py-10 space-y-6">
      <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
        Browse {category.name} by series
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {children.map((child) => (
          <Link
            key={child.id}
            to={`/catalog?category=${encodeURIComponent(child.slug)}`}
            className="group bg-white border border-slate-200 hover:border-teal-400 rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition flex flex-col"
          >
            <div className="h-40 bg-slate-100 overflow-hidden flex items-center justify-center">
              {child.imageUrl ? (
                <img
                  src={child.imageUrl}
                  alt={child.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <ImageOff className="w-8 h-8 text-slate-300" />
              )}
            </div>
            <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <h3 className="font-black text-slate-900 group-hover:text-teal-700 transition">
                  {child.name}
                </h3>
                {child.description && (
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">
                    {child.description}
                  </p>
                )}
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-semibold">{countFor(child.id)} systems</span>
                <span className="text-teal-700 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition">
                  View <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </Container>
  );
}

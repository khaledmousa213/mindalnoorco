import { Search, SlidersHorizontal, X } from 'lucide-react';
import type { Category } from '../lib/types';

export type SortKey = 'featured' | 'name' | 'newest';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (slug: string) => void;
  brands: string[];
  selectedBrand: string;
  onSelectBrand: (brand: string) => void;
  sortBy: SortKey;
  onSortChange: (sort: SortKey) => void;
  totalCount: number;
  filteredCount: number;
}

export const FilterBar = ({
  searchQuery,
  onSearchChange,
  categories,
  selectedCategory,
  onSelectCategory,
  brands,
  selectedBrand,
  onSelectBrand,
  sortBy,
  onSortChange,
  totalCount,
  filteredCount,
}: FilterBarProps) => {
  const isFiltered =
    searchQuery !== '' || selectedCategory !== 'all' || selectedBrand !== 'all';

  return (
    <div className="bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl shadow-xs p-3.5 space-y-3">
      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search products, brands, features…"
            className="w-full pl-10 pr-9 py-2 text-sm bg-slate-100/80 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-teal-500 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 lg:ml-auto">
          {brands.length > 1 && (
            <select
              value={selectedBrand}
              onChange={(e) => onSelectBrand(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-100 border border-slate-200 rounded-full text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
            >
              <option value="all">All brands</option>
              {brands.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          )}

          <div className="flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as SortKey)}
              className="px-3 py-1.5 text-xs bg-slate-100 border border-slate-200 rounded-full text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
            >
              <option value="featured">Featured first</option>
              <option value="name">Name A–Z</option>
              <option value="newest">Newest</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
        <button
          onClick={() => onSelectCategory('all')}
          className={`px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition cursor-pointer ${
            selectedCategory === 'all'
              ? 'bg-slate-900 text-white'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
          }`}
        >
          All categories
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.slug)}
            className={`px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition cursor-pointer ${
              selectedCategory === cat.slug
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            {cat.name}
          </button>
        ))}

        <span className="ml-auto text-xs text-slate-500 font-medium">
          {filteredCount} of {totalCount}
          {isFiltered && (
            <button
              onClick={() => {
                onSearchChange('');
                onSelectCategory('all');
                onSelectBrand('all');
              }}
              className="ml-3 text-teal-700 hover:text-teal-900 font-bold hover:underline cursor-pointer"
            >
              Reset
            </button>
          )}
        </span>
      </div>
    </div>
  );
};

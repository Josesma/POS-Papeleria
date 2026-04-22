import { Search, X, SlidersHorizontal } from 'lucide-react';

interface ProductSearchProps {
  search: string;
  onSearchChange: (value: string) => void;
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  inputRef?: React.RefObject<HTMLInputElement>;
}

export default function ProductSearch({
  search,
  onSearchChange,
  categories,
  selectedCategory,
  onCategoryChange,
  inputRef,
}: ProductSearchProps) {
  return (
    <div className="space-y-3">
      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          ref={inputRef}
          id="product-search"
          type="text"
          placeholder="Buscar producto por nombre o código de barras..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="input pl-11 pr-10"
          autoComplete="off"
        />
        {search && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        )}
      </div>

      {/* Category filters */}
      {categories.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          <SlidersHorizontal className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <button
            onClick={() => onCategoryChange('')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200
              ${
                !selectedCategory
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
          >
            Todas
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat === selectedCategory ? '' : cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200
                ${
                  selectedCategory === cat
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

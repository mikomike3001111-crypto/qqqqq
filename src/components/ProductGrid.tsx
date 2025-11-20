import { useState, useEffect } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { supabase, Product } from '../lib/supabase';
import ProductCard from './ProductCard';

interface ProductGridProps {
  category: string;
  searchQuery?: string;
}

type SortOption = 'featured' | 'price-low' | 'price-high' | 'newest';

export default function ProductGrid({ category, searchQuery }: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('all');
  const [subcategories, setSubcategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [category, searchQuery]);

  async function fetchProducts() {
    setLoading(true);
    try {
      let query = supabase
        .from('products')
        .select('*')
        .eq('in_stock', true)
        .order('sort_order', { ascending: true });

      if (category !== 'all') {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) throw error;

      setProducts(data || []);

      const uniqueSubcategories = [
        ...new Set(
          (data || [])
            .map((p) => p.subcategory)
            .filter((s): s is string => s !== null)
        ),
      ];
      setSubcategories(uniqueSubcategories);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }

  let filteredProducts = products;

  if (selectedSubcategory !== 'all') {
    filteredProducts = filteredProducts.filter((p) => p.subcategory === selectedSubcategory);
  }

  if (searchQuery && searchQuery.trim() !== '') {
    const query = searchQuery.toLowerCase();
    filteredProducts = filteredProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        (p.subcategory && p.subcategory.toLowerCase().includes(query)) ||
        (p.description && p.description.toLowerCase().includes(query))
    );
  }

  filteredProducts = filteredProducts.filter(
    (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
  );

  filteredProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'featured':
      default:
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || a.sort_order - b.sort_order;
    }
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold">
              {category === 'all' ? 'All Products' : category.charAt(0).toUpperCase() + category.slice(1)}
            </h2>
            <p className="text-gray-600 mt-1">{filteredProducts.length} items</p>
          </div>

          <div className="flex gap-2 items-center">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="newest">Newest First</option>
            </select>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="bg-gray-50 p-4 rounded-lg space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price Range: KSh {priceRange[0].toLocaleString()} - KSh {priceRange[1].toLocaleString()}
              </label>
              <div className="flex gap-4 items-center">
                <input
                  type="range"
                  min="0"
                  max="50000"
                  step="500"
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                  className="flex-1"
                />
                <input
                  type="range"
                  min="0"
                  max="50000"
                  step="500"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        )}

        {subcategories.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedSubcategory('all')}
              className={`px-4 py-2 text-sm border rounded transition-all ${
                selectedSubcategory === 'all'
                  ? 'border-black bg-black text-white'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              All
            </button>
            {subcategories.map((sub) => (
              <button
                key={sub}
                onClick={() => setSelectedSubcategory(sub)}
                className={`px-4 py-2 text-sm border rounded transition-all ${
                  selectedSubcategory === sub
                    ? 'border-black bg-black text-white'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        )}
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">No products available in this category yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}

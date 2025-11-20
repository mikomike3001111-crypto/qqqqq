import { useState } from 'react';
import { ShoppingBag, Heart } from 'lucide-react';
import { Product } from '../lib/supabase';
import { generateWhatsAppLink } from '../lib/whatsapp';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [selectedSize, setSelectedSize] = useState<string>(product.size || '');
  const [selectedColor, setSelectedColor] = useState<string>(product.color || '');
  const [isHovering, setIsHovering] = useState(false);
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const handleAddToCart = async () => {
    try {
      await addToCart(product, 1, selectedSize || product.size || '', selectedColor || product.color || '');
      alert('Added to cart!');
    } catch (error) {
      alert('Failed to add to cart');
    }
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await toggleWishlist(product);
    } catch (error) {
      console.error('Failed to update wishlist');
    }
  };

  const handleOrder = () => {
    const whatsappLink = generateWhatsAppLink(
      product.name,
      selectedSize || product.size || '',
      selectedColor || product.color || ''
    );
    window.open(whatsappLink, '_blank');
  };

  return (
    <div
      className="relative bg-white rounded-lg overflow-hidden shadow-md hover:shadow-2xl transition-shadow duration-300"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="aspect-square bg-gray-100 overflow-hidden relative">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className={`w-full h-full object-cover transition-transform duration-500 ${
              isHovering ? 'scale-110' : 'scale-100'
            }`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <span className="text-6xl">👕</span>
          </div>
        )}

        <button
          onClick={handleWishlist}
          className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-lg hover:scale-110 transition-transform"
        >
          <Heart
            className={`w-5 h-5 ${
              isInWishlist(product.id)
                ? 'fill-red-500 text-red-500'
                : 'text-gray-700'
            }`}
          />
        </button>

        {isHovering && (
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent animate-fade-in flex flex-col justify-end p-4">
            <div className="text-white space-y-2">
              <h3 className="font-semibold text-lg line-clamp-2">
                {product.name}
              </h3>
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold">KSh {(product.price || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-medium text-lg text-gray-900 line-clamp-2">
            {product.name}
          </h3>
          {product.color && (
            <p className="text-xs text-gray-500 uppercase tracking-wide mt-1">
              {product.color}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xl font-bold">KSh {(product.price || 0).toLocaleString()}</span>
        </div>

        {product.size && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-700">Size:</p>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedSize(product.size || '')}
                className={`px-3 py-1 text-xs border rounded transition-all ${
                  selectedSize === product.size
                    ? 'border-black bg-black text-white'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                {product.size}
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 mt-4">
          <button
            onClick={handleAddToCart}
            className="py-3 bg-black text-white font-medium hover:bg-gray-800 transition-colors rounded flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            Add to Cart
          </button>
          <button
            onClick={handleOrder}
            className="py-3 bg-green-500 text-white font-medium hover:bg-green-600 transition-colors rounded"
          >
            WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}

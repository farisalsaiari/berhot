import { ProductData } from '../types';

interface ProductCardProps {
  product: ProductData;
  onSelect: () => void;
}

export function ProductCard({ product, onSelect }: ProductCardProps) {
  return (
    <button
      onClick={onSelect}
      disabled={!product.available}
      className={`text-left p-4 rounded-xl border transition-all ${
        product.available
          ? 'border-gray-200 hover:border-blue-500 hover:shadow-md cursor-pointer bg-white'
          : 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
      }`}
    >
      {product.image ? (
        <div className="w-full h-20 rounded-lg bg-gray-100 mb-3 overflow-hidden">
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="w-full h-20 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 mb-3 flex items-center justify-center text-2xl">
          🍽
        </div>
      )}
      <div className="font-medium text-sm truncate">{product.name}</div>
      <div className="text-blue-600 font-bold text-sm mt-1">${product.price.toFixed(2)}</div>
      {!product.available && (
        <span className="text-xs text-red-500 mt-1 block">Unavailable</span>
      )}
    </button>
  );
}

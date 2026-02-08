import { ProductData } from '../types';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
  products: ProductData[];
  onSelect: (product: ProductData) => void;
  columns?: number;
}

export function ProductGrid({ products, onSelect, columns = 4 }: ProductGridProps) {
  return (
    <div
      className="grid gap-3"
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} onSelect={() => onSelect(product)} />
      ))}
    </div>
  );
}

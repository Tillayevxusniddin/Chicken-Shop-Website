// src/components/products/ProductList.tsx
import type { Product } from '../../types/product';
import ProductCard from './ProductCard';

interface ProductListProps {
  products: Product[];
}

const ProductList = ({ products }: ProductListProps) => {
  // Defensive: occasionally runtime error showed products.map is not a function.
  // This means the prop wasn't an array (maybe API returned paginated object or undefined).
  const safeProducts: Product[] = Array.isArray(products)
    ? products
    : ((): Product[] => {
        if (products && (products as any)?.results && Array.isArray((products as any).results)) {
          // Support a mistakenly passed paginated response
          return (products as any).results as Product[];
        }
        if (products && typeof products === 'object') {
          // One-off log for debugging (won't spam due to key)
          if (!(window as any).__loggedBadProducts) {
            // eslint-disable-next-line no-console
            console.warn('Unexpected products prop shape:', products);
            (window as any).__loggedBadProducts = true;
          }
        }
        return [];
      })();

  if (!safeProducts.length) {
    return <div className="text-center text-sm opacity-70">Mahsulotlar topilmadi.</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {safeProducts.map((product) => (
        <div key={product.id}>
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  );
};

export default ProductList;

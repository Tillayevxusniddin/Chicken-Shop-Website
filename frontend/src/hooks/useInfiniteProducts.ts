import { useCallback, useEffect, useRef, useState } from 'react';
import { useAppSelector } from '../store/hooks';
import { fetchProducts } from '../services/products';
import type { PaginatedResponse } from '../services/products';
import type { Product } from '../types/product';

interface UseInfiniteProductsOptions {
  pageSize?: number;
}

export function useInfiniteProducts({
  pageSize = 12,
}: UseInfiniteProductsOptions = {}) {
  const [pages, setPages] = useState<Product[][]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadingRef = useRef(false);
  const retryCountRef = useRef(0);
  const { user } = useAppSelector((s) => s.auth);
  const isSeller = user?.role === 'seller';

  const allProducts = pages.flat();

  const load = useCallback(
    async (target: number, append: boolean) => {
      if (isSeller) return; // Sellers don't need infinite public list
      if (loadingRef.current) return;
      if (!hasMore && target !== 1) return; // avoid calling beyond end repeatedly
      loadingRef.current = true;
      setLoading(true);
      setError(null);
      try {
        const data: PaginatedResponse<Product> = await fetchProducts(
          target,
          pageSize,
        );
        // If no results and not first page -> stop
        if (!data.results.length && target !== 1) {
          setHasMore(false);
          return;
        }
        setPages((prev) => (append ? [...prev, data.results] : [data.results]));
        setHasMore(Boolean(data.next));
        setPage(target);
        retryCountRef.current = 0; // reset on success
      } catch (e: unknown) {
        const err = e as
          | { response?: { status?: number }; message?: string }
          | undefined;
        if (err?.response?.status === 404) {
          setHasMore(false);
        } else {
          setError(err?.message || 'Ma\u02bblumot yuklashda xatolik');
          // basic retry guard to avoid runaway loop
          if (retryCountRef.current < 2) {
            retryCountRef.current += 1;
          } else {
            setHasMore(false);
          }
        }
      } finally {
        setLoading(false);
        loadingRef.current = false;
      }
    },
    [pageSize, hasMore, isSeller],
  );

  const reloadFirst = useCallback(() => load(1, false), [load]);
  const loadNext = useCallback(() => {
    if (hasMore && !loading) load(page + 1, true);
  }, [hasMore, loading, page, load]);

  useEffect(() => {
    if (!isSeller) reloadFirst();
  }, [reloadFirst, isSeller]);

  return {
    products: allProducts,
    page,
    hasMore,
    loading,
    error,
    reloadFirst,
    loadNext,
    isSeller,
  };
}

export default useInfiniteProducts;

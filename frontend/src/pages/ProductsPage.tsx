// src/pages/ProductsPage.tsx
import { Container, Typography, Box, CircularProgress, Button, Stack } from '@mui/material';
import ProductList from '../components/products/ProductList';
import { useInfiniteProducts } from '../hooks/useInfiniteProducts';
import { useAppSelector } from '../store/hooks';
import SellerProductsManager from '../components/products/SellerProductsManager';

const ProductsPage = () => {
  const { user } = useAppSelector(s => s.auth);
  const isSeller = user?.role === 'seller';
  const { products, loading, error, hasMore, loadNext, reloadFirst } = useInfiniteProducts({ pageSize: 12 });

  return (
    <Container>
      <Typography variant="h2" component="h1" sx={{ mt: 4, mb: 4 }}>
        {isSeller ? 'Mahsulotlarni boshqarish' : 'Bizning Mahsulotlar'}
      </Typography>
      {isSeller && (
        <Box sx={{ mb:4 }}>
          <SellerProductsManager />
        </Box>
      )}
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>Xatolik: {error}</Typography>
      )}
      {loading && !products.length && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
          <CircularProgress />
        </Box>
      )}
      {!isSeller && !!products.length && <ProductList products={products} />}
      {!isSeller && (
        <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 4 }}>
          <Button variant="outlined" onClick={reloadFirst} disabled={loading}>Yangilash</Button>
          {hasMore && (
            <Button variant="contained" onClick={loadNext} disabled={loading}>
              {loading ? 'Yuklanmoqda...' : 'Yana yuklash'}
            </Button>
          )}
        </Stack>
      )}
    </Container>
  );
};

export default ProductsPage;
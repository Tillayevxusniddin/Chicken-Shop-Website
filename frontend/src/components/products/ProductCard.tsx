// src/components/products/ProductCard.tsx
import { Card, CardContent, Typography, Button, CardActions, Box, Stack, Chip } from '@mui/material';
import { useAppSelector } from '../../store/hooks';
import type { Product } from '../../types/product';
import { useAppDispatch } from '../../store/hooks'; // Hook'ni import qilamiz
import { addToCart } from '../../store/cartSlice'; // Action'ni import qilamiz

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(s => s.auth);

  const handleAddToCart = () => {
    // "Savatga qo'shish" tugmasi bosilganda action'ni jo'natamiz
    dispatch(addToCart(product));
  };

  const getProductTypeName = (type: string) => {
    const names = {
      leg: "Tovuq oyog'i",
      wing: "Tovuq qanoti",
      breast: "Tovuq ko'kragi",
    };
    return names[type as keyof typeof names] || "Noma'lum";
  }

  return (
    <Card
      sx={(theme) => ({
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: theme.palette.mode === 'dark'
          ? 'linear-gradient(155deg,rgba(255,193,7,.09),rgba(255,111,0,.05) 60%,rgba(255,255,255,.04))'
          : 'linear-gradient(155deg,#ffffff,#fff7e6 60%,#ffefd0)',
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform .35s ease, box-shadow .35s ease',
        '&:hover': {
          transform: 'translateY(-6px)'
        }
      })}
    >
      <Box sx={{ position: 'relative', pt: '60%', overflow: 'hidden' }}>
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            style={{ position: 'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', transition:'transform .6s ease' }}
            onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
            onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          />
        ) : (
          <Box sx={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:46 }}>
            🐔
          </Box>
        )}
        <Chip
          label={getProductTypeName(product.product_type)}
          size="small"
          sx={{
            position: 'absolute',
            top: 10,
            left: 10,
            textTransform: 'capitalize',
            bgcolor: 'rgba(0,0,0,.55)',
            color: '#fff',
            backdropFilter: 'blur(4px)'
          }}
        />
        {!product.is_available && (
          <Chip
            label="Sotuvda yo'q"
            size="small"
            color="warning"
            sx={{ position: 'absolute', top: 10, right: 10 }}
          />
        )}
      </Box>
      <CardContent sx={{ flexGrow: 1, display:'flex', flexDirection:'column' }}>
        <Typography gutterBottom variant="subtitle1" sx={{ fontWeight: 600 }} noWrap>
          {product.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }} noWrap>
          {product.description || 'Ma\'lumot yo\'q.'}
        </Typography>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 'auto' }}>
          <Chip size="small" color={product.stock_kg > 0 ? 'success' : 'default'} label={`${product.stock_kg} kg`} />
          {user?.role === 'buyer' && (
            <Button size="small" variant="contained" onClick={handleAddToCart} disabled={!product.is_available || product.stock_kg <= 0}>
              Savatga
            </Button>
          )}
        </Stack>
      </CardContent>
      {user?.role === 'buyer' && (
        <CardActions sx={{ pt: 0, px: 2, pb: 2 }}>
          <Button size="small" color="secondary" variant="text" onClick={handleAddToCart} disabled={!product.is_available || product.stock_kg <= 0}>
            Qo'shish
          </Button>
        </CardActions>
      )}
    </Card>
  );
};

export default ProductCard;
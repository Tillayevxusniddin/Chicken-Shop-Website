// src/pages/CartPage.tsx
import { 
  Container, 
  Typography, 
  Box, 
  List, 
  ListItem, 
  ListItemText, 
  IconButton, 
  Button, 
  CircularProgress,
  Stack,
  TextField
} from '@mui/material';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { removeFromCart, clearCart, incrementQuantity, decrementQuantity, setQuantity } from '../store/cartSlice';
import { createOrder } from '../store/orderSlice';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate, Link } from 'react-router-dom';

const CartPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items } = useAppSelector((state) => state.cart);
  const { accessToken } = useAppSelector((state) => state.auth);
  const { status, error } = useAppSelector((state) => state.orders);

  const handleRemove = (productId: number) => {
    dispatch(removeFromCart(productId));
  };

  const handleCreateOrder = async () => {
    if (items.length === 0) return;

    const orderData = {
      items: items.map(item => ({
        product_id: item.product.id,
        quantity_kg: item.quantity_kg,
      })),
    };

    try {
      await dispatch(createOrder(orderData)).unwrap();
      dispatch(clearCart());
      navigate('/orders'); // Buyurtmalarim sahifasiga o'tish
    } catch (err) {
      console.error('Failed to create order: ', err);
    }
  };

  return (
    <Container>
      <Typography variant="h2" component="h1" sx={{ mt: 4, mb: 4 }}>
        Sizning Savatingiz
      </Typography>

      {!accessToken ? (
        <Typography>
          Buyurtma berish uchun, iltimos, <Link to="/login">tizimga kiring</Link>.
        </Typography>
      ) : items.length === 0 ? (
        <Typography>Sizning savatingiz bo'sh.</Typography>
      ) : (
        <Box>
          <List>
            {items.map(item => (
              <ListItem
                key={item.product.id}
                secondaryAction={
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => handleRemove(item.product.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <ListItemText primary={item.product.name} />
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mr: 2 }}>
                  <IconButton size="small" onClick={() => dispatch(decrementQuantity(item.product.id))} aria-label="Kamaytirish">-</IconButton>
                  <TextField
                    size="small"
                    type="number"
                    inputProps={{ min: 1, step: 1, style: { width: 70, textAlign: 'center' } }}
                    value={item.quantity_kg}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val)) dispatch(setQuantity({ productId: item.product.id, quantity: val }));
                    }}
                  />
                  <IconButton size="small" onClick={() => dispatch(incrementQuantity(item.product.id))} aria-label="Oshirish">+</IconButton>
                  <Typography variant="caption" sx={{ minWidth: 40, textAlign: 'right' }}>{item.quantity_kg} kg</Typography>
                </Stack>
              </ListItem>
            ))}
          </List>

          <Button 
            variant="contained" 
            sx={{ mt: 4 }} 
            onClick={handleCreateOrder}
            disabled={status === 'loading'}
          >
            {status === 'loading' ? <CircularProgress size={24} /> : 'Buyurtma berish'}
          </Button>

          {status === 'failed' && (
            <Typography color="error" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}
        </Box>
      )}
    </Container>
  );
};

export default CartPage;

// src/pages/OrdersPage.tsx
import { useEffect } from 'react';
import { Container, Typography, Box, CircularProgress, Paper, List, ListItem, ListItemText, Divider } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchOrders } from '../store/orderSlice';
import useWebSocketOrders from '../hooks/useWebSocketOrders';

const OrdersPage = () => {
  const dispatch = useAppDispatch();
  const { orders, status, error } = useAppSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);
  
  // Real-time updates (order status)
  useWebSocketOrders();

  let content;

  if (status === 'loading') {
    content = <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>;
  } else if (status === 'succeeded') {
    content = orders.length === 0 ? (
      <Typography>Sizda hali buyurtmalar mavjud emas.</Typography>
    ) : (
      <List>
        {orders.map(order => (
          <Paper key={order.id} sx={{ mb: 2, p: 2 }}>
            <ListItem>
              <ListItemText 
                primary={`Buyurtma #${order.order_number}`}
                secondary={`Holati: ${order.status} | Sana: ${new Date(order.created_at).toLocaleDateString()}`}
              />
            </ListItem>
            <Divider sx={{ my: 1 }} />
            <Typography sx={{ pl: 2, fontWeight: 'bold' }}>Mahsulotlar:</Typography>
            <List disablePadding sx={{ pl: 4 }}>
              {order.items.map(item => (
                <ListItemText key={item.id} primary={`${item.product.name} - ${item.quantity_kg} kg`} />
              ))}
            </List>
          </Paper>
        ))}
      </List>
    );
  } else if (status === 'failed') {
    content = <Typography color="error">Xatolik: {error}</Typography>;
  }

  return (
    <Container>
      <Typography variant="h2" component="h1" sx={{ mt: 4, mb: 4 }}>
        Mening Buyurtmalarim
      </Typography>
      {content}
    </Container>
  );
};

export default OrdersPage;

// src/components/dashboard/OrdersTable.tsx
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button } from '@mui/material';
import type { Order } from '../../types/order';
import { useAppDispatch } from '../../store/hooks';
import { updateOrderStatus } from '../../store/orderSlice';

interface OrdersTableProps {
  orders: Order[];
}

const OrdersTable = ({ orders }: OrdersTableProps) => {
    const dispatch = useAppDispatch();

    const handleStatusChange = (orderId: number, newStatus: string) => {
        dispatch(updateOrderStatus({ orderId, status: newStatus }));
    };

    const getNextStatus = (currentStatus: string): string | null => {
        const flow = {
            'pending': 'reviewing',
            'reviewing': 'process',
            'process': 'shipping',
            'shipping': 'completed'
        };
        return flow[currentStatus as keyof typeof flow] || null;
    }

    const getStatusText = (status: string) => {
        const texts = {
            'pending': 'Kutilmoqda',
            'reviewing': "Ko'rib chiqilmoqda",
            'process': 'Tayyorlanmoqda',
            'shipping': "Jo'natilmoqda",
            'completed': 'Yakunlangan',
            'cancelled': 'Bekor qilingan',
        };
        return texts[status as keyof typeof texts] || status;
    }

    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Buyurtma #</TableCell>
                        <TableCell>Xaridor</TableCell>
                        <TableCell>Telefon</TableCell>
                        <TableCell>Holati</TableCell>
                        <TableCell>Harakat</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {orders.map((order) => {
                        const nextStatus = getNextStatus(order.status);
                        return (
                            <TableRow key={order.id}>
                                <TableCell>{order.order_number}</TableCell>
                                <TableCell>{order.buyer.username}</TableCell>
                                <TableCell>{/* Hozircha buyer'da tel yo'q, keyin qo'shamiz */}</TableCell>
                                <TableCell>{getStatusText(order.status)}</TableCell>
                                <TableCell>
                                    {nextStatus && (
                                        <Button 
                                            variant="contained" 
                                            size="small"
                                            onClick={() => handleStatusChange(order.id, nextStatus)}
                                        >
                                            {getStatusText(nextStatus)}'ga o'tkazish
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default OrdersTable;
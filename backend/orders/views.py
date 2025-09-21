from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

from .models import Order, OrderItem
from django.utils.dateparse import parse_date
from .serializers import OrderSerializer, OrderCreateSerializer, OrderReportSerializer
from .models import OrderReport
from .tasks import generate_order_report
from django.http import FileResponse
from django.utils import timezone
from datetime import timedelta
from django.db.models import Count, Sum
import os
from users.permissions import IsSellerUser, IsBuyerUser

class OrderViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        base_qs = Order.objects.select_related('buyer').prefetch_related('items__product')
        # Sellers see all, buyers only their own
        qs = base_qs if getattr(user, 'role', None) == 'seller' else base_qs.filter(buyer=user)

        # Status filter
        status_param = self.request.query_params.get('status')
        if status_param:
            qs = qs.filter(status=status_param)

        # Date range filters (created_at date portion)
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        if start_date:
            sd = parse_date(start_date)
            if sd:
                qs = qs.filter(created_at__date__gte=sd)
        if end_date:
            ed = parse_date(end_date)
            if ed:
                qs = qs.filter(created_at__date__lte=ed)

        # Search by order number
        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(order_number__icontains=search)

        return qs.order_by('-created_at')

    def get_serializer_class(self):
        if self.action == 'create':
            return OrderCreateSerializer
        return OrderSerializer

    def create(self, request, *args, **kwargs):
        # Only buyers can create orders
        if not (request.user and getattr(request.user, 'role', None) == 'buyer'):
            return Response({'detail': 'Faqat xaridor buyurtma yaratishi mumkin.'}, status=status.HTTP_403_FORBIDDEN)
        return super().create(request, *args, **kwargs)

    @action(detail=True, methods=['patch'], permission_classes=[IsSellerUser])
    def update_status(self, request, pk=None):
        order = self.get_object()
        new_status = request.data.get('status')

        if not new_status:
            return Response({'error': 'Yangi status ko\'rsatilmagan'}, status=status.HTTP_400_BAD_REQUEST)

        valid_transitions = {
            'pending': ['reviewing', 'cancelled'],
            'reviewing': ['process', 'cancelled'],
            'process': ['shipping'],
            'shipping': ['completed']
        }

        current_status = order.status
        allowed_statuses = valid_transitions.get(current_status, [])

        if new_status not in allowed_statuses:
            return Response(
                {'error': f"'{current_status}' holatidan '{new_status}' holatiga o'tish mumkin emas"},
                status=status.HTTP_400_BAD_REQUEST
            )

        previous_status = order.status
        order.status = new_status
        order.save(update_fields=['status'])

        # If order moves to cancelled from any non-final state and was not completed, restore stock
        if new_status == 'cancelled' and previous_status != 'completed':
            for item in order.items.select_related('product'):
                item.product.stock_kg = item.product.stock_kg + item.quantity_kg
                item.product.save(update_fields=['stock_kg'])
        serializer = self.get_serializer(order)

        # --- WEBSOCKET ORQALI XABAR YUBORISH QISMI ---
        try:
            channel_layer = get_channel_layer()
            # Xabar yuboriladigan guruhni aniqlaymiz (xaridorning shaxsiy guruhi)
            group_name = f'user_{order.buyer.id}'

            # Consumer'ga yuboriladigan ma'lumotni tayyorlaymiz
            async_to_sync(channel_layer.group_send)(
                group_name,
                {
                    "type": "order_status_update",  # Bu consumer'dagi metod nomiga mos bo'lishi kerak
                    "order": serializer.data
                }
            )
        except Exception as e:
            # WebSocket'da xatolik yuz bersa ham, javob qaytaraveramiz
            # Bu xatolikni log faylga yozib qo'yish yaxshi amaliyot
            print(f"WebSocket xabarni yuborishda xatolik: {e}")
        # --- WEBSOCKET QISMI TUGADI ---

        return Response(serializer.data)

    @action(detail=False, methods=['post'], permission_classes=[IsSellerUser])
    def create_report(self, request):
        """On-demand report generation (daily or range)."""
        report_type = request.data.get('report_type')  # daily | range
        start_date = request.data.get('start_date')
        end_date = request.data.get('end_date')
        if report_type not in ['daily', 'range']:
            return Response({'error': 'report_type noto\'g\'ri'}, status=400)
        if report_type == 'daily' and not start_date:
            return Response({'error': 'daily uchun start_date kerak'}, status=400)
        if report_type == 'range' and (not start_date or not end_date):
            return Response({'error': 'range uchun start_date va end_date kerak'}, status=400)
        report = OrderReport.objects.create(
            created_by=request.user,
            report_type=report_type,
            start_date=start_date,
            end_date=end_date,
            file_path='',
            status='pending'
        )
        generate_order_report.delay(report.id)
        return Response(OrderReportSerializer(report).data, status=201)

    @action(detail=False, methods=['get'], permission_classes=[IsSellerUser])
    def reports(self, request):
        qs = OrderReport.objects.filter(created_by=request.user).order_by('-created_at')
        return Response(OrderReportSerializer(qs, many=True).data)

    @action(detail=True, methods=['get'], permission_classes=[IsSellerUser])
    def download_report(self, request, pk=None):
        try:
            report = OrderReport.objects.get(id=pk, created_by=request.user)
            if report.status != 'ready' or not report.file_path:
                return Response({'error': 'Hisobot tayyor emas'}, status=400)
            if not os.path.exists(report.file_path):
                return Response({'error': 'Fayl topilmadi'}, status=404)
            return FileResponse(open(report.file_path, 'rb'), as_attachment=True, filename=os.path.basename(report.file_path))
        except OrderReport.DoesNotExist:
            return Response({'error': 'Topilmadi'}, status=404)

    @action(detail=False, methods=['get'], permission_classes=[IsSellerUser])
    def stats(self, request):
        """Seller dashboard statistics."""
        qs = Order.objects.all()
        total_orders = qs.count()
        total_completed = qs.filter(status='completed').count()
        completed_weight = qs.filter(status='completed').aggregate(w=Sum('total_weight'))['w'] or 0

        status_breakdown = {
            row['status']: row['c'] for row in qs.values('status').annotate(c=Count('id'))
        }

        # Product type breakdown (count & total quantity kg across items)
        product_type_breakdown = {}
        item_qs = OrderItem.objects.select_related('product')
        for row in item_qs.values('product__product_type').annotate(c=Count('id'), q=Sum('quantity_kg')):
            product_type_breakdown[row['product__product_type']] = {
                'orders': row['c'],
                'quantity_kg': float(row['q'] or 0)
            }

        # Last 7 days trend (including today) + deltas
        today = timezone.localdate()
        last7 = []
        for i in range(6, -1, -1):  # 6 days ago to today
            day = today - timedelta(days=i)
            day_orders = qs.filter(created_at__date=day)
            day_completed_weight = day_orders.filter(status='completed').aggregate(w=Sum('total_weight'))['w'] or 0
            last7.append({
                'date': day.isoformat(),
                'count': day_orders.count(),
                'completed_weight': float(day_completed_weight),
            })

        # Delta calculations
        today_count = last7[-1]['count'] if last7 else 0
        yesterday_count = last7[-2]['count'] if len(last7) > 1 else 0
        if yesterday_count == 0:
            day_count_delta_pct = 100.0 if today_count > 0 else 0.0
        else:
            day_count_delta_pct = ((today_count - yesterday_count) / yesterday_count) * 100.0

        last7_total = sum(d['count'] for d in last7)
        prev7_start = today - timedelta(days=13)
        prev7_end = today - timedelta(days=7)
        prev7_total = qs.filter(created_at__date__gte=prev7_start, created_at__date__lte=prev7_end).count()
        if prev7_total == 0:
            week_count_delta_pct = 100.0 if last7_total > 0 else 0.0
        else:
            week_count_delta_pct = ((last7_total - prev7_total) / prev7_total) * 100.0

        return Response({
            'total_orders': total_orders,
            'total_completed': total_completed,
            'total_weight_completed': float(completed_weight),
            'status_breakdown': status_breakdown,
            'product_type_breakdown': product_type_breakdown,
            'last7days': last7,
            'metrics': {
                'today_count': today_count,
                'yesterday_count': yesterday_count,
                'day_count_delta_pct': day_count_delta_pct,
                'last7_total': last7_total,
                'prev7_total': prev7_total,
                'week_count_delta_pct': week_count_delta_pct,
            }
        })

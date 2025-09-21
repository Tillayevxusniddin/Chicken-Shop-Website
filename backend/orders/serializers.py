# orders/serializers.py

import logging
from rest_framework import serializers
from .models import Order, OrderItem, OrderHistory, OrderReport
from products.serializers import ProductSerializer
from users.serializers import UserSerializer
from .services import TelegramService  # still used for potential formatting tests/logging
from .tasks import send_order_telegram_notification
from django.conf import settings
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from products.models import Product

# Xatoliklarni yozib borish uchun logger'ni olamiz
logger = logging.getLogger(__name__)

class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'quantity_kg']

class OrderItemCreateSerializer(serializers.ModelSerializer):
    # Bu serializer faqat buyurtma yaratishda ishlatiladi
    class Meta:
        model = OrderItem
        fields = ['product', 'quantity_kg']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    buyer = UserSerializer(read_only=True)

    class Meta:
        model = Order
        fields = '__all__'

class OrderCreateSerializer(serializers.ModelSerializer):
    items = OrderItemCreateSerializer(many=True)

    class Meta:
        model = Order
        fields = ['id', 'items', 'notes']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        # Buyurtmani joriy foydalanuvchi nomidan yaratamiz
        order = Order.objects.create(buyer=self.context['request'].user, **validated_data)
        total_weight = 0
        for item_data in items_data:
            product = item_data['product'] if isinstance(item_data['product'], Product) else Product.objects.get(pk=item_data['product'].id if hasattr(item_data['product'], 'id') else item_data['product'])
            qty = item_data['quantity_kg']
            # Stock check
            if product.stock_kg < qty:
                raise serializers.ValidationError({
                    'stock_kg': f"'{product.name}' uchun yetarli zaxira yo'q. Mavjud: {product.stock_kg} kg"
                })
            # Deduct temporary stock
            product.stock_kg = product.stock_kg - qty
            product.save(update_fields=['stock_kg'])
            OrderItem.objects.create(order=order, product=product, quantity_kg=qty)
            total_weight += qty
        
        order.total_weight = total_weight
        order.save()

        # --- TELEGRAM XABARINI YUBORISH QISMI ---
        try:
            if getattr(settings, 'CELERY_TASK_ALWAYS_EAGER', False):
                send_order_telegram_notification.run(order_id=order.id)
            else:
                send_order_telegram_notification.delay(order.id)
        except Exception as e:
            logger.error(f"Celery telegram task enqueue failed (order {order.id}): {e}")
        # --- TELEGRAM QISMI TUGADI ---

        # --- SELLER WEBSOCKET BROADCAST ---
        try:
            channel_layer = get_channel_layer()
            serializer = OrderSerializer(order, context=self.context)
            async_to_sync(channel_layer.group_send)(
                'sellers',
                {
                    'type': 'new_order_created',
                    'order': serializer.data
                }
            )
        except Exception as e:
            logger.error(f"Seller broadcast failed (order {order.id}): {e}")
        # --- BROADCAST END ---

        return order


class OrderReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderReport
        fields = '__all__'
        read_only_fields = ['created_by', 'file_path', 'status', 'error_message', 'created_at']
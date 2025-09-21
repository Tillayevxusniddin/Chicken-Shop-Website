# orders/admin.py

from django.contrib import admin
from .models import Order, OrderItem, OrderHistory

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 1 # Standart bitta qo'shimcha qator
    readonly_fields = ('created_at',)

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('order_number', 'buyer', 'status', 'total_weight', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('order_number', 'buyer__username')
    readonly_fields = ('order_number', 'created_at', 'updated_at', 'total_weight')
    inlines = [OrderItemInline] # Buyurtma tarkibini ichida ko'rsatish

@admin.register(OrderHistory)
class OrderHistoryAdmin(admin.ModelAdmin):
    list_display = ('buyer', 'created_at')
    search_fields = ('buyer__username',)
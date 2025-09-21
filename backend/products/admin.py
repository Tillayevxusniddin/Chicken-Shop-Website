# products/admin.py

from django.contrib import admin
from .models import Product

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'product_type', 'is_available', 'created_at')
    list_filter = ('product_type', 'is_available')
    search_fields = ('name', 'description')
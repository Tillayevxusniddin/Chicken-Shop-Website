# products/serializers.py

from rest_framework import serializers
from .models import Product


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'product_type', 'description', 'is_available', 'stock_kg',
            'created_at', 'updated_at', 'image'
        ]
        read_only_fields = ['created_at', 'updated_at']
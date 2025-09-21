# products/views.py

from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Product
from .serializers import ProductSerializer
from users.permissions import IsSellerUser

class ProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer

    def get_queryset(self):
        user = self.request.user if self.request else None
        base = Product.objects.all()
        if not user or not getattr(user, 'is_authenticated', False):
            return base.filter(is_available=True)
        if getattr(user, 'role', None) == 'seller':
            return base
        return base.filter(is_available=True)

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [permissions.AllowAny]
        else:
            permission_classes = [IsSellerUser]
        return [p() for p in permission_classes]

    @action(detail=True, methods=['post'], permission_classes=[IsSellerUser])
    def upload_image(self, request, pk=None):
        product = self.get_object()
        file_obj = request.FILES.get('image')
        if not file_obj:
            return Response({'error': 'Rasm yuborilmadi'}, status=status.HTTP_400_BAD_REQUEST)
        product.image = file_obj
        product.save()
        return Response(ProductSerializer(product, context={'request': request}).data)
# users/views.py

from rest_framework import generics, permissions
from .serializers import RegisterSerializer, UserSerializer

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny] # Ro'yxatdan o'tish uchun ruxsat kerak emas
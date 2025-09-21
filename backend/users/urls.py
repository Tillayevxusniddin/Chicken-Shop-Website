# users/urls.py

from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import RegisterView
from .views_token import CustomTokenObtainPairView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('login/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
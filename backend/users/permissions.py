# users/permissions.py

from rest_framework.permissions import BasePermission

class IsSellerUser(BasePermission):
    """
    Allows access only to users with the 'seller' role.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'seller')
    
class IsBuyerUser(BasePermission):
    """Allows access only to users with the 'buyer' role."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'buyer')
    
    
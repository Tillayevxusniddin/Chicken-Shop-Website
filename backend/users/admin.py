# users/admin.py

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser

class CustomUserAdmin(UserAdmin):
    model = CustomUser
    # Admin panelda ko'rsatiladigan maydonlar
    list_display = ['username', 'email', 'first_name', 'last_name', 'role', 'is_staff']
    # list_display'ga qo'shimcha maydonlarni qo'shish uchun
    fieldsets = UserAdmin.fieldsets + (
        ('Qo\'shimcha ma\'lumotlar', {'fields': ('role', 'phone_number', 'address')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Qo\'shimcha ma\'lumotlar', {'fields': ('role', 'phone_number', 'address')}),
    )

admin.site.register(CustomUser, CustomUserAdmin)
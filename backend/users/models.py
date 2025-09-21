from django.db import models
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ('buyer', 'Xaridor'),
        ('seller', 'Sotuvchi'),
    )

    phone_number = models.CharField(max_length=20, blank=True, null=True, verbose_name="Telefon raqami")
    address = models.TextField(blank=True, null=True, verbose_name="Manzil")
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='buyer', verbose_name="Rol")

    def __str__(self):
        return self.username
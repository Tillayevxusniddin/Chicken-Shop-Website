# orders/models.py

from django.db import models
from django.conf import settings
import uuid

class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Kutilmoqda'),
        ('reviewing', "Ko'rib chiqilmoqda"),
        ('process', 'Tayyorlanmoqda'),
        ('shipping', "Jo'natilmoqda"),
        ('completed', 'Yakunlangan'),
        ('cancelled', 'Bekor qilingan'),
    ]

    buyer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='orders', verbose_name="Xaridor")
    order_number = models.CharField(max_length=20, unique=True, editable=False, verbose_name="Buyurtma raqami")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', verbose_name="Holati")
    total_weight = models.DecimalField(max_digits=10, decimal_places=2, default=0.0, verbose_name="Jami og'irlik (kg)")
    notes = models.TextField(blank=True, null=True, verbose_name="Izohlar")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Yaratilgan vaqti")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Yangilangan vaqti")

    # WhatsApp uchun qo'shimcha maydonlar
    whatsapp_sent = models.BooleanField(default=False)
    whatsapp_message_id = models.CharField(max_length=100, blank=True, null=True)

    def save(self, *args, **kwargs):
        if not self.order_number:
            # Unikal buyurtma raqamini generatsiya qilamiz
            self.order_number = str(uuid.uuid4()).split('-')[4].upper()
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"Buyurtma #{self.order_number} - {self.buyer.username}"

    class Meta:
        indexes = [
            models.Index(fields=['created_at']),
            models.Index(fields=['status']),
            models.Index(fields=['buyer', 'created_at']),
        ]
        ordering = ['-created_at']

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items', verbose_name="Buyurtma")
    product = models.ForeignKey('products.Product', on_delete=models.CASCADE, verbose_name="Mahsulot")
    quantity_kg = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Miqdori (kg)")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Yaratilgan vaqti")

    def __str__(self):
        return f"{self.quantity_kg}kg - {self.product.name}"

    class Meta:
        indexes = [
            models.Index(fields=['order']),
            models.Index(fields=['product']),
            models.Index(fields=['order', 'product']),
        ]

class OrderHistory(models.Model):
    buyer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='order_history', verbose_name="Xaridor")
    order_data = models.JSONField(verbose_name="Buyurtma ma'lumotlari")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Yaratilgan vaqti")

    def __str__(self):
        return f"Tarix: {self.buyer.username} - {self.created_at.strftime('%Y-%m-%d')}"


class OrderReport(models.Model):
    """Excel hisobot metadata (seller only)."""
    REPORT_TYPES = (
        ('daily', 'Daily'),
        ('range', 'Date Range'),
    )
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='order_reports')
    report_type = models.CharField(max_length=20, choices=REPORT_TYPES)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    file_path = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, default='pending')  # pending, ready, failed
    error_message = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Report {self.id} ({self.report_type})"
from django.db import models

class Product(models.Model):
    PRODUCT_TYPE_CHOICES = (
        ('leg', "Tovuq oyog'i"),
        ('wing', "Tovuq qanoti"),
        ('breast', "Tovuq ko'kragi"),
    )

    name = models.CharField(max_length=100, verbose_name="Nomi")
    product_type = models.CharField(max_length=20, choices=PRODUCT_TYPE_CHOICES, verbose_name="Mahsulot turi")
    description = models.TextField(blank=True, null=True, verbose_name="Tavsifi")
    is_available = models.BooleanField(default=True, verbose_name="Mavjudligi")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Yaratilgan vaqti")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Yangilangan vaqti")
    image = models.ImageField(upload_to='products/', blank=True, null=True)
    stock_kg = models.DecimalField(max_digits=10, decimal_places=2, default=0.00, verbose_name="Ombordagi miqdor (kg)")

    def __str__(self):
        return self.name

    class Meta:
        indexes = [
            models.Index(fields=['product_type']),
            models.Index(fields=['is_available']),
            models.Index(fields=['created_at']),
            models.Index(fields=['stock_kg']),
        ]
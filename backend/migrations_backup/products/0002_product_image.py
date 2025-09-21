# Backup copy of deprecated no-op migration
from django.db import migrations

class Migration(migrations.Migration):
    dependencies = [
        ('products', '0002_product_stock_kg_and_more'),
    ]
    operations = []

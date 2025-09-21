# Backup copy with stock_kg addition
from django.db import migrations, models

class Migration(migrations.Migration):
    dependencies = [
        ('products', '0001_initial'),
    ]
    operations = [
        migrations.AddField(
            model_name='product',
            name='stock_kg',
            field=models.DecimalField(decimal_places=2, default=0.0, max_digits=10, verbose_name='Ombordagi miqdor (kg)'),
        ),
        migrations.AddIndex(
            model_name='product',
            index=models.Index(fields=['stock_kg'], name='products_pr_stock_k_3fd1ad_idx'),
        ),
    ]

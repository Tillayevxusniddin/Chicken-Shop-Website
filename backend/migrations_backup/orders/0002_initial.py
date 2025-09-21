# Backup copy orders 0002
from django.db import migrations, models
import django.db.models.deletion
from django.conf import settings

class Migration(migrations.Migration):
    initial = True
    dependencies = [
        ('orders', '0001_initial'),
        ('products', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]
    operations = [
        migrations.AddField(
            model_name='order',
            name='buyer',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='orders', to=settings.AUTH_USER_MODEL, verbose_name='Xaridor'),
        ),
        migrations.AddField(
            model_name='orderhistory',
            name='buyer',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='order_history', to=settings.AUTH_USER_MODEL, verbose_name='Xaridor'),
        ),
        migrations.AddField(
            model_name='orderitem',
            name='order',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='items', to='orders.order', verbose_name='Buyurtma'),
        ),
        migrations.AddField(
            model_name='orderitem',
            name='product',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='products.product', verbose_name='Mahsulot'),
        ),
        migrations.AddField(
            model_name='orderreport',
            name='created_by',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='order_reports', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddIndex(
            model_name='order',
            index=models.Index(fields=['created_at'], name='orders_orde_created_0e92de_idx'),
        ),
        migrations.AddIndex(
            model_name='order',
            index=models.Index(fields=['status'], name='orders_orde_status_c6dd84_idx'),
        ),
        migrations.AddIndex(
            model_name='order',
            index=models.Index(fields=['buyer', 'created_at'], name='orders_orde_buyer_i_1adc6e_idx'),
        ),
        migrations.AddIndex(
            model_name='orderitem',
            index=models.Index(fields=['order'], name='orders_orde_order_i_5d347b_idx'),
        ),
        migrations.AddIndex(
            model_name='orderitem',
            index=models.Index(fields=['product'], name='orders_orde_product_32ff41_idx'),
        ),
        migrations.AddIndex(
            model_name='orderitem',
            index=models.Index(fields=['order', 'product'], name='orders_orde_order_i_52f79a_idx'),
        ),
    ]

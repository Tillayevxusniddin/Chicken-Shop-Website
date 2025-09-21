# orders/tasks.py

import pandas as pd
from celery import shared_task
from django.utils import timezone
from .models import Order, OrderReport
import os
from .services import TelegramService
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

@shared_task
def generate_daily_report():
    """
    Shu kungi bajarilgan (completed) buyurtmalar bo'yicha kunlik Excel-hisobot yaratadi.
    """
    today = timezone.now().date()
    # Statusi 'completed' va yakunlangan vaqti bugungi sana bo'lgan buyurtmalarni olamiz
    completed_orders = Order.objects.filter(
        status='completed',
        updated_at__date=today
    ).select_related('buyer').prefetch_related('items__product')

    if not completed_orders.exists():
        return f"{today} sanasida yakunlangan buyurtmalar mavjud emas."

    report_data = []
    for order in completed_orders:
        for item in order.items.all():
            report_data.append({
                'Buyurtma Raqami': order.order_number,
                'Xaridor': f"{order.buyer.first_name} {order.buyer.last_name}",
                'Telefon': order.buyer.phone_number,
                'Manzil': order.buyer.address,
                'Mahsulot': item.product.name,
                'Miqdori (kg)': float(item.quantity_kg), # Excel uchun float'ga o'tkazamiz
                'Buyurtma Vaqti': order.created_at.strftime('%Y-%m-%d %H:%M'),
                'Yakunlangan Vaqti': order.updated_at.strftime('%Y-%m-%d %H:%M'),
            })
    
    # Pandas DataFrame yaratamiz
    df = pd.DataFrame(report_data)
    
    # Fayl nomini va yo'lini tayyorlaymiz
    filename = f"kunlik_hisobot_{today}.xlsx"
    filepath = os.path.join('reports', filename)
    
    # Excel fayliga saqlaymiz
    df.to_excel(filepath, index=False, engine='openpyxl')
    
    return f"Hisobot muvaffaqiyatli yaratildi: {filepath}"


@shared_task(bind=True, max_retries=3, default_retry_delay=30)
def send_order_telegram_notification(self, order_id: int):
    """Buyurtma yaratilganda Telegram xabarini asenkron yuborish.

    Retries: 3 marta, 30s oraliq bilan.
    """
    try:
        if not settings.TELEGRAM_BOT_TOKEN or not settings.TELEGRAM_CHAT_ID:
            logger.warning("Telegram sozlamalari to'liq emas, xabar yuborilmadi.")
            return "SKIPPED"
        order = Order.objects.select_related('buyer').prefetch_related('items__product').get(id=order_id)
        service = TelegramService()
        resp = service.send_order_notification(order)
        if not resp:
            raise ValueError("Telegram javobi bo'sh yoki xatolik.")
        return "SENT"
    except Order.DoesNotExist:
        logger.error(f"Order {order_id} topilmadi – Telegram xabari yuborilmadi")
        return "MISSING"
    except Exception as e:
        logger.error(f"Telegram xabari yuborishda xatolik (order {order_id}): {e}")
        try:
            self.retry(exc=e)
        except self.MaxRetriesExceededError:
            logger.error(f"Max retries tugadi (order {order_id})")
            return "FAILED"
        return "RETRYING"


@shared_task(bind=True)
def generate_order_report(self, report_id: int):
    """OrderReport yozuvi bo'yicha Excel fayl yaratish (daily yoki date range)."""
    try:
        report = OrderReport.objects.get(id=report_id)
        qs = Order.objects.filter(status='completed').select_related('buyer').prefetch_related('items__product')
        if report.report_type == 'daily' and report.start_date:
            qs = qs.filter(updated_at__date=report.start_date)
        elif report.report_type == 'range' and report.start_date and report.end_date:
            qs = qs.filter(updated_at__date__gte=report.start_date, updated_at__date__lte=report.end_date)

        if not qs.exists():
            # Produce an empty, but valid report file and still mark as ready (test expectation)
            df = pd.DataFrame(columns=[
                'Order #', 'Buyer', 'Phone', 'Product', 'Qty (kg)', 'Created', 'Completed'
            ])
            os.makedirs('reports', exist_ok=True)
            filename = f"report_{report.id}.xlsx"
            filepath = os.path.join('reports', filename)
            df.to_excel(filepath, index=False, engine='openpyxl')
            report.file_path = filepath
            report.status = 'ready'
            report.error_message = ''
            report.save()
            return 'READY'

        data_rows = []
        for order in qs:
            for item in order.items.all():
                data_rows.append({
                    'Order #': order.order_number,
                    'Buyer': f"{order.buyer.first_name} {order.buyer.last_name}",
                    'Phone': order.buyer.phone_number,
                    'Product': item.product.name,
                    'Qty (kg)': float(item.quantity_kg),
                    'Created': order.created_at.strftime('%Y-%m-%d %H:%M'),
                    'Completed': order.updated_at.strftime('%Y-%m-%d %H:%M'),
                })

        df = pd.DataFrame(data_rows)
        os.makedirs('reports', exist_ok=True)
        filename = f"report_{report.id}.xlsx"
        filepath = os.path.join('reports', filename)
        df.to_excel(filepath, index=False, engine='openpyxl')
        report.file_path = filepath
        report.status = 'ready'
        report.save()
        return 'READY'
    except OrderReport.DoesNotExist:
        return 'MISSING'
    except Exception as e:
        logger.error(f"Report {report_id} generation failed: {e}")
        try:
            report = OrderReport.objects.get(id=report_id)
            report.status = 'failed'
            report.error_message = str(e)
            report.save()
        except Exception:
            pass
        return 'FAILED'
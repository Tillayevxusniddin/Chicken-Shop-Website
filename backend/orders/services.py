# orders/services.py

import requests
import logging
from django.conf import settings
from .models import Order

logger = logging.getLogger(__name__)

class TelegramService:
    def __init__(self):
        token = settings.TELEGRAM_BOT_TOKEN
        self.api_url = f"https://api.telegram.org/bot{token}/sendMessage"
        self.chat_id = settings.TELEGRAM_CHAT_ID
        # Determine test mode (set in settings during tests)
        self.testing = getattr(settings, 'TESTING', False)

    def _send_request(self, data):
        """Telegram API'ga so'rov yuborish uchun yordamchi metod"""
        if self.testing:
            # Simulate successful API response instantly in tests
            logger.info("(TESTING) Skipping real Telegram API call.")
            return {'ok': True, 'testing': True}
        try:
            response = requests.post(self.api_url, data=data, timeout=10)
            response.raise_for_status()
            logger.info(f"Telegram message sent successfully. Response: {response.json()}")
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to send Telegram message. Error: {e}")
            return None

    def _escape_markdown(self, text: str) -> str:
        """MarkdownV2 uchun maxsus belgilarni ekrannlash"""
        escape_chars = r'_*[]()~`>#+-=|{}.!'
        return ''.join(f'\\{char}' if char in escape_chars else char for char in str(text))

    def format_order_message(self, order: Order) -> str:
        """Buyurtma ma'lumotlaridan chiroyli xabar matnini yaratish (MarkdownV2 formatida)"""
        # Har bir qismni ekrannlaymiz
        order_number = self._escape_markdown(order.order_number)
        first_name = self._escape_markdown(order.buyer.first_name)
        last_name = self._escape_markdown(order.buyer.last_name)
        phone_number = self._escape_markdown(order.buyer.phone_number)
        address = self._escape_markdown(order.buyer.address)
        total_weight = self._escape_markdown(order.total_weight)
        
        message_lines = [
            f"🛒 *Yangi Buyurtma \\#{order_number}*",
            "",
            f"👤 *Xaridor:* {first_name} {last_name}",
            f"📱 *Telefon:* `{phone_number}`",
            f"📍 *Manzil:* {address}",
            "",
            "📦 *Mahsulotlar:*",
        ]
        
        for item in order.items.all():
            product_name = self._escape_markdown(item.product.name)
            quantity = self._escape_markdown(item.quantity_kg)
            message_lines.append(f"• {product_name}: {quantity}kg")
        
        message_lines.append(f"\n📊 *Jami og'irlik:* {total_weight}kg")
        
        if order.notes:
            notes = self._escape_markdown(order.notes)
            message_lines.append(f"\n📝 *Izoh:* {notes}")
        
        return "\n".join(message_lines)

    def send_order_notification(self, order: Order):
        """Yangi buyurtma haqida sotuvchiga xabar yuborish"""
        if not all([self.api_url, self.chat_id]):
            logger.warning("Telegram settings are not fully configured. Skipping notification.")
            return None
        
        message_body = self.format_order_message(order)
        data = {
            "chat_id": self.chat_id,
            "text": message_body,
            "parse_mode": "MarkdownV2", # Matnni formatlash uchun
        }
        return self._send_request(data)
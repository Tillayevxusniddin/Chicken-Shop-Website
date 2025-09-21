# orders/consumers.py (yangi fayl)

import json
from channels.generic.websocket import AsyncWebsocketConsumer

class OrderConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]

        if not self.user.is_authenticated:
            await self.close()
            return

        # Foydalanuvchi uchun shaxsiy guruh
        self.private_group = f'user_{self.user.id}'

        # Sotuvchi bo'lsa umumiy seller guruhiga ham qo'shamiz
        self.groups_to_join = [self.private_group]
        if getattr(self.user, 'role', None) == 'seller':
            self.groups_to_join.append('sellers')

        for g in self.groups_to_join:
            await self.channel_layer.group_add(g, self.channel_name)

        await self.accept()

    async def disconnect(self, close_code):
        for g in getattr(self, 'groups_to_join', []):
            await self.channel_layer.group_discard(g, self.channel_name)

    # Bu metod tashqaridan (masalan, view'dan) chaqiriladi
    async def order_status_update(self, event):
        await self.send(text_data=json.dumps({
            'type': 'order_update',
            'order': event['order']
        }))

    async def new_order_created(self, event):
        # Yangi buyurtma faqat sotuvchilarga yuboriladi (seller guruhi orqali)
        await self.send(text_data=json.dumps({
            'type': 'new_order',
            'order': event['order']
        }))
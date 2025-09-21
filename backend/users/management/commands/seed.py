from django.core.management.base import BaseCommand
from django.db import transaction
from users.models import CustomUser
from products.models import Product


class Command(BaseCommand):
    help = "Bitta sotuvchi, bitta xaridor va bir nechta mahsulotlarni yaratadi (admin kerak emas). Idempotent."

    @transaction.atomic
    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.SUCCESS("Seed boshlanmoqda..."))

        # Seller
        seller = CustomUser.objects.filter(username='seller').first()
        if not seller:
            seller = CustomUser.objects.create_user(
                username='seller',
                email='seller@example.com',
                password='sellerpass123',
                first_name='Ali',
                last_name='Valiyev',
                phone_number='+998901112233',
                address='Toshkent, Chilonzor',
                role='seller'
            )
            self.stdout.write("Sotuvchi yaratildi (seller / sellerpass123)")
        else:
            self.stdout.write("Sotuvchi allaqachon mavjud")

        # Buyer
        buyer = CustomUser.objects.filter(username='buyer').first()
        if not buyer:
            buyer = CustomUser.objects.create_user(
                username='buyer',
                email='buyer@example.com',
                password='buyerpass123',
                first_name='Vali',
                last_name='Aliyev',
                phone_number='+998904445566',
                address='Toshkent, Yunusobod',
                role='buyer'
            )
            self.stdout.write("Xaridor yaratildi (buyer / buyerpass123)")
        else:
            self.stdout.write("Xaridor allaqachon mavjud")

        products_seed = [
            {
                'name': "Tovuq son (Leg)",
                'product_type': 'leg',
                'description': "Mazali va yangi tovuq son qismlari.",
            },
            {
                'name': "Qanotchalar (Wing)",
                'product_type': 'wing',
                'description': "Gril uchun ajoyib, marinadga juda mos.",
            },
            {
                'name': "Filesi (Breast)",
                'product_type': 'breast',
                'description': "Parhezbop oqsillarga boy tovuq filesi.",
            },
            {
                'name': "Aralash qismlar",
                'product_type': 'leg',
                'description': "Turli retseptlar uchun aralash leg qismlar.",
            },
        ]

        created_count = 0
        for data in products_seed:
            obj, created = Product.objects.get_or_create(
                name=data['name'],
                defaults={
                    'product_type': data['product_type'],
                    'description': data['description'],
                    'is_available': True,
                    'stock_kg': 100.00,
                }
            )
            # Ensure existing product gets stock if missing
            if not created and (obj.stock_kg is None or obj.stock_kg == 0):
                obj.stock_kg = 100.00
                obj.save(update_fields=['stock_kg'])
            if created:
                created_count += 1

        self.stdout.write(f"Mahsulotlar: {created_count} ta yangi qo'shildi, jami: {Product.objects.count()}")
        self.stdout.write(self.style.SUCCESS("Seed yakunlandi."))

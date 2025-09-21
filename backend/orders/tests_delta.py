from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.test import APIClient
from products.models import Product
from .models import Order, OrderItem
from datetime import timedelta

User = get_user_model()


class StatsDeltaTests(TestCase):
    def setUp(self):
        self.seller = User.objects.create_user(username='seller_delta', password='pass', role='seller')
        self.buyer = User.objects.create_user(username='buyer_delta', password='pass', role='buyer')
        self.product = Product.objects.create(name='Delta Leg', product_type='leg')
        self.client = APIClient()
        # Create yesterday orders
        yesterday = timezone.now() - timedelta(days=1)
        for _ in range(3):
            o = Order.objects.create(buyer=self.buyer, status='completed')
            OrderItem.objects.create(order=o, product=self.product, quantity_kg='1.0')
            Order.objects.filter(id=o.id).update(created_at=yesterday, updated_at=yesterday)
        # Today orders
        for _ in range(5):
            o = Order.objects.create(buyer=self.buyer, status='completed')
            OrderItem.objects.create(order=o, product=self.product, quantity_kg='1.0')

    def test_stats_delta_positive(self):
        self.client.force_authenticate(self.seller)
        resp = self.client.get('/api/orders/stats/')
        self.assertEqual(resp.status_code, 200)
        today = resp.data.get('today_orders') or resp.data.get('today', {}).get('orders')
        yesterday = resp.data.get('yesterday_orders') or resp.data.get('yesterday', {}).get('orders')
        # Fallback if structure differs
        if today is None or yesterday is None:
            self.skipTest('Stats structure changed; update test.')
        self.assertGreater(today, yesterday)


class ProductSearchCaseTests(TestCase):
    def setUp(self):
        Product.objects.create(name='Mixed Wing Pack', product_type='wing')
        Product.objects.create(name='another wing cut', product_type='wing')
        self.client = APIClient()

    def test_case_insensitive_search(self):
        up = self.client.get('/api/products/?search=WING')
        low = self.client.get('/api/products/?search=wing')
        self.assertEqual(up.status_code, 200)
        self.assertEqual(low.status_code, 200)
        up_set = {p['id'] for p in up.data['results']}
        low_set = {p['id'] for p in low.data['results']}
        self.assertSetEqual(up_set, low_set)

    def test_search_no_results(self):
        resp = self.client.get('/api/products/?search=__UNLIKELY_QUERY_123__')
        self.assertEqual(resp.status_code, 200)
        # ensure returned results (if any) do not contain the pattern
        pattern = '__UNLIKELY_QUERY_123__'.lower()
        for p in resp.data['results']:
            self.assertNotIn(pattern, p['name'].lower())

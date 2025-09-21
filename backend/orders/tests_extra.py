from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from products.models import Product
from orders.models import OrderReport
from django.utils import timezone

User = get_user_model()

class ReportDownloadErrorTests(TestCase):
    def setUp(self):
        self.seller = User.objects.create_user(username='seller', password='pass', role='seller')
        self.client = APIClient()
        self.client.force_authenticate(self.seller)

    def test_report_download_not_ready(self):
        r = OrderReport.objects.create(created_by=self.seller, report_type='daily', start_date=timezone.now().date(), file_path='', status='pending')
        resp = self.client.get(f'/api/orders/{r.id}/download_report/')
        self.assertEqual(resp.status_code, 400)

class EmptyStatsTests(TestCase):
    def setUp(self):
        self.seller = User.objects.create_user(username='seller', password='pass', role='seller')
        self.client = APIClient(); self.client.force_authenticate(self.seller)

    def test_stats_empty(self):
        resp = self.client.get('/api/orders/stats/')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data['total_orders'], 0)
        self.assertIsInstance(resp.data['last7days'], list)

from django.test import TestCase, override_settings
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from unittest.mock import patch, MagicMock
from django.utils import timezone
from .models import Order, OrderItem, OrderReport
from products.models import Product
from .tasks import send_order_telegram_notification, generate_order_report
from io import BytesIO
from django.core.files.uploadedfile import SimpleUploadedFile
from PIL import Image

User = get_user_model()

class OrderRoleTests(TestCase):
	def setUp(self):
		self.seller = User.objects.create_user(username='seller1', password='sellerpass', role='seller')
		self.buyer1 = User.objects.create_user(username='buyer1', password='buyerpass', role='buyer')
		self.buyer2 = User.objects.create_user(username='buyer2', password='buyerpass', role='buyer')
		self.product = Product.objects.create(name='Leg A', product_type='leg', description='d')
		self.client = APIClient()

	def auth(self, user):
		self.client.force_authenticate(user=user)

	def test_seller_sees_all_orders(self):
		# create orders for both buyers
		self.auth(self.buyer1)
		self.client.post('/api/orders/', {"items":[{"product": self.product.id, "quantity_kg": "2.0"}] , "notes":"b1"}, format='json')
		self.auth(self.buyer2)
		self.client.post('/api/orders/', {"items":[{"product": self.product.id, "quantity_kg": "1.0"}] , "notes":"b2"}, format='json')
		self.auth(self.seller)
		resp = self.client.get('/api/orders/')
		self.assertEqual(resp.status_code, 200)
		self.assertEqual(resp.data['count'], 2, 'Seller should see all orders')

	def test_buyer_only_sees_own_orders(self):
		self.auth(self.buyer1)
		self.client.post('/api/orders/', {"items":[{"product": self.product.id, "quantity_kg": "2.0"}] , "notes":"b1"}, format='json')
		self.auth(self.buyer2)
		self.client.post('/api/orders/', {"items":[{"product": self.product.id, "quantity_kg": "1.0"}] , "notes":"b2"}, format='json')
		# buyer1 should only see their own 1 order
		self.auth(self.buyer1)
		resp = self.client.get('/api/orders/')
		self.assertEqual(resp.status_code, 200)
		self.assertEqual(resp.data['count'], 1)
		self.assertEqual(resp.data['results'][0]['buyer']['username'], 'buyer1')

	def test_buyer_forbidden_stats_and_status_update(self):
		# create one order as buyer1
		self.auth(self.buyer1)
		create_resp = self.client.post('/api/orders/', {"items":[{"product": self.product.id, "quantity_kg": "2.0"}] , "notes":"b1"}, format='json')
		order_id = create_resp.data['id']
		# buyer tries stats
		stats_resp = self.client.get('/api/orders/stats/')
		self.assertEqual(stats_resp.status_code, 403)
		# buyer tries status update
		patch_resp = self.client.patch(f'/api/orders/{order_id}/update_status/', {"status":"reviewing"}, format='json')
		self.assertEqual(patch_resp.status_code, 403)

	def test_seller_cannot_create_order(self):
		self.auth(self.seller)
		resp = self.client.post('/api/orders/', {"items":[{"product": self.product.id, "quantity_kg": "2.0"}] , "notes":"seller attempt"}, format='json')
		self.assertEqual(resp.status_code, 403)
		self.assertEqual(Order.objects.count(), 0)

	def test_buyer_can_create_order(self):
		self.auth(self.buyer1)
		resp = self.client.post('/api/orders/', {"items":[{"product": self.product.id, "quantity_kg": "3.0"}] , "notes":"ok"}, format='json')
		self.assertEqual(resp.status_code, 201)
		self.assertEqual(Order.objects.count(), 1)
class OrderStatusTransitionTests(TestCase):
	def setUp(self):
		self.seller = User.objects.create_user(username='seller', password='pass', role='seller')
		self.buyer = User.objects.create_user(username='buyer', password='pass', role='buyer')
		self.product = Product.objects.create(name='Wing', product_type='wing')
		self.client = APIClient()
		self.client.force_authenticate(self.seller)
		# create order as buyer first
		buyer_client = APIClient()
		buyer_client.force_authenticate(self.buyer)
		resp = buyer_client.post('/api/orders/', {
			'items': [{'product': self.product.id, 'quantity_kg': '2.5'}],
			'notes': 'Test',
		}, format='json')
		self.assertEqual(resp.status_code, 201)
		self.order_id = resp.data['id']

	def _update(self, status):
		return self.client.patch(f'/api/orders/{self.order_id}/update_status/', {'status': status}, format='json')

	def test_valid_flow(self):
		self.assertEqual(self._update('reviewing').status_code, 200)
		self.assertEqual(self._update('process').status_code, 200)
		self.assertEqual(self._update('shipping').status_code, 200)
		self.assertEqual(self._update('completed').status_code, 200)

	def test_invalid_transition(self):
		# directly shipping from pending should fail
		resp = self._update('shipping')
		self.assertEqual(resp.status_code, 400)

	def test_cannot_skip_to_completed(self):
		resp = self._update('completed')
		self.assertEqual(resp.status_code, 400)
		# ensure status unchanged (still pending)
		from .models import Order
		order = Order.objects.get(id=self.order_id)
		self.assertEqual(order.status, 'pending')

	def test_buyer_cannot_update_foreign_order(self):
		# authenticate buyer and attempt update_status
		buyer_client = APIClient(); buyer_client.force_authenticate(self.buyer)
		resp = buyer_client.patch(f'/api/orders/{self.order_id}/update_status/', {'status': 'reviewing'}, format='json')
		self.assertIn(resp.status_code, [403, 404])


@override_settings(TELEGRAM_BOT_TOKEN='token', TELEGRAM_CHAT_ID='123')
class TelegramTaskTests(TestCase):
	def setUp(self):
		self.user = User.objects.create_user(username='buyer', password='pass', role='buyer')
		self.product = Product.objects.create(name='Leg', product_type='leg')
		self.order = Order.objects.create(buyer=self.user)
		OrderItem.objects.create(order=self.order, product=self.product, quantity_kg='1.0')

	@patch('orders.services.requests.post')
	def test_telegram_task_sends(self, mock_post):
		mock_post.return_value = MagicMock(status_code=200, json=lambda: {'ok': True})
		result = send_order_telegram_notification.run(order_id=self.order.id)
		self.assertIn(result, ['SENT', 'SKIPPED'])


class ReportTaskTests(TestCase):
	def setUp(self):
		self.seller = User.objects.create_user(username='seller', password='pass', role='seller')
		buyer = User.objects.create_user(username='buyer', password='pass', role='buyer')
		product = Product.objects.create(name='Breast', product_type='breast')
		# completed order today
		order = Order.objects.create(buyer=buyer, status='completed')
		OrderItem.objects.create(order=order, product=product, quantity_kg='3.0')
		order.updated_at = timezone.now()
		order.save()

	def test_generate_daily_report_model(self):
		r = OrderReport.objects.create(created_by=self.seller, report_type='daily', start_date=timezone.now().date(), file_path='', status='pending')
		res = generate_order_report.run(report_id=r.id)
		r.refresh_from_db()
		self.assertEqual(r.status, 'ready')
		self.assertEqual(res, 'READY')


class StatsAndPaginationTests(TestCase):
	def setUp(self):
		self.seller = User.objects.create_user(username='seller', password='pass', role='seller')
		self.buyer = User.objects.create_user(username='buyer', password='pass', role='buyer')
		self.product = Product.objects.create(name='Wing', product_type='wing')
		self.client = APIClient()
		# create multiple orders
		buyer_client = APIClient()
		buyer_client.force_authenticate(self.buyer)
		for i in range(35):
			resp = buyer_client.post('/api/orders/', {
				'items': [{'product': self.product.id, 'quantity_kg': '1.0'}],
				'notes': f'O{i}'
			}, format='json')
			self.assertEqual(resp.status_code, 201)
		# mark some completed
		self.client.force_authenticate(self.seller)
		first_order = Order.objects.first()
		if first_order:
			self.client.patch(f'/api/orders/{first_order.id}/update_status/', {'status': 'reviewing'}, format='json')
			self.client.patch(f'/api/orders/{first_order.id}/update_status/', {'status': 'process'}, format='json')
			self.client.patch(f'/api/orders/{first_order.id}/update_status/', {'status': 'shipping'}, format='json')
			self.client.patch(f'/api/orders/{first_order.id}/update_status/', {'status': 'completed'}, format='json')

	def test_pagination_structure(self):
		self.client.force_authenticate(self.seller)
		resp = self.client.get('/api/orders/?page=1&page_size=20')
		self.assertEqual(resp.status_code, 200)
		self.assertIn('results', resp.data)
		self.assertEqual(len(resp.data['results']), 20)
		self.assertGreater(resp.data['count'], 20)

	def test_stats_endpoint(self):
		self.client.force_authenticate(self.seller)
		resp = self.client.get('/api/orders/stats/')
		self.assertEqual(resp.status_code, 200)
		self.assertIn('total_orders', resp.data)
		self.assertIn('status_breakdown', resp.data)
		self.assertIn('last7days', resp.data)


class StockManagementTests(TestCase):
	def setUp(self):
		User = get_user_model()
		self.seller = User.objects.create_user(username='stockseller', password='pass', role='seller')
		self.buyer = User.objects.create_user(username='stockbuyer', password='pass', role='buyer')
		self.product = Product.objects.create(name='Stock Prod', product_type='leg', stock_kg=100)
		self.client = APIClient()

	def auth(self, user):
		self.client.force_authenticate(user=user)

	def _create_order(self, qty):
		buyer_client = APIClient()
		buyer_client.force_authenticate(self.buyer)
		resp = buyer_client.post('/api/orders/', {
			'items': [{'product': self.product.id, 'quantity_kg': f'{qty:.2f}'}]
		}, format='json')
		self.assertEqual(resp.status_code, 201)
		return resp.data['id']

	def test_stock_deducts_on_create(self):
		order_id = self._create_order(25)
		self.product.refresh_from_db()
		self.assertEqual(str(self.product.stock_kg), '75.00')
		self.assertTrue(Order.objects.filter(id=order_id).exists())

	def test_stock_restores_on_cancel(self):
		order_id = self._create_order(40)
		self.product.refresh_from_db(); self.assertEqual(str(self.product.stock_kg), '60.00')
		# move to reviewing then cancel
		self.auth(self.seller)
		r1 = self.client.patch(f'/api/orders/{order_id}/update_status/', {'status': 'reviewing'}, format='json')
		self.assertEqual(r1.status_code, 200)
		rc = self.client.patch(f'/api/orders/{order_id}/update_status/', {'status': 'cancelled'}, format='json')
		self.assertEqual(rc.status_code, 200)
		self.product.refresh_from_db(); self.assertEqual(str(self.product.stock_kg), '100.00')

	def test_no_restore_after_completed(self):
		order_id = self._create_order(10)
		self.product.refresh_from_db(); self.assertEqual(str(self.product.stock_kg), '90.00')
		self.auth(self.seller)
		for st in ['reviewing', 'process', 'shipping', 'completed']:
			r = self.client.patch(f'/api/orders/{order_id}/update_status/', {'status': st}, format='json')
			self.assertEqual(r.status_code, 200)
		# attempt invalid cancel (should fail transition, stock unchanged)
		r_cancel = self.client.patch(f'/api/orders/{order_id}/update_status/', {'status': 'cancelled'}, format='json')
		self.assertEqual(r_cancel.status_code, 400)
		self.product.refresh_from_db(); self.assertEqual(str(self.product.stock_kg), '90.00')

	def test_insufficient_stock_validation(self):
		buyer_client = APIClient(); buyer_client.force_authenticate(self.buyer)
		resp = buyer_client.post('/api/orders/', {
			'items': [{'product': self.product.id, 'quantity_kg': '1000.00'}]
		}, format='json')
		self.assertEqual(resp.status_code, 400)
		self.assertIn('stock_kg', str(resp.data))

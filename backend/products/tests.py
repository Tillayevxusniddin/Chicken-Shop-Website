from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from .models import Product
from io import BytesIO
from PIL import Image
from django.core.files.uploadedfile import SimpleUploadedFile

User = get_user_model()

class ProductImageUploadTests(TestCase):
	def setUp(self):
		self.seller = User.objects.create_user(username='seller', password='pass', role='seller')
		self.product = Product.objects.create(name='Leg', product_type='leg')
		self.client = APIClient()
		self.client.force_authenticate(self.seller)

	def test_upload_image(self):
		# Create a simple image in memory
		file = BytesIO()
		img = Image.new('RGB', (50, 50), color='red')
		img.save(file, 'PNG')
		file.seek(0)
		uploaded = SimpleUploadedFile('test.png', file.read(), content_type='image/png')
		resp = self.client.post(f'/api/products/{self.product.id}/upload_image/', {'image': uploaded}, format='multipart')
		self.assertEqual(resp.status_code, 200)
		self.product.refresh_from_db()
		self.assertTrue(bool(self.product.image))


class ProductCRUDPermissionTests(TestCase):
	def setUp(self):
		User = get_user_model()
		self.seller = User.objects.create_user(username='sellercrud', password='pass', role='seller')
		self.buyer = User.objects.create_user(username='buyercrud', password='pass', role='buyer')
		self.client = APIClient()
		self.product = Product.objects.create(name='Wing A', product_type='wing', stock_kg=10)

	def auth(self, user):
		self.client.force_authenticate(user=user)

	def test_seller_can_create_product(self):
		self.auth(self.seller)
		resp = self.client.post('/api/products/', {
			'name': 'New Prod',
			'product_type': 'leg',
			'description': 'desc',
			'is_available': True,
			'stock_kg': '25.00'
		}, format='json')
		self.assertEqual(resp.status_code, 201)
		self.assertTrue(Product.objects.filter(name='New Prod').exists())

	def test_buyer_cannot_create_product(self):
		self.auth(self.buyer)
		resp = self.client.post('/api/products/', {
			'name': 'Blocked', 'product_type': 'leg', 'stock_kg': '5.00'
		}, format='json')
		self.assertIn(resp.status_code, [403, 401])
		self.assertFalse(Product.objects.filter(name='Blocked').exists())

	def test_seller_can_update_product(self):
		self.auth(self.seller)
		resp = self.client.patch(f'/api/products/{self.product.id}/', {'name': 'Wing B', 'stock_kg': '15.00'}, format='json')
		self.assertEqual(resp.status_code, 200)
		self.product.refresh_from_db()
		self.assertEqual(self.product.name, 'Wing B')
		self.assertEqual(str(self.product.stock_kg), '15.00')

	def test_buyer_cannot_update_product(self):
		self.auth(self.buyer)
		resp = self.client.patch(f'/api/products/{self.product.id}/', {'name': 'Hack'}, format='json')
		self.assertIn(resp.status_code, [403, 401])
		self.product.refresh_from_db()
		self.assertNotEqual(self.product.name, 'Hack')

	def test_seller_can_toggle_availability(self):
		self.auth(self.seller)
		self.assertTrue(self.product.is_available)
		resp = self.client.patch(f'/api/products/{self.product.id}/', {'is_available': False}, format='json')
		self.assertEqual(resp.status_code, 200)
		self.product.refresh_from_db(); self.assertFalse(self.product.is_available)

	def test_seller_can_delete_product(self):
		self.auth(self.seller)
		resp = self.client.delete(f'/api/products/{self.product.id}/')
		self.assertIn(resp.status_code, [204, 200])
		self.assertFalse(Product.objects.filter(id=self.product.id).exists())

	def test_buyer_cannot_delete_product(self):
		self.auth(self.buyer)
		resp = self.client.delete(f'/api/products/{self.product.id}/')
		self.assertIn(resp.status_code, [403, 401])
		self.assertTrue(Product.objects.filter(id=self.product.id).exists())

from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

User = get_user_model()


class AuthLoginTests(TestCase):
	def setUp(self):
		self.password = 'pass12345'
		self.user = User.objects.create_user(username='buyer1', password=self.password, role='buyer')
		self.client = APIClient()

	def test_login_success(self):
		resp = self.client.post('/api/auth/login/', {'username': self.user.username, 'password': self.password}, format='json')
		self.assertEqual(resp.status_code, 200)
		# SimpleJWT default response contains refresh & access
		self.assertIn('access', resp.data)
		self.assertIn('refresh', resp.data)

	def test_login_failure(self):
		resp = self.client.post('/api/auth/login/', {'username': self.user.username, 'password': 'wrong'}, format='json')
		self.assertIn(resp.status_code, [400, 401])


class SellerPermissionTests(TestCase):
	def setUp(self):
		self.seller = User.objects.create_user(username='sellerx', password='pass', role='seller')
		self.buyer = User.objects.create_user(username='buyerx', password='pass', role='buyer')
		self.client = APIClient()

	def test_buyer_cannot_access_seller_stats(self):
		self.client.force_authenticate(self.buyer)
		resp = self.client.get('/api/orders/stats/')
		# Expect forbidden or redirect style denial
		self.assertIn(resp.status_code, [403, 404])


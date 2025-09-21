from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from .models import Product

User = get_user_model()

class ProductListAndSearchTests(TestCase):
    def setUp(self):
        Product.objects.create(name='Leg Prime', product_type='leg')
        Product.objects.create(name='Wing Pack', product_type='wing')
        Product.objects.create(name='Breast Fillet', product_type='breast')
        self.client = APIClient()  # no auth (AllowAny for list)

    def test_list_anon(self):
        resp = self.client.get('/api/products/?page=1&page_size=2')
        self.assertEqual(resp.status_code, 200)
        self.assertIn('results', resp.data)
        self.assertLessEqual(len(resp.data['results']), 2)
        self.assertIn('count', resp.data)

    def test_search(self):
        resp = self.client.get('/api/products/?search=Wing')
        self.assertEqual(resp.status_code, 200)
        names = [p['name'] for p in resp.data['results']]
        self.assertTrue(any('Wing' in n for n in names))

    def test_out_of_range_page(self):
        resp = self.client.get('/api/products/?page=999')
        # DRF returns empty list with valid page param beyond range OR 404 depending on paginator; ensure not 500
        self.assertIn(resp.status_code, [200, 404])
        if resp.status_code == 200:
            self.assertEqual(resp.data['results'], [])

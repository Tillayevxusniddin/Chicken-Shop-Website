# Chicken Store Backend

## Features

- JWT auth (CustomUser roles: seller, buyer)
- Products with single image upload (ImageField)
- Orders with status workflow & history
- Real-time order updates via Django Channels (buyer-specific + sellers group)
- Telegram notifications (Celery async with retry)
- Excel report generation (on-demand + scheduled) with OrderReport tracking
- Pagination (DRF PageNumberPagination) for orders & products
- Seller statistics endpoint `/orders/stats/`

## Key Endpoints

- POST /auth/login/ (JWT obtain) (assuming configured)
- GET /products/ (paginated list)
- POST /products/ (seller)
- POST /products/{id}/upload_image/ (seller image upload)
- GET /orders/ (seller sees all, buyer sees own, paginated, filters: status, search, start_date, end_date)
- POST /orders/ (buyer create)
- PATCH /orders/{id}/update_status/ (seller transition)
- POST /orders/create_report/ (seller) body: report_type=daily|range, dates
- GET /orders/reports/ (seller)
- GET /orders/{id}/download_report/ (seller)
- GET /orders/stats/ (seller dashboard metrics)

## WebSocket Protocol

Path: `/ws/orders/` (example) joining:

- `user_{buyer_id}` private group
- `sellers` group for seller notifications
  Messages:
- `order_status_update`: { order: {...} }
- `new_order_created`: { order: {...} }

## Celery Tasks

- `send_order_telegram_notification(order_id)`
- `generate_order_report(report_id)` -> updates OrderReport file
- (Scheduled) daily report generation (example in celery beat if configured)

## Pagination

Default page size: 20. Query params: `page`, `page_size` (<=100).
Response shape:

```
{
  "count": 123,
  "next": "?page=3",
  "previous": null,
  "results": [ ... ]
}
```

## Statistics Response

`GET /orders/stats/`

```
{
  "total_orders": 40,
  "total_completed": 10,
  "total_weight_completed": 150.5,
  "status_breakdown": {"pending":20, "completed":10, ...},
  "product_type_breakdown": {"leg": {"orders": 15, "quantity_kg": 42.0}, ...},
  "last7days": [{"date":"2025-09-14","count":4,"completed_weight":12.5}, ...]
}
```

## Environment Variables (sample .env)

```
SECRET_KEY=dev-secret
DEBUG=True
DATABASE_URL=postgres://user:pass@localhost:5432/chicken
TELEGRAM_BOT_TOKEN=xxxx
TELEGRAM_CHAT_ID=123456
REDIS_URL=redis://localhost:6379/1
```

## Development

1. Install requirements: `pip install -r requirements.txt`
2. Apply migrations: `python manage.py migrate`
3. Run Redis & Celery worker:
   - Redis server
   - `celery -A chicken_store worker -l info`
4. Run server: `python manage.py runserver`
5. (Optional) Celery beat for scheduled tasks: `celery -A chicken_store beat -l info`

## Media

Uploaded product images stored under `media/products/`. Ensure `MEDIA_URL` is served in development via `django.conf.urls.static` (add to root urls if not yet).

## Notes

- Order transitions validated server-side.
- Telegram errors are logged but don't block order creation.
- Report generation uses pandas/openpyxl (ensure installed).

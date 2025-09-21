# Tovuq Do'koni Platformasi

Modern real-time poultry e‑commerce stack (Django + DRF + Channels + Celery + Redis + React + MUI) with seller dashboard, Telegram notifications, Excel reports, and WebSocket live updates.

## Features

- JWT autentifikatsiya (buyer / seller rollari)
- Mahsulotlar ro'yxati va savat
- Buyurtma yaratish (multi item, total weight)
- Seller Dashboard
  - Live order feed (yangi buyurtmalar + status o'zgarishi)
  - Filtrlash: status, sana oralig'i, qidirish
  - Holat tranzitsiyalari (pending → reviewing → process → shipping → completed)
  - Excel hisobot generatsiyasi (kunlik / oralig') – Celery background tasks
- Telegram xabarnoma (yangi buyurtma tafsilotlari seller kanaliga)
- WebSocket real-time (buyers: status update, sellers: all new + updates)
- Dark / Light UI toggle, gradient theme & responsive design

## Tech Stack

Backend: Django 5, DRF, Channels, Redis (channel layer + Celery broker), Celery Beat, Pandas/OpenPyXL.
Frontend: React 19 + Vite + TypeScript, MUI (custom theme), Axios, Redux Toolkit, WebSocket client hook.

# Chicken Store Platform

Modern full‑stack poultry commerce & operations platform (Amazon‑inspired UX) with real‑time order flows, Telegram notifications, Excel reporting, seller analytics, and a polished React + MUI interface.

DEBUG=1
DATABASE_URL=postgres://postgres:password@localhost:5432/chicken_store
REDIS_URL=redis://localhost:6379/1
TELEGRAM_BOT_TOKEN=123456:ABC-DEF

### Buyers

- Browse products (images, availability)
- Create multi‑item orders (quantities in kg)
- Real‑time status updates via WebSockets

### Sellers / Ops

- Dashboard with filtering (status, date range, search)
- Validated status workflow: `pending → reviewing → process → shipping → completed`
- Live order feed (broadcast to `sellers` group)
- Excel report generation (daily / date range) with Celery
- Product image upload endpoint
- Statistics endpoint (totals, breakdown, last 7 days)

### System

- Django 5 + DRF + Channels (ASGI) + Celery
- Redis (broker + channel layer) – optional eager fallback
- PostgreSQL (Docker) OR SQLite local fallback
- React 19 + Vite + TypeScript + MUI 7 + Redux Toolkit
- Theming (dark/light, gradients, accessibility focus)
- Idempotent seed command (1 seller, 1 buyer, 4 products)
- Comprehensive test suite (status flow, tasks, reports, pagination, stats, image upload)

---

## 🗺 Architecture Map

| Layer         | Stack                 | Notes                |
| ------------- | --------------------- | -------------------- |
| Backend API   | Django + DRF          | REST under `/api/`   |
| Async Tasks   | Celery + Redis        | Reporting & Telegram |
| Realtime      | Channels + WebSockets | Order events         |
| Frontend      | React + Vite + TS     | SPA                  |
| Data          | Postgres / SQLite     | Configurable         |
| Reports       | pandas + openpyxl     | Excel exports        |
| Notifications | Telegram Bot API      | Optional in dev      |

```

## Running (Dev)

1. Redis ishga tushiring (lokal yoki Docker).
2. Postgres yaratish (DATABASE_URL bo'yicha).
3. Backend migratsiyalar: `python manage.py migrate`
4. Superuser: `python manage.py createsuperuser`
5. Celery worker + beat (alohida processlar yoki docker-compose)
6. Frontend: `pnpm install` yoki `npm install`, so'ng `npm run dev`.

## Celery

Workers buyruqlari (misol):

```

celery -A chicken_store worker -l info
celery -A chicken_store beat -l info

```

Kunlik hisobot CRON (23:55) avtomatik ishlaydi.

## API Highlights

- POST /orders/ (items[]) → create
- PATCH /orders/{id}/update_status/ → status flow
- POST /orders/create_report/ (report_type=daily|range, start_date, end_date?)
- GET /orders/reports/
- GET /orders/{id}/download_report/
- Seller qo'shiladi: `sellers` + private group
- Buyer faqat `user_<id>` guruhiga
```

order_update { order }
new_order { order }

````

## Tests (planned)
- Order status transitions (invalid path rejection)
- Payment integration
- Inventory tracking
---
## 🧪 Tests
```bash
cd backend
python manage.py test
````

No external Redis/Postgres needed (auto fallbacks).

---

## 🚀 Seed Data

```bash
python manage.py seed
```

Creates: seller (`seller/sellerpass123`), buyer (`buyer/buyerpass123`), 4 sample products.

---

## 🔐 Roles

`buyer` – place orders.  
`seller` – manage orders, reports, stats.

---

## 🛠 Troubleshooting

| Issue                | Solution                                              |
| -------------------- | ----------------------------------------------------- |
| `db` host unresolved | Run compose or set `ALT_LOCAL_DB=1` / change host     |
| Redis refused        | Start Redis (`docker compose up redis`) or eager mode |
| Report empty failure | Now returns ready with empty sheet                    |
| Telegram timeout     | Provide valid bot token/chat or omit (skipped)        |
| Image not visible    | Ensure `MEDIA_URL` served (dev server or Nginx)       |

---

## 🧩 Roadmap Ideas

- JWT auth endpoints (login/refresh)
- Role‑based admin UI
- Inventory & pricing engine
- Caching / rate limiting (Redis)
- Observability (metrics / tracing)
- File storage to S3

---

## 📜 License

Private / Internal (add OS license if distributing).

---

## ✅ Quick Cheatsheet

```bash
# Full stack
- i18n (Uz / Ru / En)

# Local rapid (SQLite)
FORCE_SQLITE=1 python manage.py migrate && FORCE_SQLITE=1 python manage.py seed && FORCE_SQLITE=1 python manage.py runserver

# Frontend
cd frontend && npm i && npm run dev
```

---

Need deployment docs (Nginx, HTTPS, systemd)? Extend this README.

## License

Internal project (add license if needed).

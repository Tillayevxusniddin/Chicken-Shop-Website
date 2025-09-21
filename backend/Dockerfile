# backend/Dockerfile

# 1. Asosiy image'ni tanlaymiz
FROM python:3.11-slim

# 2. Ishchi papkani o'rnatamiz
WORKDIR /app

# 3. Environment o'zgaruvchilari
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# 4. Kerakli kutubxonalarni o'rnatamiz
COPY requirements.txt .
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# 5. Loyiha fayllarini nusxalaymiz
COPY . .
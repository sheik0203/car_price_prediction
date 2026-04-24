# Production Deployment Guide: Car Price Prediction System

This guide outlines the steps to deploy the backend to **Render**, the database to **PostgreSQL/Supabase**, and the frontend.

## 1. Database Setup (PostgreSQL)
- Create a PostgreSQL database on **Supabase** or **Render Databases**.
- Copy the **Connection URI**.

## 2. Environment Variables (.env)
Create a `.env` file in the root directory (never commit this to Git). On production platforms like Render, add these in the **Environment** settings:

```env
DEBUG=False
SECRET_KEY=your-very-strong-secret-key
ALLOWED_HOSTS=your-app-name.onrender.com
DB_NAME=car_price_db
DB_USER=postgres
DB_PASSWORD=your-password
DB_HOST=your-db-host
DB_PORT=5432
```

## 3. Render Deployment (Backend)
1. Link your GitHub repository to **Render**.
2. Select **Web Service**.
3. Use the following settings:
   - **Environment**: `Python`
   - **Build Command**: `pip install -r requirements.txt && python manage.py migrate && python manage.py collectstatic --no-input`
   - **Start Command**: `gunicorn car_price_project.wsgi:application`
4. Run the training script once to generate the model:
   - Go to **Shell** in Render dashboard
   - Run: `python ml/train_model.py`

## 4. Security Checklist
- [ ] Set `DEBUG=False`.
- [ ] Use `SimpleJWT` for all prediction routes.
- [ ] Configure `CORS_ALLOWED_ORIGINS` to only allow your frontend domain.
- [ ] Ensure `SECRET_KEY` is not the default.
- [ ] Use `whitenoise` for static files (already configured in settings).

## 5. Directory Structure Recap
```text
project/
├── car_price_project/  # Central Settings
├── users/             # Auth & Identity
├── prediction/        # ML Logic & API
├── dataset/           # Admin Uploads
├── ml/                # Persistent Model & Encoders
├── static/            # Static assets
└── manage.py
```

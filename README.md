# ValuAI Edge: Enterprise Car Price Prediction SaaS

ValuAI Edge is a high-fidelity SaaS platform designed for automotive enterprises and individual sellers to compute precise market valuations using a hybrid AI inference engine. Built with a mobile-first philosophy, it features professional-grade analytics, secure authentication, and a fluid dark-mode interface.

![Version](https://img.shields.io/badge/version-1.0.0-indigo)
![Stack](https://img.shields.io/badge/stack-React%20%2B%20Django-blue)

## 🚀 Key Features

- **Hybrid AI Compute**: Combines ML regression models with rule-based depreciation heuristics for high-accuracy valuations.
- **Market Intel Dashboard**: Real-time analytics showing market price trends and powerplant (fuel) distribution.
- **Enterprise Security**: Dual-protocol authentication supporting Google OAuth 2.0 and local secure password strategies.
- **Adaptive UI/UX**: Ultra-responsive dashboard designed for laptops, tablets, and mobile devices (iPhone XR optimized).
- **Valuation Archives**: Persistent history of all AI computations for future reference and market comparison.
- **Dynamic Appearance**: System-syncing Dark/Light mode support with fluid CSS transitions.

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18+ (Vite)
- **Styling**: Tailwind CSS v4 (Modern Design Tokens)
- **Icons**: Lucide React
- **Charts**: Recharts (Responsive SVG Visualization)

### Backend
- **Framework**: Django 6.0 (REST Framework)
- **Security**: SimpleJWT (JSON Web Tokens)
- **Image AI**: OpenCV / Damage Detector logic
- **Database**: PostgreSQL (Production) / SQLite (Dev)

## 📦 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/sheik0203/car_price_prediction.git
cd car_price_prediction
```

### 2. Backend Config (Django)
```bash
cd car_price_pro
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 0.0.0.0:9000
```

### 3. Frontend Config (React)
```bash
cd car_price_pro/frontend
npm install
npm run dev
```

## 🔐 Environment Variables

Create a `.env` file in the `frontend` directory:
```env
VITE_API_URL=http://localhost:9000
```

## 📜 License
Internal Enterprise Use Only. Built by **Sheik Abdullah**.

---
*Generated for the Car Price Prediction Platform.*

# Seva Setu 🏘️

A full-stack hyperlocal services marketplace for Ghaziabad, UP — connecting residents with trusted local service providers. Seva Setu makes finding trusted service providers easy.

---

## 📁 Project Structure

```
seva-setu/
├── backend/
│   ├── config/
│   │   └── db.js               # MongoDB connection
│   ├── controllers/
│   │   ├── providerController.js
│   │   ├── bookingController.js
│   │   └── userController.js
│   ├── models/
│   │   ├── Provider.js
│   │   ├── Booking.js
│   │   └── User.js
│   ├── routes/
│   │   ├── providers.js
│   │   ├── bookings.js
│   │   └── users.js
│   ├── seed.js                 # Sample data seeder
│   ├── server.js               # Express entry point
│   └── package.json
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.js
    │   │   ├── ProviderCard.js
    │   │   ├── BookingModal.js
    │   │   └── Toast.js
    │   ├── pages/
    │   │   ├── Home.js
    │   │   ├── Providers.js
    │   │   ├── ProviderDetail.js
    │   │   ├── RegisterProvider.js
    │   │   └── MyBookings.js
    │   ├── utils/
    │   │   ├── api.js           # Axios API client
    │   │   └── constants.js     # Categories, areas, etc.
    │   ├── App.js
    │   ├── index.js
    │   └── index.css
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env — set your MONGODB_URI
npm run dev
```

Seed sample data:
```bash
node seed.js
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm start
```

The React app runs on **http://localhost:3000** and proxies API calls to **http://localhost:5000**.

---

## 🔌 API Reference

### Providers

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/providers` | List providers (supports `?search=`, `?service=`, `?area=`, `?page=`, `?limit=`) |
| GET | `/api/providers/meta/options` | Get filter options (categories, areas) |
| GET | `/api/providers/:id` | Get single provider |
| POST | `/api/providers` | Register new provider |
| PATCH | `/api/providers/:id/availability` | Toggle availability |

### Bookings

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/bookings` | Create booking → returns WhatsApp URL |
| GET | `/api/bookings` | List bookings (filter by `?phone=`, `?providerId=`, `?status=`) |
| GET | `/api/bookings/:id` | Get single booking |
| PATCH | `/api/bookings/:id/status` | Update status (accepted/rejected/completed/cancelled) |
| GET | `/api/bookings/:id/whatsapp` | Get WhatsApp link for booking |

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users` | Create or update user |
| GET | `/api/users/:phone` | Get user by phone |

---

## ✨ Features

- **Provider Registration** — 3-step form with service category, areas, and pricing
- **Search & Filter** — By service category, area, and keyword
- **Provider Profiles** — Detailed cards with ratings, areas, pricing
- **Booking System** — Date/time scheduling with service description
- **WhatsApp Integration** — Auto-generated WhatsApp message URL with full booking details
- **Booking Management** — Accept, reject, complete bookings via phone number lookup
- **Status Tracking** — Real-time status: pending → accepted → completed
- **Mobile Responsive** — Works on all screen sizes

---

## 📦 Environment Variables

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/seva-setu
NODE_ENV=development
```

For production, set `REACT_APP_API_URL` in the frontend to your backend URL.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, React Router v6, Axios
- **Backend**: Node.js, Express 4, Mongoose 8
- **Database**: MongoDB
- **Design**: Custom CSS design system (no UI framework)
- **Fonts**: Sora + Manrope (Google Fonts)

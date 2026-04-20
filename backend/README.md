# Seva Setu Backend

A Node.js backend for the Seva Setu service marketplace platform.

## Features

- **Authentication**: JWT-based authentication with email/password and Google OAuth
- **User Roles**: USER, PROVIDER, ADMIN
- **Provider Management**: Registration, approval/rejection by admin
- **Booking System**: Users can request services, providers can accept/reject
- **Admin Panel**: Dashboard with stats, provider management
- **WhatsApp Notifications**: Mock service for notifications

## Tech Stack

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- Passport.js for OAuth
- bcryptjs for password hashing

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create `.env` file based on `.env.example`
4. Start MongoDB
5. Seed the database:
   ```bash
   npm run seed
   ```
6. Start the server:
   ```bash
   npm start
   # or for development
   npm run dev
   ```

## Environment Variables

Create a `.env` file with:

```
MONGO_URI=mongodb://localhost:27017/seva-setu
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FRONTEND_URL=http://localhost:3000
PORT=5000
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `GET /api/auth/google` - Google OAuth
- `GET /api/auth/google/callback` - Google OAuth callback

### Services
- `GET /api/services` - Get all verified providers

### User
- `POST /api/booking/request` - Create booking request
- `GET /api/user/bookings` - Get user bookings

### Provider
- `POST /api/provider/register` - Register as provider
- `GET /api/provider/bookings` - Get provider bookings
- `PUT /api/provider/booking/:id/accept` - Accept booking
- `PUT /api/provider/booking/:id/reject` - Reject booking

### Admin
- `GET /api/admin/dashboard` - Get dashboard stats
- `GET /api/admin/stats` - Get admin stats
- `GET /api/admin/providers/pending` - Get pending providers
- `PUT /api/admin/provider/:id/approve` - Approve provider
- `PUT /api/admin/provider/:id/reject` - Reject provider
- `DELETE /api/admin/provider/:id` - Terminate provider

## Project Structure

```
backend/
├── config/
│   ├── db.js
│   └── passport.js
├── controllers/
│   ├── adminController.js
│   ├── authController.js
│   ├── providerController.js
│   └── userController.js
├── middleware/
│   └── auth.js
├── models/
│   ├── Booking.js
│   └── User.js
├── routes/
│   ├── admin.js
│   ├── auth.js
│   ├── providers.js
│   └── users.js
├── services/
│   └── whatsapp.js
├── .env.example
├── package.json
├── seed.js
└── server.js
```

## Usage

1. Start the server
2. Use Postman or similar to test API endpoints
3. Admin credentials: phone: 9999999999, password: admin123
4. Sample providers and users are created via seed script

## License

MIT
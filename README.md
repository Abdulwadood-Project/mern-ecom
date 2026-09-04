# ShopHub — MERN E-Commerce Platform

Full-stack online store built with the MERN stack. Customers can browse products, manage a cart, place orders, and track order history. Admins manage products, categories, users, and order statuses from a protected dashboard.

## Features

- JWT authentication (httpOnly cookie + Bearer token fallback)
- Role-based access: `user` and `admin`
- Product catalog with search, category filters, and featured items
- Persistent shopping cart
- Checkout with shipping address and order creation
- Customer order history and cancellation
- Admin dashboard with stats, CRUD for products/categories, user management, and order status updates
- Responsive UI with loading, empty, and error states
- Input validation, centralized error handling, and CORS configuration

## Technologies

| Layer | Stack |
|--------|--------|
| Frontend | React 19, Vite, React Router, Axios, React Icons |
| Backend | Node.js, Express 5, Mongoose, express-validator |
| Auth | bcryptjs, jsonwebtoken, cookie-parser |
| Database | MongoDB (local or Atlas) |

## Project structure

```
MERN_ECOM/
├── client/                 # React + Vite frontend
│   ├── src/
│   │   ├── components/     # Reusable UI
│   │   ├── pages/          # Public, user, and admin pages
│   │   ├── services/       # Axios API layer
│   │   ├── context/        # Auth + cart context
│   │   ├── hooks/
│   │   ├── styles/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env
│   ├── package.json
│   └── vite.config.js
├── server/                 # Express API
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/              # seed, token helpers, AppError
│   ├── server.js
│   ├── .env
│   ├── .env.example
│   └── package.json
├── .gitignore
├── package.json            # Root scripts (concurrently)
└── README.md
```

## Installation

### Prerequisites

- Node.js 18+
- MongoDB (local install **or** MongoDB Atlas account)

### 1. Clone / open the project

```bash
cd MERN_ECOM
```

### 2. Install dependencies

From the project root:

```bash
npm run install:all
```

Or install separately:

```bash
npm install
npm install --prefix server
npm install --prefix client
```

## MongoDB setup

### Option A — Local MongoDB

1. Install and start MongoDB locally.
2. Use this URI in `server/.env`:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/shophub
```

### Option B — MongoDB Atlas

1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a database user and allow network access (e.g. your IP or `0.0.0.0/0` for development).
3. Copy the connection string and set it in `server/.env`:

```env
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/shophub?retryWrites=true&w=majority
```

## Environment variables

### Backend — `server/.env`

Copy from the example if needed:

```bash
cp server/.env.example server/.env
```

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | API port | `5000` |
| `NODE_ENV` | Environment | `development` |
| `MONGODB_URI` | MongoDB connection string | see above |
| `JWT_SECRET` | Secret for signing JWTs | long random string |
| `JWT_EXPIRE` | Token lifetime | `7d` |
| `CLIENT_URL` | Frontend origin (CORS + cookies) | `http://localhost:5173` |
| `COOKIE_SECURE` | Set `true` only on HTTPS | `false` |

### Frontend — `client/.env`

```env
VITE_API_URL=http://localhost:5000/api
```

Do not commit `.env` files. They are listed in `.gitignore`.

## Seed demo data

With MongoDB running and `server/.env` configured:

```bash
npm run seed
```

This creates:

| Account | Email | Password | Role |
|---------|-------|----------|------|
| Admin | `admin@shophub.com` | `admin123` | admin |
| Customer | `user@shophub.com` | `user123` | user |

Plus sample categories and products.

## How to run

### Run both (recommended)

From the project root:

```bash
npm run dev
```

- API: http://localhost:5000  
- Client: http://localhost:5173  
- Health check: http://localhost:5000/api/health  

### Run separately

```bash
npm run dev:server
npm run dev:client
```

Or:

```bash
cd server && npm run dev
cd client && npm run dev
```

## Authentication

1. Register or log in via `/register` or `/login`.
2. On success the API returns a JWT and sets an httpOnly `token` cookie.
3. The client also stores the token in `localStorage` and sends it as `Authorization: Bearer <token>`.
4. Protected routes require a valid token; admin routes additionally require `role: "admin"`.
5. Passwords are hashed with bcrypt and are never returned in API responses.

## Admin access

1. Seed the database (`npm run seed`) or promote a user to `admin` in MongoDB.
2. Log in with `admin@shophub.com` / `admin123`.
3. Open `/admin` for the dashboard (products, categories, orders, users).

Normal users are redirected away from admin pages and receive `403` from admin APIs.

## API endpoints

Base URL: `http://localhost:5000/api`

### Health

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | No | Server health |

### Auth

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/register` | No | Register |
| POST | `/auth/login` | No | Login |
| POST | `/auth/logout` | No | Clear auth cookie |
| GET | `/auth/me` | Yes | Current user |
| PUT | `/auth/profile` | Yes | Update profile |
| PUT | `/auth/password` | Yes | Change password |

### Products

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/products` | Optional | List / search / filter |
| GET | `/products/featured` | No | Featured products |
| GET | `/products/:id` | Optional | Product detail |
| POST | `/products` | Admin | Create |
| PUT | `/products/:id` | Admin | Update |
| DELETE | `/products/:id` | Admin | Delete |

### Categories

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/categories` | No | List |
| GET | `/categories/:id` | No | Detail |
| POST | `/categories` | Admin | Create |
| PUT | `/categories/:id` | Admin | Update |
| DELETE | `/categories/:id` | Admin | Delete |

### Cart

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/cart` | Yes | Get cart |
| POST | `/cart/items` | Yes | Add item |
| PUT | `/cart/items/:productId` | Yes | Update quantity |
| DELETE | `/cart/items/:productId` | Yes | Remove item |
| DELETE | `/cart` | Yes | Clear cart |

### Orders

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/orders` | Yes | Place order |
| GET | `/orders/my` | Yes | My orders |
| GET | `/orders/:id` | Yes | Order detail |
| PATCH | `/orders/:id/cancel` | Yes | Cancel own order |
| GET | `/orders/admin/all` | Admin | All orders |
| GET | `/orders/admin/stats` | Admin | Dashboard stats |
| PATCH | `/orders/admin/:id/status` | Admin | Update status |

### Users (admin)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/users` | Admin | List users |
| GET | `/users/:id` | Admin | User detail |
| PUT | `/users/:id` | Admin | Update user |
| DELETE | `/users/:id` | Admin | Delete user |

### Response shape

Success:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "message": "Error message"
}
```

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `MongoServerError` / connection refused | Start local MongoDB or fix `MONGODB_URI` / Atlas network access |
| CORS errors | Ensure `CLIENT_URL` matches the Vite origin (`http://localhost:5173`) |
| 401 on protected routes | Log in again; confirm token/cookie and `JWT_SECRET` |
| Empty shop | Run `npm run seed` |
| Port already in use | Change `PORT` in `server/.env` or stop the other process |
| Frontend can't reach API | Confirm `VITE_API_URL` and that the server is running on port 5000 |

## License

MIT

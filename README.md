# 🎪 EventSphere — MERN Event Management System

A full-stack event management platform built with the MERN stack featuring separate **User** and **Admin** panels.

---

## 🚀 Tech Stack

| Layer      | Technology                                           |
|------------|------------------------------------------------------|
| Frontend   | React 18, React Router v6, React Hot Toast           |
| Backend    | Node.js, Express.js                                  |
| Database   | MongoDB with Mongoose ODM                            |
| Auth       | JWT (JSON Web Tokens) + bcryptjs                     |
| Styling    | Custom CSS with CSS Variables (no UI framework)      |
| Fonts      | Playfair Display + DM Sans (Google Fonts)            |

---

## 📁 Project Structure

```
event-management/
├── backend/
│   ├── config/         → MongoDB connection
│   ├── middleware/     → JWT auth middleware
│   ├── models/         → User, Event, Booking schemas
│   ├── routes/         → Auth, Events, Bookings, Admin API routes
│   ├── server.js       → Express server entry point
│   └── .env.example    → Environment variable template
│
└── frontend/
    ├── public/         → HTML template with Google Fonts
    └── src/
        ├── components/ → Navbar, Footer
        ├── context/    → AuthContext (global auth state)
        ├── pages/
        │   ├── Home, Login, Register, Events, EventDetail
        │   ├── user/   → UserDashboard, MyBookings
        │   └── admin/  → AdminDashboard, ManageEvents,
        │               → CreateEditEvent, ManageUsers, ManageBookings
        └── utils/      → Axios API instance with interceptors
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js v18+
- MongoDB (local or MongoDB Atlas)
- npm

---

### 1. Clone & Setup Backend

```bash
cd event-management/backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

Edit `.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/event-management
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=7d
NODE_ENV=development
```

Start backend:
```bash
npm run dev      # Development (nodemon)
npm start        # Production
```

---

### 2. Setup Frontend

```bash
cd event-management/frontend

# Install dependencies
npm install

# Start React dev server
npm start
```

Frontend runs on `http://localhost:3000`  
Backend API runs on `http://localhost:5000`

> The `"proxy": "http://localhost:5000"` in frontend `package.json` routes API calls automatically.

---

## 🗄️ Seeding the Database

Create an admin user by making a POST request to register, then manually update their role in MongoDB:

```bash
# Using mongosh
use event-management
db.users.updateOne({ email: "admin@yourdomain.com" }, { $set: { role: "admin" } })
```

Or use a seed script to populate sample events.

---

## 🔑 API Endpoints

### Auth (`/api/auth`)
| Method | Route              | Access | Description         |
|--------|--------------------|--------|---------------------|
| POST   | /register          | Public | Register new user   |
| POST   | /login             | Public | Login               |
| GET    | /me                | Auth   | Get current user    |
| PUT    | /profile           | Auth   | Update profile      |
| PUT    | /change-password   | Auth   | Change password     |

### Events (`/api/events`)
| Method | Route       | Access | Description            |
|--------|-------------|--------|------------------------|
| GET    | /           | Public | List all events        |
| GET    | /featured   | Public | Get featured events    |
| GET    | /:id        | Public | Single event details   |

### Bookings (`/api/bookings`)
| Method | Route       | Access | Description            |
|--------|-------------|--------|------------------------|
| POST   | /           | User   | Create booking         |
| GET    | /my         | User   | My bookings            |
| GET    | /:id        | User   | Single booking         |
| PUT    | /:id/cancel | User   | Cancel booking         |

### Admin (`/api/admin`) — Admin only
| Method | Route                        | Description              |
|--------|------------------------------|--------------------------|
| GET    | /stats                       | Dashboard statistics     |
| GET    | /events                      | List all events          |
| POST   | /events                      | Create event             |
| PUT    | /events/:id                  | Update event             |
| DELETE | /events/:id                  | Delete event             |
| GET    | /users                       | List all users           |
| PUT    | /users/:id/toggle-status     | Activate/deactivate user |
| PUT    | /users/:id/make-admin        | Promote user to admin    |
| DELETE | /users/:id                   | Delete user              |
| GET    | /bookings                    | All bookings             |

---

## 🎨 Features

### 👤 User Panel
- Browse & search events (by category, city, price, date)
- View event details with live seat availability
- Book events (up to 10 seats)
- Cancel upcoming bookings
- Personal dashboard with booking history & stats

### ⚡ Admin Panel
- Dashboard with revenue, user, event & booking stats
- Create, edit, delete events
- Manage user accounts (activate/deactivate/promote/delete)
- View all bookings with filtering
- Category breakdown chart

### 🔒 Auth & Security
- JWT-based authentication
- bcrypt password hashing
- Role-based access control (user/admin)
- Protected routes on both frontend and backend
- Unique booking reference codes auto-generated

---

## 🌐 Environment Variables

| Variable   | Description                    | Default                   |
|------------|--------------------------------|---------------------------|
| PORT       | Backend server port            | 5000                      |
| MONGO_URI  | MongoDB connection string      | localhost/event-management|
| JWT_SECRET | Secret for signing JWT tokens  | (required)                |
| JWT_EXPIRE | Token expiry duration          | 7d                        |
| NODE_ENV   | Environment                    | development               |

---

## 📦 Building for Production

```bash
# Build React frontend
cd frontend && npm run build

# The build/ folder can be served statically from Express or deployed to Netlify/Vercel
```

For production, serve the React build from Express:
```js
// Add to server.js
const path = require('path');
app.use(express.static(path.join(__dirname, '../frontend/build')));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../frontend/build/index.html')));
```

---

## 📄 License
MIT — Free to use and modify.

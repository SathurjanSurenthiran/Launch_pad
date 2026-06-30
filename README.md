# Student Project Showcase Portal

A full-stack web application that enables students to showcase their academic and personal projects while allowing recruiters and other users to discover, explore, and interact with them.

Built using the MERN Stack (MongoDB, Express.js, React.js, and Node.js), the platform provides secure authentication, project management, user profiles, and social engagement features.

---

## 📌 Features

### Authentication
- User Registration
- Secure Login
- JWT Authentication
- Password Encryption using bcrypt
- Protected Routes
- Role-Based Access Control

### User Management
- User Profile
- Edit Profile
- Upload Profile Picture
- View Other User Profiles

### Project Management
- Create Projects
- Edit Projects
- Delete Projects
- Upload Project Thumbnail
- Categorize Projects
- Search Projects
- Filter Projects

### Social Features
- Like Projects
- Follow Users
- View User Projects
- Notifications

### Admin Features
- Manage Users
- Manage Projects
- Dashboard
- User Statistics

---

# 🛠 Tech Stack

## Frontend

- React.js
- Vite
- React Router DOM
- Axios
- Tailwind CSS
- React Query
- Framer Motion
- Lucide React

## Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcrypt
- CORS
- dotenv
- Multer

## Database

- MongoDB Atlas

---

# 📁 Project Structure

```
Student-Project-Showcase-Portal
│
├── frontend
│   ├── src
│   │   ├── api
│   │   ├── assets
│   │   ├── components
│   │   ├── contexts
│   │   ├── hooks
│   │   ├── layouts
│   │   ├── pages
│   │   ├── routes
│   │   ├── services
│   │   ├── styles
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── backend
│   ├── config
│   ├── controllers
│   ├── middlewares
│   ├── models
│   ├── routes
│   ├── services
│   ├── utils
│   ├── uploads
│   ├── server.js
│   └── package.json
│
└── README.md
```

---

# ⚙️ Installation

## Clone Repository

```bash
git clone <repository-url>
```

```
cd Student-Project-Showcase-Portal
```

---

# Backend Setup

Navigate to backend

```bash
cd backend
```

Install dependencies

```bash
npm install
```

Create a `.env` file

```env
PORT=3000

MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_secret_key

JWT_EXPIRES_IN=7d

CLIENT_URL=http://localhost:5173
```

Start Backend

```bash
npm run dev
```

---

# Frontend Setup

Navigate to frontend

```bash
cd frontend
```

Install dependencies

```bash
npm install
```

Create `.env`

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

Run Frontend

```bash
npm run dev
```

---

# API Endpoints

## Authentication

```
POST /api/auth/register

POST /api/auth/login

GET /api/auth/me
```

## Users

```
GET /api/users

GET /api/users/:id

PUT /api/users/:id
```

## Projects

```
GET /api/projects

POST /api/projects

GET /api/projects/:id

PUT /api/projects/:id

DELETE /api/projects/:id
```

## Likes

```
POST /api/projects/:id/like
```

## Follow

```
POST /api/users/:id/follow
```

---

# Environment Variables

Backend

```env
PORT=

MONGODB_URI=

JWT_SECRET=

JWT_EXPIRES_IN=

CLIENT_URL=
```

Frontend

```env
VITE_API_BASE_URL=
```

---

# Authentication Flow

1. User registers.
2. Password is encrypted using bcrypt.
3. User logs in.
4. JWT token is generated.
5. Token is stored on the client.
6. Protected routes validate JWT.
7. Authorized users can access secured resources.

---

# Database

MongoDB Atlas is used as the cloud database.

Collections include:

- Users
- Projects
- Likes
- Follows
- Notifications

---

# Future Enhancements

- Google OAuth Login
- Project Comments
- Email Verification
- Chat System
- Recruiter Dashboard
- Bookmark Projects
- Resume Upload
- Advanced Search
- Project Analytics
- AI Project Recommendations

---

# Security

- JWT Authentication
- Password Hashing
- Protected Routes
- Input Validation
- Environment Variables
- CORS Configuration

---

# Contributors

- Sulakshan Shanmuharasa
- Web Titans Team

---

# License

This project is developed for educational purposes and academic submission.

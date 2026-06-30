# Student Project Showcase Portal Backend

The Student Project Showcase Portal backend is a secure, event-driven REST API that enables students to publish academic and side projects, receive review notifications, and connect with peers and recruiters. It features Google OAuth login, Cloudinary buffer image streams, paginated searches, social like/follow toggles, and administrative moderation overrides.

---

## Tech Stack
* **Runtime Environment:** Node.js (v20+)
* **Framework:** Express.js (v5)
* **Database:** MongoDB & Mongoose ODM
* **Security & Hardening:** CORS, Helmet, express-rate-limit, Joi validations, HTML sanitizations
* **File Uploads:** Multer (memoryStorage) & Cloudinary
* **Logging:** Winston logger & Morgan HTTP requests logging
* **Event Dispatcher:** Node.js built-in EventEmitter

---

## Prerequisites
* [Node.js](https://nodejs.org/) (v20 or higher)
* [MongoDB](https://www.mongodb.com/) (v7.0 or higher) or [Docker](https://www.docker.com/)

---

## Local Setup

### Option A: Using Docker (Recommended)
This launches the app container and a local MongoDB instance in a shared bridged network:

1. Clone the repository and navigate to the backend folder.
2. Create a `.env` file in the root based on `.env.example`.
3. Build and launch the container cluster:
   ```bash
   docker-compose up --build
   ```
4. Access the API at `http://localhost:5000/`.

### Option B: Manual Installation
1. Start your local MongoDB server.
2. Install npm packages:
   ```bash
   npm install
   ```
3. Create your `.env` file based on `.env.example` (ensure `MONGODB_URI` points to `mongodb://localhost:27017/student-showcase`).
4. Start the server in development mode:
   ```bash
   npm run dev
   ```

---

## Environment Variables Reference
The following parameters must be configured in your `.env` file:

| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `PORT` | Local network binding port for the API | `5000` |
| `NODE_ENV` | Run environment | `development` |
| `MONGODB_URI` | Connection string to MongoDB database | `mongodb://localhost:27017/db` |
| `JWT_SECRET` | Secret key used to sign session cookies | `your_secret_string` |
| `JWT_EXPIRES_IN`| Token lifespan string | `7d` |
| `GOOGLE_CLIENT_ID`| Google OAuth Client ID credentials | `google_client_id` |
| `GOOGLE_CLIENT_SECRET`| Google OAuth Client Secret credentials | `google_client_secret` |
| `GOOGLE_CALLBACK_URL`| Google OAuth redirect callback endpoint | `http://localhost:5000/api/auth/google/callback` |
| `CLOUDINARY_CLOUD_NAME`| Cloudinary cloud account name | `cloudinary_name` |
| `CLOUDINARY_API_KEY`| Cloudinary API integration key | `api_key` |
| `CLOUDINARY_API_SECRET`| Cloudinary API integration secret | `api_secret` |
| `CLIENT_URL` | Cross-Origin Allowed Client Application URL | `http://localhost:5173` |

---

## Available NPM Scripts

* `npm start`: Runs the production bundle server.
* `npm run dev`: Fires up nodemon server auto-reloading on files save.
* `npm run lint`: Triggers ESLint analysis checks across `src/`.
* `npm run docker:build`: Compiles the optimized docker image.
* `npm run docker:run`: Launches the container binding port `3000` with variables loaded from `.env`.

---

## API Documentation
The API base URL mounts on `http://localhost:5000/`. For detailed REST specification covering fields schema shapes, response models, query pagination rules, and error states, refer to the [API Specification Document](src/docs/api-spec.md).

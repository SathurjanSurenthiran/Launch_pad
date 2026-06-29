# API Specification - Student Project Showcase Portal Backend

This document contains the complete REST API reference for the Student Project Showcase Portal backend.

---

## 1. Authentication Endpoints

### 1.1 Login with Google
* **Method + Path:** `POST /api/auth/google`
* **Auth Required:** None (Rate limited: Strict - 20 req/15 min)
* **Request Body:**
  ```json
  {
    "idToken": "string (required)"
  }
  ```
* **Success Response (200 OK):**
  Sets HTTP-Only cookie `token` with JWT token.
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "user": {
        "_id": "603d2903c530b355209f9872",
        "name": "Jane Doe",
        "email": "janedoe@university.edu",
        "profilePicture": "https://cloudinary.com/profiles/avatar.png",
        "role": "STUDENT",
        "university": "State University",
        "department": "Computer Science",
        "graduationYear": 2026,
        "isVerified": true,
        "isActive": true
      }
    }
  }
  ```
* **Error Responses:**
  * `400 Bad Request`: Validation failure (e.g. missing `idToken`).
  * `401 Unauthorized`: Google token verification failed.

### 1.2 Get Current Session User
* **Method + Path:** `GET /api/auth/me`
* **Auth Required:** Authenticated (Any role)
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "User session retrieved successfully",
    "data": {
      "user": {
        "_id": "603d2903c530b355209f9872",
        "name": "Jane Doe",
        "email": "janedoe@university.edu",
        "profilePicture": "https://cloudinary.com/profiles/avatar.png",
        "role": "STUDENT",
        "isActive": true
      }
    }
  }
  ```

### 1.3 Logout
* **Method + Path:** `POST /api/auth/logout`
* **Auth Required:** None
* **Success Response (200 OK):**
  Clears HTTP-Only cookie `token`.
  ```json
  {
    "success": true,
    "message": "Logged out successfully"
  }
  ```

---

## 2. User Profiles Endpoints

### 2.1 Get Self Profile (Rich)
* **Method + Path:** `GET /api/users/me`
* **Auth Required:** Authenticated
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "My profile retrieved successfully",
    "data": {
      "_id": "603d2903c530b355209f9872",
      "name": "Jane Doe",
      "email": "janedoe@university.edu",
      "profilePicture": "https://cloudinary.com/profiles/avatar.png",
      "role": "STUDENT",
      "bio": "Software developer student.",
      "university": "State University",
      "department": "Computer Science",
      "graduationYear": 2026,
      "isVerified": true,
      "isActive": true,
      "followStats": {
        "followersCount": 42,
        "followingCount": 10
      },
      "projectCount": 5
    }
  }
  ```

### 2.2 Update Self Profile
* **Method + Path:** `PATCH /api/users/me`
* **Auth Required:** Authenticated (Rate limited: Upload - 30 req/hour)
* **Request Format:** Multipart Form Data
* **Body Parameters:**
  * `name`: string (optional, max 100)
  * `bio`: string (optional, max 500)
  * `university`: string (optional)
  * `department`: string (optional)
  * `graduationYear`: number (optional, 1990–2035)
  * `profilePicture`: file (optional, avatar image jpeg/png/webp)
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Profile updated successfully",
    "data": {
      "_id": "603d2903c530b355209f9872",
      "name": "Jane Doe Updated",
      "bio": "New Bio Text"
    }
  }
  ```

### 2.3 Get Public Profile
* **Method + Path:** `GET /api/users/:id`
* **Auth Required:** None (Optional authentication)
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "User profile retrieved successfully",
    "data": {
      "_id": "603d2903c530b355209f9872",
      "name": "Jane Doe",
      "email": "janedoe@university.edu",
      "profilePicture": "https://cloudinary.com/profiles/avatar.png",
      "role": "STUDENT",
      "bio": "Bio content.",
      "university": "State University",
      "followStats": {
        "followersCount": 42,
        "followingCount": 10
      },
      "projectCount": 5,
      "isFollowing": false
    }
  }
  ```

### 2.4 Get User's Projects
* **Method + Path:** `GET /api/users/:id/projects`
* **Auth Required:** None (Optional authentication)
* **Query Parameters:** `page` (default 1), `limit` (default 12)
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "User projects retrieved successfully",
    "data": {
      "projects": [ ... ],
      "pagination": {
        "page": 1,
        "limit": 12,
        "total": 3,
        "totalPages": 1
      }
    }
  }
  ```

---

## 3. Projects Endpoints

### 3.1 Get Projects
* **Method + Path:** `GET /api/projects`
* **Auth Required:** None (Optional authentication)
* **Query Parameters:**
  * `page`: integer (default 1, max limit 50)
  * `limit`: integer (default 12)
  * `category`: string (optional)
  * `techStack`: comma-separated string (optional)
  * `status`: string (optional, ADMIN role only)
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Projects retrieved successfully",
    "data": {
      "projects": [ ... ],
      "pagination": { "page": 1, "limit": 12, "total": 1, "totalPages": 1 }
    }
  }
  ```

### 3.2 Search Projects
* **Method + Path:** `GET /api/projects/search`
* **Auth Required:** None (Optional authentication)
* **Query Parameters:** `q` (required text search), `page`, `limit`, `category`, `techStack`
* **Success Response (200 OK):**
  Returns paginated text-score matches.

### 3.3 Get Project by ID
* **Method + Path:** `GET /api/projects/:id`
* **Auth Required:** None (Optional authentication)
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Project retrieved successfully",
    "data": {
      "_id": "603d2903c530b355209f9899",
      "owner": { ... },
      "title": "Project Title",
      "description": "Project Description",
      "coverImage": "https://cloudinary.com/projects/cover.png",
      "likeCount": 10,
      "viewCount": 240,
      "isLiked": true
    }
  }
  ```

### 3.4 Create Project
* **Method + Path:** `POST /api/projects`
* **Auth Required:** STUDENT role (Rate limited: Upload - 30 req/hour)
* **Request Format:** Multipart Form Data
* **Body Parameters:**
  * `title`: string (required, max 150)
  * `description`: string (required, max 5000)
  * `category`: string (required, PROJECT_CATEGORIES enum)
  * `techStack`: array or comma-separated string (optional, max 10 tags)
  * `demoLink`: string (optional, valid URL)
  * `githubLink`: string (optional, valid URL)
  * `coverImage`: file (required)
  * `images`: file array (optional, max 5 files)
* **Success Response (201 Created):**
  Returns created project with status PENDING.

### 3.5 Update Project
* **Method + Path:** `PUT /api/projects/:id`
* **Auth Required:** STUDENT role (Must own project) (Rate limited: Upload - 30 req/hour)
* **Request Format:** Multipart Form Data (updates fields, resets status to PENDING)

### 3.6 Delete Project (Soft-decouple or Hard delete)
* **Method + Path:** `DELETE /api/projects/:id`
* **Auth Required:** STUDENT role (Must own project) or ADMIN role (Hard delete)

### 3.7 Hide Project
* **Method + Path:** `PATCH /api/projects/:id/hide`
* **Auth Required:** STUDENT role (Must own project)

### 3.8 Resubmit Project
* **Method + Path:** `PATCH /api/projects/:id/resubmit`
* **Auth Required:** STUDENT role (Must own project)

### 3.9 Admin Update Status
* **Method + Path:** `PATCH /api/projects/:id/status`
* **Auth Required:** ADMIN role
* **Request Body:**
  ```json
  {
    "status": "APPROVED | REJECTED | HIDDEN",
    "rejectionReason": "Required if status is REJECTED"
  }
  ```

---

## 4. Notifications Endpoints

### 4.1 Get My Notifications
* **Method + Path:** `GET /api/notifications`
* **Auth Required:** Authenticated
* **Query Parameters:** `page`, `limit`

### 4.2 Get Unread Notifications Count
* **Method + Path:** `GET /api/notifications/unread-count`
* **Auth Required:** Authenticated

### 4.3 Mark All Notifications as Read
* **Method + Path:** `PATCH /api/notifications/read-all`
* **Auth Required:** Authenticated

### 4.4 Mark Single Notification as Read
* **Method + Path:** `PATCH /api/notifications/:id/read`
* **Auth Required:** Authenticated (Must be the recipient)

---

## 5. Interactions Endpoints (Likes & Follows)

### 5.1 Toggle Project Like
* **Method + Path:** `POST /api/interactions/projects/:id/like`
* **Auth Required:** Authenticated (Cannot be the project owner)
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Project liked successfully",
    "data": { "liked": true }
  }
  ```

### 5.2 Get Project Likes list
* **Method + Path:** `GET /api/interactions/projects/:id/likes`
* **Auth Required:** None (Optional authentication)

### 5.3 Toggle User Follow
* **Method + Path:** `POST /api/interactions/users/:id/follow`
* **Auth Required:** Authenticated (Cannot follow self)

### 5.4 Get User Followers list
* **Method + Path:** `GET /api/interactions/users/:id/followers`
* **Auth Required:** None (Optional authentication)

### 5.5 Get User Following list
* **Method + Path:** `GET /api/interactions/users/:id/following`
* **Auth Required:** None (Optional authentication)

### 5.6 Get User Follow Stats counts
* **Method + Path:** `GET /api/interactions/users/:id/follow-stats`
* **Auth Required:** None (Optional authentication)

---

## 6. Admin Panel Endpoints

### 6.1 Get Dashboard Statistics
* **Method + Path:** `GET /api/admin/dashboard`
* **Auth Required:** ADMIN role

### 6.2 Get All Users (Paginated)
* **Method + Path:** `GET /api/admin/users`
* **Auth Required:** ADMIN role
* **Query Parameters:** `page` (default 1, limit 20), `limit`, `role`, `isActive`, `search`

### 6.3 Get User details by ID
* **Method + Path:** `GET /api/admin/users/:id`
* **Auth Required:** ADMIN role

### 6.4 Update User Role
* **Method + Path:** `PATCH /api/admin/users/:id/role`
* **Auth Required:** ADMIN role (Admins cannot change own role, new role must be STUDENT or RECRUITER)
* **Request Body:** `{ "role": "STUDENT | RECRUITER" }`

### 6.5 Deactivate User
* **Method + Path:** `PATCH /api/admin/users/:id/deactivate`
* **Auth Required:** ADMIN role (Sets `isActive=false` and hides all their projects)

### 6.6 Reactivate User
* **Method + Path:** `PATCH /api/admin/users/:id/reactivate`
* **Auth Required:** ADMIN role (Sets `isActive=true`)

### 6.7 Get All Projects (Paginated)
* **Method + Path:** `GET /api/admin/projects`
* **Auth Required:** ADMIN role

### 6.8 Delete Project permanently
* **Method + Path:** `DELETE /api/admin/projects/:id`
* **Auth Required:** ADMIN role (Hard delete)

---

## 7. Health Check Endpoint

### 7.1 Health status
* **Method + Path:** `GET /health`
* **Auth Required:** None
* **Success Response (200 OK):**
  ```json
  {
    "status": "ok",
    "uptime": 12.435,
    "timestamp": 1719504265100,
    "db": "connected"
  }
  ```

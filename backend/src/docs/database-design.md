# Database Design - MongoDB Schema Reference

This document maps all collections, fields, data types, validation constraints, single/compound indexes, and relational schemas.

---

## 1. User Collection (`users`)

* **Purpose:** Stores details of students, recruiters, and administrators.
* **Fields:**
  * `googleId`: String (required, unique)
  * `name`: String (required)
  * `email`: String (required, unique)
  * `profilePicture`: String (default: "")
  * `role`: String (enum: `['STUDENT', 'RECRUITER', 'ADMIN']`, default: `'STUDENT'`)
  * `bio`: String (default: "")
  * `university`: String (default: "")
  * `department`: String (default: "")
  * `graduationYear`: Number (default: null)
  * `isVerified`: Boolean (default: false)
  * `isActive`: Boolean (default: true)
  * `staffVerified`: Boolean (default: false)
  * `createdAt`: Date (automatically generated timestamp)
  * `updatedAt`: Date (automatically generated timestamp)
* **Indexes:**
  * `{ googleId: 1 }` (unique)
  * `{ email: 1 }` (unique)
  * `{ name: "text" }` (for case-insensitive text search)

---

## 2. Project Collection (`projects`)

* **Purpose:** Stores students' showcase projects.
* **Fields:**
  * `owner`: ObjectId (ref: `User`, required)
  * `title`: String (required, max 150)
  * `description`: String (required, max 5000)
  * `coverImage`: String (required, Cloudinary URL)
  * `images`: Array of Strings (max 5 Cloudinary URLs)
  * `techStack`: Array of Strings
  * `demoLink`: String
  * `githubLink`: String
  * `category`: String (enum from `PROJECT_CATEGORIES`, default: `'OTHER'`)
  * `status`: String (enum: `['PENDING', 'APPROVED', 'REJECTED', 'HIDDEN']`, default: `'PENDING'`)
  * `rejectionReason`: String (default: "")
  * `likeCount`: Number (default: 0)
  * `viewCount`: Number (default: 0)
  * `createdAt`: Date (timestamp)
  * `updatedAt`: Date (timestamp)
* **Indexes:**
  * `{ owner: 1 }`
  * `{ status: 1 }`
  * `{ status: 1, createdAt: -1 }`
  * `{ category: 1 }`
  * `{ title: "text", description: "text", techStack: "text" }` (Text search index)

---

## 3. Like Collection (`likes`)

* **Purpose:** Maps user likes to projects.
* **Fields:**
  * `user`: ObjectId (ref: `User`, required)
  * `project`: ObjectId (ref: `Project`, required)
  * `createdAt`: Date (timestamp)
  * `updatedAt`: Date (timestamp)
* **Indexes:**
  * `{ user: 1, project: 1 }` (Compound unique index - prevents duplicate likes)

---

## 4. Follower Collection (`followers`)

* **Purpose:** Captures student follow connections.
* **Fields:**
  * `follower`: ObjectId (ref: `User`, required)
  * `following`: ObjectId (ref: `User`, required)
  * `createdAt`: Date (timestamp)
  * `updatedAt`: Date (timestamp)
* **Indexes:**
  * `{ follower: 1, following: 1 }` (Compound unique index - prevents duplicate follows)
  * `{ following: 1 }` (for fast follower lookups)

---

## 5. Notification Collection (`notifications`)

* **Purpose:** Stores social and administrative alerts for users.
* **Fields:**
  * `recipient`: ObjectId (ref: `User`, required)
  * `sender`: ObjectId (ref: `User`, optional)
  * `type`: String (enum: `PROJECT_CREATED`, `PROJECT_UPDATED`, `PROJECT_APPROVED`, `PROJECT_REJECTED`, `PROJECT_HIDDEN`, `PROJECT_LIKED`, `USER_FOLLOWED`)
  * `message`: String (required)
  * `referenceId`: ObjectId (ref path: dynamic reference)
  * `isRead`: Boolean (default: false)
  * `createdAt`: Date (timestamp)
  * `updatedAt`: Date (timestamp)
* **Indexes:**
  * `{ recipient: 1 }`
  * `{ recipient: 1, isRead: 1 }` (Optimizes unread badges lookup queries)

---

## 6. Activity Log Collection (`activity_logs`)

* **Purpose:** Audit trail tracking administrative overrides and creations.
* **Fields:**
  * `user`: ObjectId (ref: `User`, required)
  * `action`: String (required, e.g. `PROJECT_CREATED`, `ADMIN_UPDATE_ROLE`, `ADMIN_DEACTIVATE_USER`)
  * `entity`: String (required, e.g. `Project` or `User`)
  * `entityId`: ObjectId (required)
  * `metadata`: Mixed (default: {})
  * `createdAt`: Date (timestamp)
  * `updatedAt`: Date (timestamp)
* **Indexes:**
  * `{ user: 1 }`
  * `{ action: 1 }`
  * `{ createdAt: -1 }` (Optimizes audits history sorting)

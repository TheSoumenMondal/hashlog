
#  Microservice-Based Blog Platform — Hashlog

---
![Image](https://github.com/user-attachments/assets/83cde69f-a07d-4b9d-b346-9902913294e4)

---
A scalable, modular blog platform built on a **microservices architecture** with efficient **RabbitMQ**-based communication, blazing-fast **Redis caching**, and support for authentication, bookmarks, comments, and AI-powered content generation.

---

##  Features

*  **Modular Microservices** — `author`, `user`, `blog`, and `cache`
*  **Message Broker** — RabbitMQ for asynchronous communication and decoupling
*  **High-Speed Caching** — Redis-backed real-time data caching
*  **Authentication** — JWT-based auth with Google OAuth support
*  **AI Generation** — Blog title, description, and content powered by Gemini AI
*  **Developer-Friendly** — Docker-compatible, CI/CD-ready, cloud-deployable

---

##  Getting Started

###  Clone the Repository

```bash
git clone https://github.com/TheSoumenMondal/hashlog.git
cd hashlog
```

###  Install Frontend Dependencies

```bash
cd frontend
npm install
```

###  Install Backend Service Dependencies

```bash
cd ../services

cd author
npm install
cd ..

cd blog
npm install
cd ..

cd user
npm install
```

---

###  Start RabbitMQ using Docker

```bash
docker run -d \
  --hostname rabbitmq-host \
  --name rabbitmq-container \
  -e RABBITMQ_DEFAULT_USER=admin \
  -e RABBITMQ_DEFAULT_PASS=admin123 \
  -p 5672:5672 \
  -p 15672:15672 \
  rabbitmq:3-management
```

RabbitMQ Dashboard: [http://localhost:15672](http://localhost:15672)
Username: `admin` | Password: `admin123`

---

## Tech Stack

| Layer              | Technology                 |
| ------------------ | -------------------------- |
| **Backend**        | Node.js, Express.js        |
| **Message Broker** | RabbitMQ (via AMQP)        |
| **Cache**          | Redis                      |
| **Database**       | PostgreSQL, MongoDB        |
| **Auth**           | JWT, Google OAuth, Cookies |
| **Frontend**       | Next.js (TypeScript)       |

---

##  Microservices Overview

###  `author-service`

* Manages user authentication and session
* Handles JWT issuance
* Supports Google OAuth login
* Generates AI-powered blog content

#### Endpoints:

```http
POST   /blog/new           # Create a blog with image upload
POST   /blog/update/:id    # Update an existing blog
DELETE /blog/:id           # Delete a blog
POST   /ai/title           # Generate AI-based blog title
POST   /ai/description     # Generate blog description
POST   /ai/blog            # Generate complete blog post
```

---

###  `user-service`

* Handles user profiles and avatars
* Allows bookmarking blogs
* Supports user updates

#### Endpoints:

```http
POST   /login               # User login
POST   /register            # New user registration
GET    /me                  # Get current user
GET    /user/:id            # Get user by ID
POST   /user/update         # Update user details
POST   /user/update/pic     # Upload user avatar
```

---

###  `blog-service`

* Handles public blog listing and interaction
* Supports comments and bookmarking

#### Endpoints:

```http
GET    /blogs/all           # List all blogs
GET    /blogs/:id           # Get blog by ID
POST   /comment/:id         # Add comment to blog
GET    /comment/:id         # Get all comments for blog
DELETE /comment/:id         # Delete comment
POST   /save/:blogid        # Bookmark blog
GET    /save                # Get all saved blogs
```

---

###  `cache-service`

* Integrates with Redis for lightning-fast caching
* Reduces load on database for common fetches

---

##  Environment Variables

###  Author Service

```env
PORT=
DATABASE_URL=
JWT_SECRET=
CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
RABBITMQ_HOSTNAME=
RABBITMQ_PORT=
RABBITMQ_USERNAME=
RABBITMQ_PASSWORD=
CORS_ORIGIN=
GEMINI_API_KEY=
```

---

###  Blog Service

```env
PORT=8000
DATABASE_URL=
JWT_SECRET=
CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
USER_SERVICE= # e.g. http://localhost:PORT
REDIS_URL=
RABBITMQ_HOSTNAME=
RABBITMQ_PORT=
RABBITMQ_USERNAME=
RABBITMQ_PASSWORD=
CORS_ORIGIN=
```

---

###  User Service

```env
PORT=
JWT_SECRET=
CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CORS_ORIGIN=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

---

###  Frontend `.env.local`

```env
NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID=
NEXT_PUBLIC_AUTHOR_SERCIE=       # e.g. http://localhost:PORT
NEXT_PUBLIC_BLOG_SERCIE=         # e.g. http://localhost:PORT
NEXT_PUBLIC_USER_SERCIE=         # e.g. http://localhost:PORT
```

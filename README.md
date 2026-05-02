# Social Media Microservices

A microservices-based social media platform built with Node.js, Express.js, Prisma, PostgreSQL, RabbitMQ, Redis, and Docker. This repository includes an API Gateway plus four backend services for identity, posts, media, and search.

## 🚀 Features

- **User Authentication**: Registration, login, logout, refresh token using JWT.
- **Post Management**: Create, read, and delete posts with authorization.
- **Media Uploads**: Upload media files using Cloudinary and secure file handling.
- **Search**: Search posts through an event-driven search index.
- **Event-Driven Architecture**: RabbitMQ publishes and consumes post events across services.
- **API Gateway**: Central routing and authorization layer under `/v1/*`.
- **Database Separation**: Each service uses its own PostgreSQL database.
- **Containerized Deployment**: Docker Compose orchestrates all services and infrastructure.

## 🏗️ Architecture

The repository contains the following services:

- `api-gateway/` - routes client requests, applies authentication, and proxies to downstream services.
- `identity-service/` - handles registration, login, refresh token, and logout.
- `post-service/` - manages post creation, retrieval, and deletion.
- `media-service/` - handles authenticated media uploads and retrieval.
- `search-service/` - provides post search and keeps indexes updated through RabbitMQ events.

Supporting infrastructure is defined in `docker-compose.yml`:

- Redis
- RabbitMQ
- PostgreSQL databases for identity, post, media, and search services

## 🛠️ Tech Stack

- **Backend**: Node.js, Express
- **ORM**: Prisma
- **Databases**: PostgreSQL
- **Message Broker**: RabbitMQ
- **Caching / Rate limiting**: Redis
- **File Storage**: Cloudinary
- **Containerization**: Docker, Docker Compose
- **Logging**: Winston

## 📋 Prerequisites

- Docker
- Node.js v16 or newer
- npm or yarn
- Git

## 🚀 Run with Docker

From the repository root:

```bash
docker-compose up --build
```

This starts the API gateway, identity service, post service, media service, search service, Redis, RabbitMQ, and four PostgreSQL databases.

## 👩‍💻 Run Services Locally

Each service can be started independently for development.

```bash
cd api-gateway
npm install
npm run dev
```

```bash
cd identity-service
npm install
npm run dev
```

```bash
cd post-service
npm install
npm run dev
```

```bash
cd media-service
npm install
npm run dev
```

```bash
cd search-service
npm install
npm run dev
```

## 🧩 API Gateway Routes

The API Gateway listens on `http://localhost:3000` and exposes the following endpoints:

- `POST /v1/auth/register` - Register a new user
- `POST /v1/auth/login` - Authenticate a user
- `POST /v1/auth/refresh-token` - Refresh access token
- `POST /v1/auth/logout` - Logout
- `POST /v1/posts/create-post` - Create a post (authenticated)
- `GET /v1/posts/all-posts` - Get all posts (authenticated)
- `GET /v1/posts/post/:id` - Get a single post by ID (authenticated)
- `DELETE /v1/posts/delete/:id` - Delete a post by ID (authenticated)
- `POST /v1/media/upload` - Upload media (authenticated)
- `GET /v1/media/get` - Get uploaded media for the authenticated user
- `GET /v1/search/posts?q=<query>` - Search posts (authenticated)

The gateway proxies requests to internal service paths under `/api/...`.

## 🔧 Environment Variables

Each service expects its own `.env` file. Common variables include:

- `PORT`
- `REDIS_URL`
- `RABBITMQ_URL`
- `DATABASE_URL`
- `JWT_SECRET`
- `IDENTITY_SERVICE_URL`
- `POST_SERVICE_URL`
- `MEDIA_SERVICE_URL`
- `SEARCH_SERVICE_URL`

Media service also requires Cloudinary credentials:

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

## 🗂️ Service Ports

Default ports used by the services:

- API Gateway: `3000`
- Identity Service: `3001`
- Post Service: `3002`
- Media Service: `3003`
- Search Service: `3004`

Infrastructure ports:

- Redis: `6379`
- RabbitMQ: `5672` and management UI on `15672`
- identity-db: `5433`
- post-db: `5434`
- media-db: `5435`
- search-db: `5436`

## 📦 Database and Prisma

For each service using Prisma, run migrations and generate the client:

```bash
cd <service-directory>
npx prisma migrate dev
npx prisma generate
```

## 💡 Notes

- The API Gateway applies request authorization and rate limiting.
- The Post, Media, and Search services use RabbitMQ for event-driven synchronization.
- The Search service listens to `post.created` and `post.deleted` events to update search indexes.

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/AmazingFeature`
3. Commit your changes: `git commit -m 'Add some AmazingFeature'`
4. Push to your branch: `git push origin feature/AmazingFeature`
5. Open a Pull Request

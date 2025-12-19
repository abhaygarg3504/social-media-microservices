# Social Media Microservices

A scalable, microservices-based social media platform built with Node.js, Express, Prisma, RabbitMQ, and Docker. This project demonstrates modern software architecture principles, event-driven communication, and cloud-native development practices.

## 🚀 Features

- **User Authentication & Identity Management**: Secure user registration, login, and token-based authentication using JWT.
- **Post Management**: Create, read, update, and delete posts with rich content support.
- **Media Handling**: Upload and manage images/videos using Cloudinary integration.
- **Search Functionality**: Real-time search across posts and users with Elasticsearch-like capabilities.
- **Event-Driven Architecture**: Asynchronous communication between services using RabbitMQ.
- **API Gateway**: Centralized entry point for all client requests with load balancing and routing.
- **Database Management**: PostgreSQL databases for each service with Prisma ORM for type-safe queries.
- **Containerization**: Fully dockerized services for easy deployment and scaling.
- **Logging & Error Handling**: Comprehensive logging and error handling across all services.

## 🏗️ Architecture

The application follows a microservices architecture with the following services:

- **API Gateway**: Routes requests to appropriate services, handles authentication middleware.
- **Identity Service**: Manages user authentication, registration, and JWT token generation.
- **Post Service**: Handles CRUD operations for posts, including content validation.
- **Media Service**: Manages file uploads, processing, and storage via Cloudinary.
- **Search Service**: Indexes posts and provides search functionality, listens to events for real-time updates.

Services communicate asynchronously via RabbitMQ message broker and use PostgreSQL databases with Prisma ORM.

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Message Broker**: RabbitMQ
- **File Storage**: Cloudinary
- **Containerization**: Docker, Docker Compose
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Custom validation utilities
- **Logging**: Winston logger

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- Docker and Docker Compose
- Node.js (v16 or higher)
- npm or yarn
- Git

## 🚀 Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/abhaygarg3504/social-media-microservices.git
   cd social-media-microservices
   ```

2. **Environment Configuration:**
   Create `.env` files for each service with necessary environment variables (database URLs, JWT secrets, Cloudinary credentials, RabbitMQ connection, etc.).

3. **Build and run with Docker Compose:**
   ```bash
   docker-compose up --build
   ```

   This will start all services, databases, and RabbitMQ.

4. **Database Migration:**
   For each service with Prisma:
   ```bash
   cd <service-directory>
   npx prisma migrate dev
   npx prisma generate
   ```

## 📖 Usage

Once all services are running:

- API Gateway will be available at `http://localhost:3000`
- Access individual services through the gateway
- Use tools like Postman to test API endpoints

### Example API Endpoints

- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /posts` - Fetch posts
- `POST /posts` - Create a new post
- `POST /media/upload` - Upload media files
- `GET /search/posts?q=<query>` - Search posts

## 🔧 Development

### Running Individual Services

For development, you can run services individually:

```bash
cd <service-directory>
npm install
npm run dev
```

### Testing

Run tests for individual services:

```bash
npm test
```

### Database Management

- View database: `npx prisma studio`
- Reset database: `npx prisma migrate reset`

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Abhay Garg**
- GitHub: [@abhaygarg3504](https://github.com/abhaygarg3504)
- LinkedIn: [Your LinkedIn Profile]

## 🙏 Acknowledgments

- Inspired by modern microservices architectures
- Thanks to the open-source community for the amazing tools and libraries used in this project
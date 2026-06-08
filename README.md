# 🚀 blog-api-ts

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/hasan-mostafa1/blog-api-ts)
[![Version](https://img.shields.io/badge/version-1.0.0-blue)](https://github.com/hasan-mostafa1/blog-api-ts)

## 📝 Description

A robust and scalable blog API built with TypeScript, designed to be a foundation for blog web application. This project leverages modern technologies and best practices to provide a solid backend for managing blog posts, users, and comments.

## 📚 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [API Reference](#api-reference)
- [Contributing](#contributing)
- [License](#license)
- [Important Links](#important-links)

## ✨ Features

- **User Authentication:** Secure user registration and login using JWT.
- **Role-Based Access Control:** Differentiates between regular users and administrators.
- **CRUD Operations:** Full Create, Read, Update, and Delete functionality for posts and comments.
- **Image Uploads:** Supports uploading banner images for posts and profile images for users.
- **Search and Filtering:** Advanced querying capabilities for posts and comments.
- **Pagination and Sorting:** Efficiently handle large datasets.
- **Admin Panel:** Dedicated routes and logic for administrative tasks.
- **Database Management:** Utilizes Prisma ORM for seamless interaction with a PostgreSQL database.

## 🛠️ Tech Stack

- **Languages:** TypeScript, JavaScript
- **Frameworks:** Node.js, Express.js
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** Passport.js (JWT Strategy), bcryptjs, jsonwebtoken
- **Utilities:** Multer (file uploads), Express-validator (validation)

## 📥 Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/hasan-mostafa1/blog-api-ts.git
   cd blog-api-ts
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the root directory and populate it with your database credentials and a token secret.

   ```dotenv
   PORT = 3000
   TOKEN_SECRET = YOUR_STRONG_SECRET_KEY
   DATABASE_URL="postgresql://username:password@host:port/db_name?schema=public"
   ```

4. **Generate Prisma Client:**

   ```bash
   npx prisma generate
   ```

5. **Run database migrations and seeders:**
   ```bash
   npx prisma migrate dev --name init
   npx prisma db seed
   ```

## ▶️ Usage

**Development Server:**
Start the development server with hot-reloading:

```bash
npm run dev
```

**Production Build:**
Build the project for production:

```bash
npm run build
```

**Start Production Server:**
Run the production server:

```bash
npm run start
```

## 📂 Project Structure

```
blog-api-ts/
├── public/
│   ├── main.js
│   └── style.css
├── prisma/
│   ├── migrations/
│   │   └── ...
│   ├── seeders/
│   │   ├── adminSeeder.ts
│   │   └── seed.ts
│   └── schema.prisma
├── src/
│   ├── config/
│   │   ├── multer.ts
│   │   └── passportJwt.ts
│   ├── controllers/
│   │   ├── admin/
│   │   │   ├── commentController.ts
│   │   │   ├── postController.ts
│   │   │   └── userController.ts
│   │   ├── authController.ts
│   │   ├── commentController.ts
│   │   └── postController.ts
│   ├── generated/
│   │   └── prisma/
│   │       └── client.js
│   ├── lib/
│   │   ├── prisma.ts
│   │   └── utils.ts
│   ├── middlewares/
│   │   ├── authMiddleware.ts
│   │   ├── errorMiddleware.ts
│   │   ├── isAdminMiddleware.ts
│   │   └── isPostAuthorMiddleware.ts
│   ├── resources/
│   │   ├── commentResource.ts
│   │   ├── postResource.ts
│   │   └── userResource.ts
│   ├── routes/
│   │   ├── admin.ts
│   │   ├── api.ts
│   │   └── web.ts
│   ├── types/
│   │   └── express.d.ts
│   └── views/
│       └── welcome.ejs
├── .env.example
├── package.json
├── README.md
└── tsconfig.json
```

## 🌐 API Reference

This API follows RESTful principles. Here are some key endpoints:

**Authentication:**

- `POST /api/auth/signup`: Register a new user.
- `POST /api/auth/login`: Log in an existing user.
- `GET /api/auth/profile`: Get the logged-in user's profile.
- `PUT /api/auth/profile-image`: Update the logged-in user's profile image.

**Posts:**

- `GET /api/posts`: Get a list of published posts (supports filtering, sorting, pagination).
- `GET /api/my-posts`: Get posts created by the logged-in user.
- `POST /api/posts`: Create a new post.
- `GET /api/posts/:postId`: Get a specific post.
- `PUT /api/posts/:postId`: Update a specific post.
- `DELETE /api/posts/:postId`: Delete a specific post.
- `PATCH /api/posts/:postId/like`: Like a post.
- `PATCH /api/posts/:postId/unLike`: Unlike a post.

**Comments:**

- `GET /api/posts/:postId/comments`: Get comments for a specific post.
- `POST /api/posts/:postId/comments`: Create a new comment.
- `PUT /api/posts/:postId/comments/:commentId`: Update a comment.
- `DELETE /api/posts/:postId/comments/:commentId`: Delete a comment.
- `GET /api/posts/:postId/comments/:commentId/replies`: Get replies to a specific comment.
- `POST /api/posts/:postId/comments/:commentId/replies`: Add a reply to a specific comment.
- `PATCH /api/posts/:postId/comments/:commentId/like`: Like a comment.
- `PATCH /api/posts/:postId/comments/:commentId/unlike`: Unlike a comment.

**Admin Panel:**

- `GET /api/admin/users`: Get a list of all users.
- `GET /api/admin/users/:userId`: Get a specific user.
- `DELETE /api/admin/users/:userId`: Delete a specific user.
- `GET /api/admin/posts`: Get a list of all posts.
- `POST /api/admin/posts`: Create a new post (admin).
- `GET /api/admin/posts/:postId`: Get a specific post (admin).
- `PUT /api/admin/posts/:postId`: Update a specific post (admin).
- `DELETE /api/admin/posts/:postId`: Delete a specific post (admin).
- `GET /api/admin/posts/:postId/comments`: Get comments for a post (admin).
- `PUT /api/admin/posts/:postId/comments/:commentId`: Update a comment (admin).
- `DELETE /api/admin/posts/:postId/comments/:commentId`: Delete a comment (admin).

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature-name`).
3. Make your changes and commit them (`git commit -m 'Add some feature'`).
4. Push to the branch (`git push origin feature/your-feature-name`).
5. Open a Pull Request.

Please ensure your code adheres to the project's coding standards and includes relevant tests.

## 🔗 Important Links

- **Front-End Code:** [repo](https://github.com/hasan-mostafa1/blog-frontend-ts)
- **Live Demo:** [techItEasy blog](https://techiteasyblog.netlify.app/)
- **Author's GitHub:** [hasan-mostafa1](https://github.com/hasan-mostafa1)
- **Author's LinkedIn:** [Hasan Mostafa](https://www.linkedin.com/in/hasan-mostafa-dev/)

---

<footer>
  <p align="center">
  ✨ Built with ❤️ and lots of code! ✨
 </p>
 <p align="center">
  ⭐ Feel free to fork, star, and open issues! ⭐
 </p>
  <p align="center">
    <a href="https://github.com/hasan-mostafa1/blog-api-ts" target="_blank">blog-api-ts</a>
  </p>
  <p align="center">
    Created by <a href="https://github.com/hasan-mostafa1" target="_blank">hasan_mostafa</a>
  </p>
  <p align="center">
    <a href="mailto:dev.hasan.mostafa1@gmail.com" target="_blank">✉️ dev.hasan.mostafa1@gmail.com</a>
  </p>
  <p align="center">
    <a href="https://github.com/hasan-mostafa1/blog-api-ts/fork" target="_blank">Fork</a> | <a href="https://github.com/hasan-mostafa1/blog-api-ts/watchers" target="_blank">Watch</a> | <a href="https://github.com/hasan-mostafa1/blog-api-ts/stargazers" target="_blank">Star</a> | <a href="https://github.com/hasan-mostafa1/blog-api-ts/issues" target="_blank">Issue</a>
  </p>
</footer>

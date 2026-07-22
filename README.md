# Auth System

![Secure Auth Banner](./auth-banner.svg)

A production-grade, highly secure token-based authentication system built using Node.js, Express, MongoDB (Mongoose), and Redis.

## Features

- **JWT Authentication**: Secure token-based access with access and refresh tokens.
- **Token Blacklisting**: Instant logout and token revocation powered by Redis.
- **Robust Validation**: Request schemas validated using Zod.
- **Comprehensive Error Handling**: Structured API errors and global middleware.
- **Environment Driven**: Fully configurable with `.env`.

## Getting Started

### Prerequisites

Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v16+ recommended)
- [MongoDB](https://www.mongodb.com/)
- [Redis Server](https://redis.io/)

### Installation

1. Clone the repository:
   ```bash
   git clone git@github.com:Shantnu01/Auth-System.git
   cd Auth-System
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Create a `.env` file in the root directory:
   ```env
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/auth-system
   REDIS_URL=redis://localhost:6379
   JWT_ACCESS_SECRET=your_access_secret_key
   JWT_REFRESH_SECRET=your_refresh_secret_key
   ```

4. Start the application:
   ```bash
   # Development mode
   npm run dev
   ```

## API Documentation

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and receive tokens
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout and invalidate tokens

# JWT Token Authentication API

A lightweight and secure REST API built with Fastify and TypeScript that implements JWT (JSON Web Token) authentication using RSA256 algorithm with public/private key pairs.

## Project Overview

This project demonstrates a modern approach to user authentication and authorization using:

- **JWT Tokens**: Stateless authentication with access and refresh tokens
- **RSA256 Algorithm**: Asymmetric cryptography for enhanced security
- **Fastify**: High-performance Node.js framework
- **TypeScript**: Type-safe development experience

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Generate RSA Key Pair](#generate-rsa-key-pair)
- [Project Setup](#project-setup)
- [Running the Project](#running-the-project)
- [Environment Configuration](#environment-configuration)
- [API Endpoints](#api-endpoints)
- [JWT Workflow & Lifecycle](#jwt-workflow--lifecycle)
- [Library & Framework Versions](#library--framework-versions)

## Features

- User login endpoint with access and refresh token generation
- Protected routes with JWT middleware
- Token refresh mechanism for seamless user experience
- Secure RSA256 encryption for token signing
- Full TypeScript support with strict type checking
- CORS and security best practices

## Prerequisites

- Node.js (v18.0.0 or higher)
- npm or yarn
- OpenSSL (for generating RSA keys)

## Installation

### 1. Clone or Initialize the Project

```bash
git clone <repository-url>
cd api-jwt-token
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Install TypeScript Compiler (if not already installed)

```bash
npm install -D typescript
```

## Generate RSA Key Pair

The project uses RSA256 algorithm for signing and verifying JWT tokens. Follow these steps to generate the required key pair:

### Generate Private Key (PEM Format)

```bash
openssl genrsa -out src/keys/private.pem 2048
```

### Generate Public Key from Private Key

```bash
openssl rsa -in src/keys/private.pem -pubout -out src/keys/public.pem
```

### Verify Keys Were Created

```bash
ls -la src/keys/
```

You should see:

- `private.pem` - Used to sign tokens
- `public.pem` - Used to verify token signatures

## Project Setup

### TypeScript Configuration

The project comes with a pre-configured `tsconfig.json`. If needed, initialize TypeScript:

```bash
npx tsc --init
```

### Project Structure

```bash
api-jwt-token/
├── src/
│   ├── server.ts              # Main application entry point
│   ├── routes/
│   │   └── auth.route.ts      # Authentication routes
│   ├── middlewares/
│   │   └── auth.middleware.ts # JWT verification middleware
│   ├── interfaces/
│   │   ├── user.interface.ts  # User type definitions
│   │   └── payload.interface.ts # JWT payload types
│   ├── types/
│   │   └── fastify.d.ts       # Fastify module augmentation
│   └── keys/
│       ├── private.pem        # RSA private key
│       └── public.pem         # RSA public key
├── package.json
├── tsconfig.json
├── api.http                   # HTTP requests for testing
└── README.md
```

## Running the Project

### Development Mode

Start the development server with hot-reload:

```bash
npm run dev
```

The server will start on `http://localhost:3000`

### Production Build

Compile TypeScript to JavaScript:

```bash
npx tsc
```

## Environment Configuration

Currently, the server runs on:

- **Host**: localhost
- **Port**: 3000

To modify these settings, edit `src/server.ts`:

```typescript
await app.listen({ port: 3000 });
```

## API Endpoints

### 1. Login - Generate Tokens

**Endpoint**: `POST /login`

**Request**:

```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json"
```

**Response**:

```json
{
  "accessToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Description**: Authenticates a user and returns an access token (10 minutes) and a refresh token (7 days).

### 2. Get Current User - Protected Route

**Endpoint**: `GET /me`

**Headers**:

```bash
Authorization: Bearer <accessToken>
```

**Request**:

```bash
curl -X GET http://localhost:3000/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Response**:

```json
{
  "message": "Access granted to protected route",
  "user": {
    "name": "John Doe",
    "role": "admin",
    "sub": "1",
    "iat": 1234567890,
    "exp": 1234567890
  }
}
```

**Description**: Returns authenticated user information. Requires valid access token.

### 3. Refresh Token - Generate New Access Token

**Endpoint**: `POST /refresh`

**Request Body**:

```json
{
  "refreshToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Request**:

```bash
curl -X POST http://localhost:3000/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

**Response**:

```json
{
  "accessToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Description**: Generates a new access token using a valid refresh token.

## JWT Workflow & Lifecycle

### 1. Authentication Flow

```bash
User Login Request
        ↓
[Server validates credentials]
        ↓
Generate Access Token (10m) + Refresh Token (7d)
        ↓
Return both tokens to client
        ↓
Client stores tokens (access in memory, refresh securely)
```

### 2. Token Structure

The JWT token consists of three parts separated by dots:

```bash
header.payload.signature
```

**Header**:

```json
{
  "alg": "RS256",
  "typ": "JWT"
}
```

**Payload** (contains user claims):

```json
{
  "name": "John Doe",
  "role": "admin",
  "sub": "1",
  "iat": 1234567890,
  "exp": 1234567899
}
```

**Signature**: Generated using RSA256 private key

### 3. Access Token Lifecycle

1. **Generated** at login with 10-minute expiration
2. **Used** to authenticate requests to protected routes
3. **Verified** server-side using public key
4. **Expires** after 10 minutes
5. **Refreshed** using refresh token

### 4. Refresh Token Lifecycle

1. **Generated** at login with 7-day expiration
2. **Stored** server-side in a secure Map/database
3. **Used** to request a new access token
4. **Validated** for both existence and expiration
5. **Can be revoked** by removing from storage

### 5. Protected Route Access

```bash
Client Request with Bearer Token
        ↓
[authMiddleware validates token]
        ↓
Public key verifies signature
        ↓
Token not expired?
        ↓
YES → Grant access to protected route
        ↓
NO → Return 401 Unauthorized
```

### 6. Token Expiration Handling

- **Access Token Expired**: Send refresh token to `/refresh` endpoint
- **Refresh Token Expired**: User must log in again
- **Invalid Signature**: Token has been tampered with, reject immediately

## Library & Framework Versions

| Library | Version | Purpose |
|---------|---------|---------|
| **fastify** | ^5.7.4 | High-performance web framework |
| **@fastify/jwt** | ^10.0.0 | JWT plugin for Fastify |
| **typescript** | ^5.x | TypeScript language support |
| **ts-node** | ^10.9.2 | TypeScript runtime for Node.js |
| **tsx** | ^4.21.0 | TypeScript executor (dev) |
| **@types/node** | ^25.2.2 | Node.js type definitions |
| **@types/jsonwebtoken** | ^9.0.10 | JWT type definitions |

### Node.js Compatibility

- **Minimum**: Node.js 18.0.0
- **Recommended**: Node.js 20.x LTS or higher

### Development Dependencies

All dependencies are installed as development dependencies (`-D`) since this is a demonstration project. In production, move runtime dependencies to regular dependencies.

## Testing the API

Use the included `api.http` file with REST Client extension in VS Code:

```http
### Login and get tokens
POST http://localhost:3000/login

### Use access token to access protected route
GET http://localhost:3000/me
Authorization: Bearer YOUR_ACCESS_TOKEN

### Refresh the access token
POST http://localhost:3000/refresh
Content-Type: application/json

{
  "refreshToken": "YOUR_REFRESH_TOKEN"
}
```

## Security Considerations

1. **Never commit private keys** to version control
2. **Use environment variables** for sensitive configuration
3. **Implement HTTPS** in production
4. **Store refresh tokens securely** in database with user association
5. **Add token revocation** mechanism for logout functionality
6. **Validate input** on all endpoints
7. **Use secure cookies** for refresh tokens instead of localStorage

## Error Handling

The API returns standardized error responses:

```json
{
  "message": "Unauthorized"
}
```

Status codes:

- `200` - Success
- `401` - Unauthorized (invalid/expired token)
- `400` - Bad request
- `500` - Server error

## Future Enhancements

- [ ] Add database integration for user storage
- [ ] Implement token blacklist/revocation
- [ ] Add role-based access control (RBAC)
- [ ] Implement refresh token rotation
- [ ] Add email verification
- [ ] Add password reset functionality
- [ ] Implement rate limiting
- [ ] Add request logging and monitoring

## License

ISC

# Authentication API Documentation

This document outlines the authentication API endpoints and their integration in the frontend application.

## Base URL
```
http://127.0.0.1:8000/api
```

## Endpoints

### 1. Login
**Endpoint:** `POST /login`

**Purpose:** Authenticate user and get access token

**Authentication:** None required

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "device_name": "Chrome Desktop"
}
```

**Success Response (200):**
```json
{
  "token": "1|abc123def456ghi789jkl012mno345pqr678stu901vwx234yz",
  "token_type": "Bearer",
  "refreshToken": "1|abc123def456ghi789jkl012mno345pqr678stu901vwx234yz",
  "user": {
    "name": "John Doe",
    "email": "user@example.com",
    "role": "Admin",
    "abilities": ["*"]
  }
}
```

**Error Response (422):**
```json
{
  "message": "Identifiants invalides.",
  "errors": {
    "email": ["Identifiants invalides."]
  }
}
```

### 2. Refresh Token
**Endpoint:** `POST /auth/refresh`

**Purpose:** Get new access token using refresh token

**Authentication:** None required (public endpoint)

**Request Body:**
```json
{
  "refreshToken": "1|abc123def456ghi789jkl012mno345pqr678stu901vwx234yz"
}
```

**Success Response (200):**
```json
{
  "token": "2|def456ghi789jkl012mno345pqr678stu901vwx234yz",
  "token_type": "Bearer",
  "user": {
    "name": "John Doe",
    "email": "user@example.com",
    "role": "Admin",
    "abilities": ["*"]
  }
}
```

**Error Response (401):**
```json
{
  "message": "Refresh token invalide"
}
```

### 3. Logout
**Endpoint:** `POST /logout`

**Purpose:** Revoke current access token

**Authentication:** Bearer token required

**Request Headers:**
```
Authorization: Bearer {token}
```

**Success Response (200):**
```json
{
  "message": "Déconnexion réussie"
}
```

### 4. Get Current User
**Endpoint:** `GET /me`

**Purpose:** Get current authenticated user information

**Authentication:** Bearer token required

**Request Headers:**
```
Authorization: Bearer {token}
```

**Success Response (200):**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "user@example.com",
  "email_verified_at": null,
  "created_at": "2025-01-01T00:00:00.000000Z",
  "updated_at": "2025-01-01T00:00:00.000000Z",
  "roles": [
    {
      "id": 1,
      "name": "Admin",
      "guard_name": "web"
    }
  ],
  "permissions": [...]
}
```

## Token Management Flow

### Login Process:
1. Send `POST /login` with email, password, device_name
2. Store token and refreshToken in localStorage
3. Use token for Authorization header in API calls

### Token Refresh Process:
1. When API call returns 401, send `POST /auth/refresh` with refreshToken
2. Replace stored token with new token from response
3. Keep same refreshToken for future refreshes

### Logout Process:
1. Send `POST /logout` with current token
2. Clear localStorage
3. Redirect to login page

## User Roles and Abilities

- **Admin/DG:** `"abilities": ["*"]`
- **Chef Comptable / Chef d'Agence / Assistant Juridique:** `"abilities": ["access:web", "validate:core", "audit:logs"]`
- **Assistant Comptable / Caissière / Agent de Crédit:** `"abilities": ["access:web", "entry:data"]`
- **Collecteur:** `"abilities": ["access:web", "entry:caisse-mobile"]`
- **Default/Unknown:** `"abilities": ["read:only"]`

## Error Handling

- **401 Unauthorized:** Token expired or invalid, trigger refresh
- **422 Validation Error:** Invalid login credentials
- **500 Internal Server Error:** Server error, retry later

## Implementation Notes

- All tokens are Laravel Sanctum tokens in format: `{id}|{token}`
- Refresh tokens are the same as access tokens (no separate refresh tokens)
- Tokens are validated by hashing the token part and matching in database
- Old tokens are deleted upon refresh to prevent reuse
- Device name is used to identify token sessions

## Frontend Integration

### AuthContext
The `AuthContext` provides authentication state and methods:
- `login(token, user, refreshToken)`: Store authentication data
- `logout()`: Clear authentication data and call logout API
- `refreshToken()`: Refresh access token
- `getCurrentUser()`: Fetch current user data
- `hasPermission(permission)`: Check user permissions

### ApiClient
The `ApiClient` automatically:
- Adds Bearer token to requests
- Handles 401 responses by attempting token refresh
- Redirects to login on authentication failure

### Login Component
The login component handles user authentication and stores tokens in localStorage.

### TypeScript Types
Authentication types are defined in `src/types/authTypes.ts` for type safety.

### AuthService
The `AuthService` class provides static methods for authentication API calls.

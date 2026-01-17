# Learnix - Learning Management System

## Project Overview

- **Purpose**: Full-stack learning management system (LMS) for online courses
- **Backend**: Go 1.25+ with go-chi/chi v5 router and GORM ORM
- **Frontend**: React 19 with Vite 7 and React Router v7
- **Database**: PostgreSQL 15
- **Containerization**: Docker & Docker Compose
- **UI Language**: Russian (user-facing text)

## Quick Start

- Run `docker-compose up` to start all services
- Backend runs at http://localhost:8080
- Frontend runs at http://localhost:8081
- PostgreSQL runs at localhost:5432

## Project Structure

```
backend/
├── cmd/learnix/main.go      # Application entrypoint, route registration
├── internal/
│   ├── api/                 # HTTP handlers (*_handler.go)
│   ├── config/              # Environment configuration (cleanenv)
│   ├── domain/              # Domain models, DTOs, validation
│   ├── lib/                 # Shared utilities (logger)
│   ├── middleware/          # HTTP middleware (JWT auth)
│   ├── presenter/           # Response formatters
│   ├── repository/          # Data access layer (per entity subdirectory)
│   ├── storage/             # Database connection
│   └── usecase/             # Business logic, repository interfaces

frontend/src/
├── api/                     # API client functions
├── components/              # Reusable React components
├── pages/                   # Page-level components
└── utils/                   # Utility functions

db/migrations/               # SQL migration files (numbered up/down pairs)
```

## Backend Development Guidelines

### Handler Pattern

- Start every handler method with `const op = "entity.handler.method"` for log tracing
- Create a scoped logger: `log := h.log.With(slog.String("op", op))`
- Decode request body with `render.DecodeJSON(r.Body, &req)`
- Validate with `req.Bind(r)` method
- Return errors using `presenter.NewErrResponse(statusCode, err)`
- Render success using `render.Render(w, r, response)` or `render.RenderList(w, r, list)`
- Log success at the end of the handler

### Use Case Pattern

- Define repository interface at the top of the usecase file
- Define usecase interface below the repository interface
- Create private struct implementing the usecase interface
- Use constructor function `NewXxxUseCase()` returning the interface

### Repository Pattern

- Implement the interface defined in the corresponding usecase file
- Use `db.WithContext(ctx)` for all GORM operations
- Define entity-specific errors (e.g., `ErrUserNotFound`, `ErrUserAlreadyExists`)
- Check `gorm.ErrRecordNotFound` and return appropriate domain errors

### Domain Model Pattern

- Define GORM model with `gorm:` and `json:` tags
- Implement `TableName() string` method
- Create `XxxRequest` struct with `Bind(r *http.Request) error` for validation
- Create `XxxResponse` struct with `Render(w http.ResponseWriter, r *http.Request) error`
- Add constructor functions: `NewXxxResponse()`, `NewXxxListResponse()`

### Adding a New Entity

1. Create `internal/domain/<entity>.go` with model, request, response types
2. Add repository interface to `internal/usecase/<entity>.go`
3. Implement repository in `internal/repository/<entity>/<entity>.go`
4. Implement use case in `internal/usecase/<entity>.go`
5. Create handler in `internal/api/<entity>_handler.go`
6. Register routes in `cmd/learnix/main.go`
7. Add migration files in `db/migrations/`

### Authentication

- JWT authentication using `golang-jwt/jwt/v5`
- Token sent in `Authorization: Bearer <token>` header
- Protect routes with `router.With(authMW.Auth).Method("/path", handler.Func)`
- Get current user ID: `uid, err := middleware.GetUserID(r.Context())`

### Error Handling

- Always return early on errors
- Use `presenter.NewErrResponse(http.StatusXxx, err)` for HTTP errors
- Log errors with `log.Error("message", slog.Any("err", err))`

## Frontend Development Guidelines

### API Client Pattern

- All API functions in `src/api/` directory
- Base URL: `const API_URL = "http://localhost:8080"`
- Get token: `localStorage.getItem("token")`
- Include auth header: `headers: { Authorization: \`Bearer ${token}\` }`
- Throw errors on non-OK responses for caller to handle

### Component Conventions

- Use functional components with hooks
- Destructure props in function signature
- Handle loading and error states in UI
- User-facing text is in Russian

### Token Management

- Store JWT in localStorage under key `"token"`
- Remove token on 401 responses: `localStorage.removeItem("token")`

## Database Guidelines

### Migrations

- Location: `db/migrations/`
- Naming: `<number>_<entity>.up.sql` and `<number>_<entity>.down.sql`
- Include `created_at`, `updated_at`, `deleted_at` columns for all tables
- Use `deleted_at TIMESTAMP NULL` for soft deletes

### Entity Relationships

- `users` - Base accounts with roles: student, teacher, admin
- `teachers` - Extended profile, references `users.id`
- `courses` - Catalog, references `teachers.user_id`
- `lessons` - Course content, references `courses.id`
- `enrollments` - Student-course relationships

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `ENVIRONMENT` | No | local | Environment: local, development, production |
| `JWT_SECRET` | Yes | - | Secret for JWT signing |
| `JWT_EXPIRY_HOURS` | No | 1 | Token expiration in hours |
| `DB_HOST` | No | localhost | PostgreSQL host |
| `DB_PORT` | No | 5432 | PostgreSQL port |
| `DB_USER` | No | user | PostgreSQL user |
| `DB_PASSWORD` | Yes | - | PostgreSQL password |
| `DB_NAME` | No | learnix_db | PostgreSQL database name |
| `DB_SSLMODE` | No | disable | PostgreSQL SSL mode |
| `SERVER_HOST` | No | 0.0.0.0 | Backend bind host |
| `SERVER_PORT` | No | 8080 | Backend bind port |
| `CORS_ALLOWED_ORIGINS` | No | * | Comma-separated allowed origins |

## API Endpoints Reference

### Public Endpoints

- `GET /user` - List users (supports `?limit=` and `?offset=`)
- `POST /user/register` - Register new user
- `POST /user/login` - Login, returns JWT token
- `GET /course` - List all courses (supports `?teacher_id=`, `?limit=`, `?offset=`)
- `GET /course/search` - Search courses (supports `?q=`, `?type=`, `?limit=`, `?offset=`)
- `GET /course/{id}` - Get course by ID
- `GET /course/{id}/lessons` - Get lessons for course
- `GET /lesson/{id}` - Get lesson by ID
- `GET /teacher` - List all teachers
- `GET /teacher/{id}` - Get teacher by user ID
- `GET /enrollment` - List enrollments (requires `?student_id=` or `?course_id=`)
- `GET /enrollment/{id}` - Get enrollment by ID

### Protected Endpoints (require JWT)

- `GET /user/me` - Get current user profile
- `POST /course` - Create course
- `PUT /course/{id}` - Update course
- `DELETE /course/{id}` - Delete course (soft delete)
- `POST /lesson` - Create lesson
- `PUT /lesson/{id}` - Update lesson
- `DELETE /lesson/{id}` - Delete lesson
- `POST /teacher` - Create teacher profile
- `POST /enrollment` - Enroll in course
- `PATCH /enrollment/{id}/progress` - Update enrollment progress (0-100)
- `PATCH /enrollment/{id}/status` - Update enrollment status (active/completed/cancelled/paused)

## Code Snippets

### Add Protected Route

```go
router.With(authMW.Auth).Post("/path", handler.Method)
```

### Get Current User ID in Handler

```go
uid, err := middleware.GetUserID(r.Context())
if err != nil {
    render.Render(w, r, presenter.NewErrResponse(http.StatusUnauthorized, err))
    return
}
```

### Validate and Process Request

```go
var req domain.XxxRequest
if err := render.DecodeJSON(r.Body, &req); err != nil {
    render.Render(w, r, presenter.NewErrResponse(http.StatusBadRequest, err))
    return
}
if err := req.Bind(r); err != nil {
    render.Render(w, r, presenter.NewErrResponse(http.StatusBadRequest, err))
    return
}
```

### Frontend API Call with Auth

```javascript
const token = localStorage.getItem("token");
const res = await fetch(`${API_URL}/endpoint`, {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data)
});
if (!res.ok) throw new Error("Request failed");
return res.json();
```

## Key Dependencies

### Backend (Go)

- `github.com/go-chi/chi/v5` - HTTP router
- `github.com/go-chi/render` - Request/response rendering
- `github.com/go-chi/cors` - CORS middleware
- `gorm.io/gorm` - ORM
- `gorm.io/driver/postgres` - PostgreSQL driver
- `github.com/golang-jwt/jwt/v5` - JWT handling
- `github.com/ilyakaznacheev/cleanenv` - Configuration
- `golang.org/x/crypto/bcrypt` - Password hashing

### Frontend (JavaScript)

- `react` ^19.2.0
- `react-dom` ^19.2.0
- `react-router-dom` ^7.10.1
- `vite` ^7.2.2

## Testing

- No test files currently present
- Recommended test structure:
  - Repository tests with test database
  - Use case tests with mock repositories
  - Handler tests with httptest

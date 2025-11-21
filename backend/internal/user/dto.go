package user

import (
	"fmt"
	"net/http"
	"regexp"
	"time"

	"github.com/go-chi/render"
)

var emailRegex = regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
var passwordRegex = regexp.MustCompile(`^[a-zA-Z0-9]{6,}$`)
var roleRegex = regexp.MustCompile(`^(student|teacher|admin)$`)
var fullNameRegex = regexp.MustCompile(`^[a-zA-Zа-яА-ЯёЁ\s'-]{2,100}$`)

type UserRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
	FullName string `json:"full_name"`
	Role     string `json:"role"`
}

func (u *UserRequest) Bind(r *http.Request) error {
	if !emailRegex.MatchString(u.Email) {
		return fmt.Errorf("invalid email")
	}
	if !passwordRegex.MatchString(u.Password) {
		return fmt.Errorf("password must be at least 6 characters long")
	}

	if !fullNameRegex.MatchString(u.FullName) {
		return fmt.Errorf("full_name is required")
	}
	if !roleRegex.MatchString(u.Role) {
		return fmt.Errorf("role must be student, teacher or admin")
	}
	return nil
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func (u *LoginRequest) Bind(r *http.Request) error {
	if u.Email == "" {
		return fmt.Errorf("email is required")
	}
	if u.Password == "" {
		return fmt.Errorf("password is required")
	}
	return nil
}

type UserResponse struct {
	ID        int    `json:"id"`
	Email     string `json:"email"`
	FullName  string `json:"full_name"`
	Role      string `json:"role"`
	CreatedAt string `json:"created_at"`
	UpdatedAt string `json:"updated_at"`
}

type LoginResponse struct {
	Email    string `json:"email"`
	FullName string `json:"full_name"`
	Token    string `json:"token"`
}

func (u *UserResponse) Render(w http.ResponseWriter, r *http.Request) error {
	return nil
}

func NewUserResponse(u *User) *UserResponse {
	return &UserResponse{
		ID:        u.ID,
		Email:     u.Email,
		FullName:  u.FullName,
		Role:      u.Role,
		CreatedAt: u.CreatedAt.Format(time.RFC3339),
		UpdatedAt: u.UpdatedAt.Format(time.RFC3339),
	}
}

func (n *LoginResponse) Render(w http.ResponseWriter, r *http.Request) error {
	return nil
}

func NewLoginResponse(email, fullName, token string) *LoginResponse {
	return &LoginResponse{Email: email, FullName: fullName, Token: token}
}

func NewUserListResponse(users []*User) []render.Renderer {
	list := make([]render.Renderer, len(users))
	for i, u := range users {
		list[i] = NewUserResponse(u)
	}
	return list
}

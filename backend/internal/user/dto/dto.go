package dto

import (
	"fmt"
	"net/http"
	"time"

	"github.com/go-chi/render"
	"github.com/lovelystarcc/learnix/internal/user/entity"
)

type UserRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
	FullName string `json:"full_name"`
	Role     string `json:"role"`
}

func (u *UserRequest) Bind(r *http.Request) error {
	if u.Email == "" {
		return fmt.Errorf("email is required")
	}
	if u.Password == "" {
		return fmt.Errorf("password is required")
	}
	if u.FullName == "" {
		return fmt.Errorf("full_name is required")
	}
	if u.Role == "" {
		return fmt.Errorf("role is required")
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

func NewUserResponse(u *entity.User) *UserResponse {
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

func NewUserListResponse(users []*entity.User) []render.Renderer {
	list := make([]render.Renderer, len(users))
	for i, u := range users {
		list[i] = NewUserResponse(u)
	}
	return list
}

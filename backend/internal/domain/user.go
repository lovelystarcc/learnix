package domain

import (
	"fmt"
	"net/http"
	"regexp"
	"time"

	"github.com/go-chi/render"
	"gorm.io/gorm"
)

type User struct {
	ID        int            `gorm:"primaryKey;autoIncrement" json:"id"`
	Email     string         `gorm:"uniqueIndex;not null;size:255" json:"email"`
	Password  string         `gorm:"column:password;not null;size:255" json:"-"`
	FullName  string         `gorm:"column:full_name;not null;size:255" json:"full_name"`
	Role      string         `gorm:"not null;size:20;check:role IN ('student', 'teacher', 'admin')" json:"role"`
	CreatedAt time.Time      `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt time.Time      `gorm:"autoUpdateTime" json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"deleted_at"`
}

func (User) TableName() string {
	return "users"
}

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

type UserLoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func (u *UserLoginRequest) Bind(r *http.Request) error {
	if u.Email == "" {
		return fmt.Errorf("email is required")
	}
	if u.Password == "" {
		return fmt.Errorf("password is required")
	}
	return nil
}

type UserResponse struct {
	ID        int       `json:"id"`
	Email     string    `json:"email"`
	FullName  string    `json:"full_name"`
	Role      string    `json:"role"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type UserLoginResponse struct {
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
		CreatedAt: u.CreatedAt,
		UpdatedAt: u.UpdatedAt,
	}
}

func (n *UserLoginResponse) Render(w http.ResponseWriter, r *http.Request) error {
	return nil
}

func NewUserLoginResponse(email, fullName, token string) *UserLoginResponse {
	return &UserLoginResponse{Email: email, FullName: fullName, Token: token}
}

func NewUserListResponse(users []*User) []render.Renderer {
	list := make([]render.Renderer, len(users))
	for i, u := range users {
		list[i] = NewUserResponse(u)
	}
	return list
}

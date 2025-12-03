// internal/usecase/user.go
package usecase

import (
	"context"
	"strconv"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/lovelystarcc/learnix/internal/domain"
	repo "github.com/lovelystarcc/learnix/internal/repository/user"
	"golang.org/x/crypto/bcrypt"
)

type UserUseCase interface {
	Register(ctx context.Context, req *domain.UserRequest) (*domain.User, error)
	Login(ctx context.Context, req *domain.UserLoginRequest) (string, *domain.User, error)
	GetAll(ctx context.Context, limit, offset int) ([]*domain.User, error)
	GetMe(ctx context.Context, userID int) (*domain.User, error)
}

type userUseCase struct {
	repo       repo.UserRepository
	secret     []byte
	expiration time.Duration
}

func NewUserUseCase(r repo.UserRepository, secret []byte, expiration time.Duration) UserUseCase {
	return &userUseCase{repo: r, secret: secret, expiration: expiration}
}

func (u *userUseCase) Register(ctx context.Context, req *domain.UserRequest) (*domain.User, error) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	user := &domain.User{
		Email:    req.Email,
		Password: string(hashedPassword),
		FullName: req.FullName,
		Role:     req.Role,
	}

	return u.repo.Create(ctx, user)
}

func (u *userUseCase) Login(ctx context.Context, req *domain.UserLoginRequest) (string, *domain.User, error) {
	user, err := u.repo.GetByEmail(ctx, req.Email)
	if err != nil {
		return "", nil, err
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		return "", nil, err
	}

	claims := jwt.MapClaims{
		"sub": strconv.Itoa(user.ID),
		"exp": time.Now().Add(u.expiration).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signed, err := token.SignedString(u.secret)
	if err != nil {
		return "", nil, err
	}

	return signed, user, nil
}

func (u *userUseCase) GetAll(ctx context.Context, limit, offset int) ([]*domain.User, error) {
	return u.repo.List(ctx, limit, offset)
}

func (u *userUseCase) GetMe(ctx context.Context, userID int) (*domain.User, error) {
	return u.repo.GetByID(ctx, userID)
}

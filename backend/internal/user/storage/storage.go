package storage

import (
	"context"
	"errors"
	"time"

	"github.com/lovelystarcc/learnix/internal/user/entity"
)

var (
	ErrUserNotFound = errors.New("user not found")
)

type UserRepository interface {
	Create(ctx context.Context, user *entity.User) (*entity.User, error)

	GetByEmail(ctx context.Context, email string) (*entity.User, error)

	GetByID(ctx context.Context, id int) (*entity.User, error)

	List(ctx context.Context, limit, offset int) ([]*entity.User, error)

	Update(ctx context.Context, user *entity.User) error

	SoftDelete(ctx context.Context, id int, deletedAt time.Time) error

	Exists(ctx context.Context, id int) (bool, error)
}

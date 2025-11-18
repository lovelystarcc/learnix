package storage

import (
	"context"
	"errors"
	"time"

	"github.com/lovelystarcc/learnix/internal/teacher/entity"
)

var (
	ErrTeacherNotFound      = errors.New("teacher not found")
	ErrTeacherAlreadyExists = errors.New("teacher already exists")
)

type TeacherRepository interface {
	Create(ctx context.Context, teacher *entity.Teacher) (*entity.Teacher, error)
	GetByID(ctx context.Context, userID int) (*entity.Teacher, error)
	List(ctx context.Context, limit, offset int) ([]*entity.Teacher, error)
	Update(ctx context.Context, teacher *entity.Teacher) error
	SoftDelete(ctx context.Context, userID int, deletedAt time.Time) error
	Exists(ctx context.Context, userID int) (bool, error)
}

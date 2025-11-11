package storage

import (
	"context"
	"errors"
	"time"

	"github.com/lovelystarcc/learnix/internal/course/entity"
)

var (
	ErrCourseNotFound = errors.New("course not found")
)

type CourseRepository interface {
	Create(ctx context.Context, course *entity.Course) error

	GetByID(ctx context.Context, id int) (*entity.Course, error)

	List(ctx context.Context, status string, teacherID *int, limit, offset int) ([]*entity.Course, error)

	Update(ctx context.Context, course *entity.Course) error

	SoftDelete(ctx context.Context, id int, deletedAt time.Time) error

	UpdateStatus(ctx context.Context, id int, status string) error

	Exists(ctx context.Context, id int) (bool, error)
}

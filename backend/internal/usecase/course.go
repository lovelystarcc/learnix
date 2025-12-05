package usecase

import (
	"context"
	"time"

	"github.com/lovelystarcc/learnix/internal/domain"
)

type CourseRepository interface {
	Create(ctx context.Context, course *domain.Course) (*domain.Course, error)
	GetByID(ctx context.Context, id int) (*domain.Course, error)
	List(ctx context.Context, teacherID *int, limit, offset int) ([]*domain.Course, error)
	Update(ctx context.Context, course *domain.Course) error
	SoftDelete(ctx context.Context, id int, deletedAt time.Time) error
	Exists(ctx context.Context, id int) (bool, error)
}

type CourseUseCase interface {
	Create(ctx context.Context, req *domain.CourseRequest) (*domain.Course, error)
	GetAll(ctx context.Context, teacherID *int, limit, offset int) ([]*domain.Course, error)
}

type courseUseCase struct {
	repo CourseRepository
}

func NewCourseUseCase(repo CourseRepository) CourseUseCase {
	return &courseUseCase{repo: repo}
}

func (uc *courseUseCase) Create(ctx context.Context, req *domain.CourseRequest) (*domain.Course, error) {
	course := &domain.Course{
		TeacherID:     req.TeacherID,
		Title:         req.Title,
		Description:   req.Description,
		CourseType:    req.CourseType,
		DurationWeeks: req.DurationWeeks,
		CreatedAt:     time.Now(),
		UpdatedAt:     time.Now(),
	}

	return uc.repo.Create(ctx, course)
}

func (uc *courseUseCase) GetAll(ctx context.Context, teacherID *int, limit, offset int) ([]*domain.Course, error) {
	return uc.repo.List(ctx, teacherID, limit, offset)
}

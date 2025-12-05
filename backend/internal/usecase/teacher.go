package usecase

import (
	"context"
	"errors"
	"time"

	"github.com/lovelystarcc/learnix/internal/domain"
)

type TeacherRepository interface {
	Create(ctx context.Context, teacher *domain.Teacher) (*domain.Teacher, error)
	GetByID(ctx context.Context, userID int) (*domain.Teacher, error)
	List(ctx context.Context, limit, offset int) ([]*domain.Teacher, error)
	Update(ctx context.Context, teacher *domain.Teacher) error
	SoftDelete(ctx context.Context, userID int) error
	Exists(ctx context.Context, userID int) (bool, error)
}

type TeacherUseCase interface {
	Create(ctx context.Context, req *domain.TeacherRequest) (*domain.Teacher, error)
	GetAll(ctx context.Context, limit, offset int) ([]*domain.Teacher, error)
}

var (
	ErrTeacherAlreadyExists = errors.New("teacher already exists")
)

type teacherUseCase struct {
	repo TeacherRepository
}

func NewTeacherUseCase(repo TeacherRepository) TeacherUseCase {
	return &teacherUseCase{repo: repo}
}

func (uc *teacherUseCase) Create(ctx context.Context, req *domain.TeacherRequest) (*domain.Teacher, error) {
	teacher := &domain.Teacher{
		UserID:         req.UserID,
		Bio:            req.Bio,
		Specialization: req.Specialization,
		Technologies:   req.Technologies,
		CoursesCount:   0,
		StudentsCount:  0,
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
	}

	created, err := uc.repo.Create(ctx, teacher)
	if err != nil {
		if errors.Is(err, ErrTeacherAlreadyExists) {
			return nil, ErrTeacherAlreadyExists
		}
		return nil, err
	}
	return created, nil
}

func (uc *teacherUseCase) GetAll(ctx context.Context, limit, offset int) ([]*domain.Teacher, error) {
	return uc.repo.List(ctx, limit, offset)
}

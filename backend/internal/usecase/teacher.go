package usecase

import (
	"context"
	"errors"
	"time"

	"github.com/lovelystarcc/learnix/internal/domain"
	repo "github.com/lovelystarcc/learnix/internal/repository/teacher"
)

type TeacherUseCase interface {
	Create(ctx context.Context, req *domain.TeacherRequest) (*domain.Teacher, error)
	GetAll(ctx context.Context, limit, offset int) ([]*domain.Teacher, error)
}

var (
	ErrTeacherAlreadyExists = errors.New("teacher already exists")
)

type teacherUseCase struct {
	repo repo.TeacherRepository
}

func NewTeacherUseCase(repo repo.TeacherRepository) TeacherUseCase {
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

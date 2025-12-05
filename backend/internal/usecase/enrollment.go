package usecase

import (
	"context"
	"errors"
	"time"

	"github.com/lovelystarcc/learnix/internal/domain"
	repo "github.com/lovelystarcc/learnix/internal/repository/enrollment"
)

type EnrollmentUseCase interface {
	Enroll(ctx context.Context, req *domain.EnrollmentRequest) (*domain.Enrollment, error)
	GetByID(ctx context.Context, id int) (*domain.Enrollment, error)
	GetByStudent(ctx context.Context, studentID int, limit, offset int) ([]*domain.Enrollment, error)
	GetByCourse(ctx context.Context, courseID int, limit, offset int) ([]*domain.Enrollment, error)
	UpdateStatus(ctx context.Context, id int, status string) error
	UpdateProgress(ctx context.Context, id int, progress int) error
	SoftDelete(ctx context.Context, id int) error
}

type enrollmentUseCase struct {
	repo repo.EnrollmentRepository
}

func NewEnrollmentUseCase(repo repo.EnrollmentRepository) EnrollmentUseCase {
	return &enrollmentUseCase{repo: repo}
}

func (uc *enrollmentUseCase) Enroll(ctx context.Context, req *domain.EnrollmentRequest) (*domain.Enrollment, error) {
	enrollment := &domain.Enrollment{
		StudentID:       req.StudentID,
		CourseID:        req.CourseID,
		Status:          req.Status,
		ProgressPercent: 0,
		CreatedAt:       time.Now(),
		UpdatedAt:       time.Now(),
	}

	return uc.repo.Create(ctx, enrollment)
}

func (uc *enrollmentUseCase) GetByID(ctx context.Context, id int) (*domain.Enrollment, error) {
	return uc.repo.GetByID(ctx, id)
}

func (uc *enrollmentUseCase) GetByStudent(ctx context.Context, studentID int, limit, offset int) ([]*domain.Enrollment, error) {
	return uc.repo.ListByStudent(ctx, studentID, limit, offset)
}

func (uc *enrollmentUseCase) GetByCourse(ctx context.Context, courseID int, limit, offset int) ([]*domain.Enrollment, error) {
	return uc.repo.ListByCourse(ctx, courseID, limit, offset)
}

func (uc *enrollmentUseCase) UpdateStatus(ctx context.Context, id int, status string) error {
	enrollment, err := uc.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	enrollment.Status = status
	enrollment.UpdatedAt = time.Now()
	if status == "completed" {
		now := time.Now()
		enrollment.CompletedAt = &now
	}
	return uc.repo.Update(ctx, enrollment)
}

func (uc *enrollmentUseCase) UpdateProgress(ctx context.Context, id int, progress int) error {
	if progress < 0 || progress > 100 {
		return errors.New("progress must be between 0 and 100")
	}
	enrollment, err := uc.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	enrollment.ProgressPercent = progress
	enrollment.UpdatedAt = time.Now()
	return uc.repo.Update(ctx, enrollment)
}

func (uc *enrollmentUseCase) SoftDelete(ctx context.Context, id int) error {
	return uc.repo.SoftDelete(ctx, id)
}

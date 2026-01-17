package usecase

import (
	"context"
	"time"

	"github.com/lovelystarcc/learnix/internal/domain"
)

type LessonRepository interface {
	Create(ctx context.Context, lesson *domain.Lesson) (*domain.Lesson, error)
	GetByID(ctx context.Context, id int) (*domain.Lesson, error)
	ListByCourse(ctx context.Context, courseID int) ([]*domain.Lesson, error)
	Update(ctx context.Context, lesson *domain.Lesson) error
	Delete(ctx context.Context, id int) error
	GetMaxOrderNum(ctx context.Context, courseID int) (int, error)
}

type LessonUseCase interface {
	Create(ctx context.Context, req *domain.LessonRequest) (*domain.Lesson, error)
	GetByID(ctx context.Context, id int) (*domain.Lesson, error)
	GetByCourse(ctx context.Context, courseID int) ([]*domain.Lesson, error)
	Update(ctx context.Context, id int, req *domain.LessonRequest) (*domain.Lesson, error)
	Delete(ctx context.Context, id int) error
}

type lessonUseCase struct {
	repo       LessonRepository
	courseRepo CourseRepository
}

func NewLessonUseCase(repo LessonRepository, courseRepo CourseRepository) LessonUseCase {
	return &lessonUseCase{repo: repo, courseRepo: courseRepo}
}

func (uc *lessonUseCase) Create(ctx context.Context, req *domain.LessonRequest) (*domain.Lesson, error) {
	// Verify course exists
	exists, err := uc.courseRepo.Exists(ctx, req.CourseID)
	if err != nil {
		return nil, err
	}
	if !exists {
		return nil, ErrCourseNotFound
	}

	// If order_num is 0, get next available
	orderNum := req.OrderNum
	if orderNum == 0 {
		maxOrder, err := uc.repo.GetMaxOrderNum(ctx, req.CourseID)
		if err != nil {
			return nil, err
		}
		orderNum = maxOrder + 1
	}

	lesson := &domain.Lesson{
		CourseID:  req.CourseID,
		Title:     req.Title,
		Content:   req.Content,
		OrderNum:  orderNum,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	return uc.repo.Create(ctx, lesson)
}

func (uc *lessonUseCase) GetByID(ctx context.Context, id int) (*domain.Lesson, error) {
	return uc.repo.GetByID(ctx, id)
}

func (uc *lessonUseCase) GetByCourse(ctx context.Context, courseID int) ([]*domain.Lesson, error) {
	return uc.repo.ListByCourse(ctx, courseID)
}

func (uc *lessonUseCase) Update(ctx context.Context, id int, req *domain.LessonRequest) (*domain.Lesson, error) {
	lesson, err := uc.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	lesson.Title = req.Title
	lesson.Content = req.Content
	lesson.OrderNum = req.OrderNum
	lesson.UpdatedAt = time.Now()

	if err := uc.repo.Update(ctx, lesson); err != nil {
		return nil, err
	}

	return lesson, nil
}

func (uc *lessonUseCase) Delete(ctx context.Context, id int) error {
	return uc.repo.Delete(ctx, id)
}

var ErrCourseNotFound = courseNotFoundError{}

type courseNotFoundError struct{}

func (e courseNotFoundError) Error() string {
	return "course not found"
}

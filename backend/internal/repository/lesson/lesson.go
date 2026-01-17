package lesson

import (
	"context"
	"errors"

	"gorm.io/gorm"

	"github.com/lovelystarcc/learnix/internal/domain"
	"github.com/lovelystarcc/learnix/internal/usecase"
)

var (
	ErrLessonNotFound = errors.New("lesson not found")
)

type repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) usecase.LessonRepository {
	return &repository{db: db}
}

func (r *repository) Create(ctx context.Context, lesson *domain.Lesson) (*domain.Lesson, error) {
	if err := r.db.WithContext(ctx).Create(lesson).Error; err != nil {
		return nil, err
	}
	return lesson, nil
}

func (r *repository) GetByID(ctx context.Context, id int) (*domain.Lesson, error) {
	var l domain.Lesson
	if err := r.db.WithContext(ctx).First(&l, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrLessonNotFound
		}
		return nil, err
	}
	return &l, nil
}

func (r *repository) ListByCourse(ctx context.Context, courseID int) ([]*domain.Lesson, error) {
	var lessons []*domain.Lesson
	if err := r.db.WithContext(ctx).
		Where("course_id = ?", courseID).
		Order("order_num ASC").
		Find(&lessons).Error; err != nil {
		return nil, err
	}
	return lessons, nil
}

func (r *repository) Update(ctx context.Context, lesson *domain.Lesson) error {
	result := r.db.WithContext(ctx).Model(lesson).
		Where("id = ?", lesson.ID).
		Updates(lesson)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return ErrLessonNotFound
	}
	return nil
}

func (r *repository) Delete(ctx context.Context, id int) error {
	result := r.db.WithContext(ctx).Delete(&domain.Lesson{}, id)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return ErrLessonNotFound
	}
	return nil
}

func (r *repository) GetMaxOrderNum(ctx context.Context, courseID int) (int, error) {
	var maxOrder int
	err := r.db.WithContext(ctx).
		Model(&domain.Lesson{}).
		Where("course_id = ?", courseID).
		Select("COALESCE(MAX(order_num), 0)").
		Scan(&maxOrder).Error
	if err != nil {
		return 0, err
	}
	return maxOrder, nil
}

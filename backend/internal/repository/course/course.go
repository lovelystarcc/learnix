package course

import (
	"context"
	"errors"
	"time"

	"gorm.io/gorm"

	"github.com/lovelystarcc/learnix/internal/domain"
	"github.com/lovelystarcc/learnix/internal/usecase"
)

var (
	ErrCourseNotFound = errors.New("course not found")
)

type repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) usecase.CourseRepository {
	return &repository{db: db}
}

func (r *repository) Create(ctx context.Context, course *domain.Course) (*domain.Course, error) {
	if err := r.db.WithContext(ctx).Create(course).Error; err != nil {
		return nil, err
	}
	return course, nil
}

func (r *repository) GetByID(ctx context.Context, id int) (*domain.Course, error) {
	var c domain.Course
	if err := r.db.WithContext(ctx).First(&c, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrCourseNotFound
		}
		return nil, err
	}
	return &c, nil
}

func (r *repository) List(
	ctx context.Context,
	teacherID *int,
	limit,
	offset int) ([]*domain.Course, error) {

	query := r.db.WithContext(ctx).
		Table("courses c").
		Select("c.*, u.full_name as full_name").
		Joins("JOIN teachers t ON c.teacher_id = t.user_id").
		Joins("JOIN users u ON t.user_id = u.id")

	if teacherID != nil {
		query = query.Where("c.teacher_id = ?", *teacherID)
	}

	var courses []*domain.Course
	if err := query.
		Order("c.created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&courses).Error; err != nil {
		return nil, err
	}

	return courses, nil
}

func (r *repository) SoftDelete(ctx context.Context, id int, deletedAt time.Time) error {
	result := r.db.WithContext(ctx).Model(&domain.Course{}).
		Where("id = ?", id).
		Updates(map[string]interface{}{
			"deleted_at": deletedAt,
			"updated_at": time.Now(),
		})
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return ErrCourseNotFound
	}
	return nil
}

func (r *repository) Exists(ctx context.Context, id int) (bool, error) {
	var count int64
	if err := r.db.WithContext(ctx).Model(&domain.Course{}).
		Where("id = ?", id).
		Count(&count).Error; err != nil {
		return false, err
	}
	return count > 0, nil
}

func (r *repository) Update(ctx context.Context, course *domain.Course) error {
	result := r.db.WithContext(ctx).Model(course).
		Where("id = ?", course.ID).
		Updates(course)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return ErrCourseNotFound
	}
	return nil
}

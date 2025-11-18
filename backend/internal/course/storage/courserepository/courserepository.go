package courserepository

import (
	"context"
	"errors"
	"time"

	"gorm.io/gorm"

	"github.com/lovelystarcc/learnix/internal/course/entity"
	"github.com/lovelystarcc/learnix/internal/course/storage"
)

type CourseRepository struct {
	db *gorm.DB
}

func NewCourseRepository(db *gorm.DB) *CourseRepository {
	return &CourseRepository{db: db}
}

func (r *CourseRepository) Create(ctx context.Context, course *entity.Course) (*entity.Course, error) {
	if err := r.db.WithContext(ctx).Create(course).Error; err != nil {
		return nil, err
	}
	return course, nil
}

func (r *CourseRepository) GetByID(ctx context.Context, id int) (*entity.Course, error) {
	var c entity.Course
	if err := r.db.WithContext(ctx).First(&c, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, storage.ErrCourseNotFound
		}
		return nil, err
	}
	return &c, nil
}

func (r *CourseRepository) List(
	ctx context.Context,
	teacherID *int,
	limit,
	offset int) ([]*entity.Course, error) {

	query := r.db.WithContext(ctx).Model(&entity.Course{})

	if teacherID != nil {
		query = query.Where("teacher_id = ?", *teacherID)
	}

	var courses []*entity.Course
	if err := query.
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&courses).Error; err != nil {
		return nil, err
	}

	return courses, nil
}

func (r *CourseRepository) SoftDelete(ctx context.Context, id int, deletedAt time.Time) error {
	result := r.db.WithContext(ctx).Model(&entity.Course{}).
		Where("id = ?", id).
		Updates(map[string]interface{}{
			"deleted_at": deletedAt,
			"updated_at": time.Now(),
		})
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return storage.ErrCourseNotFound
	}
	return nil
}

func (r *CourseRepository) Exists(ctx context.Context, id int) (bool, error) {
	var count int64
	if err := r.db.WithContext(ctx).Model(&entity.Course{}).
		Where("id = ?", id).
		Count(&count).Error; err != nil {
		return false, err
	}
	return count > 0, nil
}

func (r *CourseRepository) Update(ctx context.Context, course *entity.Course) error {
	result := r.db.WithContext(ctx).Model(course).
		Where("id = ?", course.ID).
		Updates(course)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return storage.ErrCourseNotFound
	}
	return nil
}

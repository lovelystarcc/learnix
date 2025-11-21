package course

import (
	"context"
	"errors"
	"time"

	"gorm.io/gorm"
)

var (
	ErrCourseNotFound = errors.New("course not found")
)

type CourseRepository interface {
	Create(ctx context.Context, course *Course) (*Course, error)
	GetByID(ctx context.Context, id int) (*Course, error)
	List(ctx context.Context, teacherID *int, limit, offset int) ([]*Course, error)
	Update(ctx context.Context, course *Course) error
	SoftDelete(ctx context.Context, id int, deletedAt time.Time) error
	Exists(ctx context.Context, id int) (bool, error)
}

type repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) CourseRepository {
	return &repository{db: db}
}

func (r *repository) Create(ctx context.Context, course *Course) (*Course, error) {
	if err := r.db.WithContext(ctx).Create(course).Error; err != nil {
		return nil, err
	}
	return course, nil
}

func (r *repository) GetByID(ctx context.Context, id int) (*Course, error) {
	var c Course
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
	offset int) ([]*Course, error) {

	query := r.db.WithContext(ctx).Model(&Course{})

	if teacherID != nil {
		query = query.Where("teacher_id = ?", *teacherID)
	}

	var courses []*Course
	if err := query.
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&courses).Error; err != nil {
		return nil, err
	}

	return courses, nil
}

func (r *repository) SoftDelete(ctx context.Context, id int, deletedAt time.Time) error {
	result := r.db.WithContext(ctx).Model(&Course{}).
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
	if err := r.db.WithContext(ctx).Model(&Course{}).
		Where("id = ?", id).
		Count(&count).Error; err != nil {
		return false, err
	}
	return count > 0, nil
}

func (r *repository) Update(ctx context.Context, course *Course) error {
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


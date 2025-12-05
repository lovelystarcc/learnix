package teacher

import (
	"context"
	"errors"
	"strings"

	"gorm.io/gorm"

	"github.com/lovelystarcc/learnix/internal/domain"
	"github.com/lovelystarcc/learnix/internal/usecase"
)

var (
	ErrTeacherNotFound      = errors.New("teacher not found")
	ErrTeacherAlreadyExists = errors.New("teacher already exists")
)

type repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) usecase.TeacherRepository {
	return &repository{db: db}
}

func (r *repository) Create(ctx context.Context, teacher *domain.Teacher) (*domain.Teacher, error) {
	exists, err := r.Exists(ctx, teacher.UserID)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, ErrTeacherAlreadyExists
	}

	if err := r.db.WithContext(ctx).Create(teacher).Error; err != nil {
		errStr := err.Error()
		if strings.Contains(errStr, "duplicate key value") || strings.Contains(errStr, "23505") {
			return nil, ErrTeacherAlreadyExists
		}
		return nil, err
	}
	return teacher, nil
}

func (r *repository) GetByID(ctx context.Context, userID int) (*domain.Teacher, error) {
	var t domain.Teacher
	if err := r.db.WithContext(ctx).First(&t, "user_id = ?", userID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrTeacherNotFound
		}
		return nil, err
	}
	return &t, nil
}

func (r *repository) List(ctx context.Context, limit, offset int) ([]*domain.Teacher, error) {
	var teachers []*domain.Teacher
	if err := r.db.WithContext(ctx).
		Table("teachers t").
		Select("t.*, u.full_name as full_name").
		Joins("JOIN users u ON t.user_id = u.id").
		Order("t.created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&teachers).Error; err != nil {
		return nil, err
	}
	return teachers, nil
}

func (r *repository) Update(ctx context.Context, teacher *domain.Teacher) error {
	result := r.db.WithContext(ctx).Model(teacher).
		Where("user_id = ?", teacher.UserID).
		Updates(teacher)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return ErrTeacherNotFound
	}
	return nil
}

func (r *repository) SoftDelete(ctx context.Context, userID int) error {
	result := r.db.WithContext(ctx).Where("user_id = ?", userID).Delete(&domain.Teacher{})
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return ErrTeacherNotFound
	}
	return nil
}

func (r *repository) Exists(ctx context.Context, userID int) (bool, error) {
	var count int64
	if err := r.db.WithContext(ctx).Model(&domain.Teacher{}).
		Where("user_id = ?", userID).
		Count(&count).Error; err != nil {
		return false, err
	}
	return count > 0, nil
}

package teacherrepository

import (
	"context"
	"errors"
	"strings"
	"time"

	"gorm.io/gorm"

	"github.com/lovelystarcc/learnix/internal/teacher/entity"
	"github.com/lovelystarcc/learnix/internal/teacher/storage"
)

type TeacherRepository struct {
	db *gorm.DB
}

func NewTeacherRepository(db *gorm.DB) *TeacherRepository {
	return &TeacherRepository{db: db}
}

func (r *TeacherRepository) Create(ctx context.Context, teacher *entity.Teacher) (*entity.Teacher, error) {
	// Проверяем, существует ли уже преподаватель с таким user_id
	exists, err := r.Exists(ctx, teacher.UserID)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, storage.ErrTeacherAlreadyExists
	}

	// Пытаемся создать запись
	if err := r.db.WithContext(ctx).Create(teacher).Error; err != nil {
		// Дополнительная проверка на случай race condition
		// PostgreSQL ошибка 23505 = unique_violation
		errStr := err.Error()
		if strings.Contains(errStr, "duplicate key value") || strings.Contains(errStr, "23505") {
			return nil, storage.ErrTeacherAlreadyExists
		}
		return nil, err
	}
	return teacher, nil
}

func (r *TeacherRepository) GetByID(ctx context.Context, userID int) (*entity.Teacher, error) {
	var t entity.Teacher
	if err := r.db.WithContext(ctx).First(&t, "user_id = ?", userID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, storage.ErrTeacherNotFound
		}
		return nil, err
	}
	return &t, nil
}

func (r *TeacherRepository) List(ctx context.Context, limit, offset int) ([]*entity.Teacher, error) {
	var teachers []*entity.Teacher
	if err := r.db.WithContext(ctx).
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&teachers).Error; err != nil {
		return nil, err
	}
	return teachers, nil
}

func (r *TeacherRepository) Update(ctx context.Context, teacher *entity.Teacher) error {
	result := r.db.WithContext(ctx).Model(teacher).
		Where("user_id = ?", teacher.UserID).
		Updates(teacher)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return storage.ErrTeacherNotFound
	}
	return nil
}

func (r *TeacherRepository) SoftDelete(ctx context.Context, userID int, deletedAt time.Time) error {
	result := r.db.WithContext(ctx).Model(&entity.Teacher{}).
		Where("user_id = ?", userID).
		Update("updated_at", deletedAt)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return storage.ErrTeacherNotFound
	}
	return nil
}

func (r *TeacherRepository) Exists(ctx context.Context, userID int) (bool, error) {
	var count int64
	if err := r.db.WithContext(ctx).Model(&entity.Teacher{}).
		Where("user_id = ?", userID).
		Count(&count).Error; err != nil {
		return false, err
	}
	return count > 0, nil
}

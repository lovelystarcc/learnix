package user

import (
	"context"
	"errors"
	"strings"

	"gorm.io/gorm"

	"github.com/lovelystarcc/learnix/internal/domain"
	"github.com/lovelystarcc/learnix/internal/usecase"
)

var (
	ErrUserNotFound      = errors.New("user not found")
	ErrUserAlreadyExists = errors.New("user already exists")
)

type repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) usecase.UserRepository {
	return &repository{db: db}
}

func (r *repository) Create(ctx context.Context, user *domain.User) (*domain.User, error) {
	if err := r.db.WithContext(ctx).Create(user).Error; err != nil {
		if strings.Contains(err.Error(), "duplicate key value") || strings.Contains(err.Error(), "23505") {
			return nil, ErrUserAlreadyExists
		}
		return nil, err
	}
	return user, nil
}

func (r *repository) GetByEmail(ctx context.Context, email string) (*domain.User, error) {
	var u domain.User
	if err := r.db.WithContext(ctx).Where("email = ?", email).First(&u).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrUserNotFound
		}
		return nil, err
	}
	return &u, nil
}

func (r *repository) GetByID(ctx context.Context, id int) (*domain.User, error) {
	var u domain.User
	if err := r.db.WithContext(ctx).First(&u, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrUserNotFound
		}
		return nil, err
	}
	return &u, nil
}

func (r *repository) List(ctx context.Context, limit, offset int) ([]*domain.User, error) {
	var users []*domain.User
	if err := r.db.WithContext(ctx).
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&users).Error; err != nil {
		return nil, err
	}
	return users, nil
}

func (r *repository) Update(ctx context.Context, user *domain.User) error {
	result := r.db.WithContext(ctx).Model(user).Updates(user)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return ErrUserNotFound
	}
	return nil
}

func (r *repository) SoftDelete(ctx context.Context, id int) error {
	result := r.db.WithContext(ctx).Where("id = ?", id).Delete(&domain.User{})
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return ErrUserNotFound
	}
	return nil
}

func (r *repository) Exists(ctx context.Context, id int) (bool, error) {
	var count int64
	if err := r.db.WithContext(ctx).Model(&domain.User{}).
		Where("id = ?", id).
		Count(&count).Error; err != nil {
		return false, err
	}
	return count > 0, nil
}

// UpdateRole обновляет роль пользователя по ID
func (r *repository) UpdateRole(ctx context.Context, userID int, role string) error {
	result := r.db.WithContext(ctx).Model(&domain.User{}).
		Where("id = ?", userID).
		Update("role", role)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return ErrUserNotFound
	}
	return nil
}

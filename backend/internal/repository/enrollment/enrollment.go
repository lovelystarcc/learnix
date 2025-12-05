package enrollment

import (
    "context"
    "errors"
    "strings"

    "gorm.io/gorm"

    "github.com/lovelystarcc/learnix/internal/domain"
)

var (
    ErrEnrollmentNotFound      = errors.New("enrollment not found")
    ErrEnrollmentAlreadyExists = errors.New("enrollment already exists")
)

type EnrollmentRepository interface {
    Create(ctx context.Context, enrollment *domain.Enrollment) (*domain.Enrollment, error)
    GetByID(ctx context.Context, id int) (*domain.Enrollment, error)
    ListByStudent(ctx context.Context, studentID int, limit, offset int) ([]*domain.Enrollment, error)
    ListByCourse(ctx context.Context, courseID int, limit, offset int) ([]*domain.Enrollment, error)
    Update(ctx context.Context, enrollment *domain.Enrollment) error
    SoftDelete(ctx context.Context, id int) error
    Exists(ctx context.Context, studentID, courseID int) (bool, error)
}

type repository struct {
    db *gorm.DB
}

func NewRepository(db *gorm.DB) EnrollmentRepository {
    return &repository{db: db}
}

func (r *repository) Create(ctx context.Context, enrollment *domain.Enrollment) (*domain.Enrollment, error) {
    exists, err := r.Exists(ctx, enrollment.StudentID, enrollment.CourseID)
    if err != nil {
        return nil, err
    }
    if exists {
        return nil, ErrEnrollmentAlreadyExists
    }

    if err := r.db.WithContext(ctx).Create(enrollment).Error; err != nil {
        errStr := err.Error()
        if strings.Contains(errStr, "duplicate key value") || strings.Contains(errStr, "23505") {
            return nil, ErrEnrollmentAlreadyExists
        }
        return nil, err
    }
    return enrollment, nil
}

func (r *repository) GetByID(ctx context.Context, id int) (*domain.Enrollment, error) {
    var e domain.Enrollment
    if err := r.db.WithContext(ctx).First(&e, "id = ?", id).Error; err != nil {
        if errors.Is(err, gorm.ErrRecordNotFound) {
            return nil, ErrEnrollmentNotFound
        }
        return nil, err
    }
    return &e, nil
}

func (r *repository) ListByStudent(ctx context.Context, studentID int, limit, offset int) ([]*domain.Enrollment, error) {
    var enrollments []*domain.Enrollment
    if err := r.db.WithContext(ctx).
        Where("student_id = ?", studentID).
        Order("created_at DESC").
        Limit(limit).
        Offset(offset).
        Find(&enrollments).Error; err != nil {
        return nil, err
    }
    return enrollments, nil
}

func (r *repository) ListByCourse(ctx context.Context, courseID int, limit, offset int) ([]*domain.Enrollment, error) {
    var enrollments []*domain.Enrollment
    if err := r.db.WithContext(ctx).
        Where("course_id = ?", courseID).
        Order("created_at DESC").
        Limit(limit).
        Offset(offset).
        Find(&enrollments).Error; err != nil {
        return nil, err
    }
    return enrollments, nil
}

func (r *repository) Update(ctx context.Context, enrollment *domain.Enrollment) error {
    result := r.db.WithContext(ctx).Model(enrollment).
        Where("id = ?", enrollment.ID).
        Updates(enrollment)
    if result.Error != nil {
        return result.Error
    }
    if result.RowsAffected == 0 {
        return ErrEnrollmentNotFound
    }
    return nil
}

func (r *repository) SoftDelete(ctx context.Context, id int) error {
    result := r.db.WithContext(ctx).Where("id = ?", id).Delete(&domain.Enrollment{})
    if result.Error != nil {
        return result.Error
    }
    if result.RowsAffected == 0 {
        return ErrEnrollmentNotFound
    }
    return nil
}

func (r *repository) Exists(ctx context.Context, studentID, courseID int) (bool, error) {
    var count int64
    if err := r.db.WithContext(ctx).Model(&domain.Enrollment{}).
        Where("student_id = ? AND course_id = ?", studentID, courseID).
        Count(&count).Error; err != nil {
        return false, err
    }
    return count > 0, nil
}

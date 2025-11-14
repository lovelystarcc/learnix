package teacherrepository

import (
	"context"
	"database/sql"
	"time"

	_ "github.com/lib/pq"

	"github.com/lovelystarcc/learnix/internal/teacher/entity"
	"github.com/lovelystarcc/learnix/internal/teacher/storage"
)

type TeacherRepository struct {
	db *sql.DB
}

func NewTeacherRepository(db *sql.DB) *TeacherRepository {
	return &TeacherRepository{db: db}
}

func (r *TeacherRepository) Create(ctx context.Context, teacher *entity.Teacher) (*entity.Teacher, error) {
	query := `
        INSERT INTO teachers (
            user_id, bio, specialization, technologies,
            courses_count, students_count, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5,
                  $6, $7, $8)
        RETURNING created_at, updated_at
    `

	err := r.db.QueryRowContext(ctx, query,
		teacher.UserID,
		teacher.Bio,
		teacher.Specialization,
		teacher.Technologies,
		teacher.CoursesCount,
		teacher.StudentsCount,
		teacher.CreatedAt,
		teacher.UpdatedAt,
	).Scan(&teacher.CreatedAt, &teacher.UpdatedAt)

	if err != nil {
		return nil, err
	}

	return teacher, nil
}

func (r *TeacherRepository) GetByID(ctx context.Context, userID int) (*entity.Teacher, error) {
	var t entity.Teacher

	query := `SELECT user_id, bio, specialization, technologies,
                     courses_count, students_count, created_at, updated_at
              FROM teachers WHERE user_id = $1`

	err := r.db.QueryRowContext(ctx, query, userID).Scan(
		&t.UserID,
		&t.Bio,
		&t.Specialization,
		&t.Technologies,
		&t.CoursesCount,
		&t.StudentsCount,
		&t.CreatedAt,
		&t.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, storage.ErrTeacherNotFound
	}
	if err != nil {
		return nil, err
	}

	return &t, nil
}

func (r *TeacherRepository) List(ctx context.Context, limit, offset int) ([]*entity.Teacher, error) {
	query := `SELECT user_id, bio, specialization, technologies,
                     courses_count, students_count, created_at, updated_at
              FROM teachers
              ORDER BY created_at DESC
              LIMIT $1 OFFSET $2`

	rows, err := r.db.QueryContext(ctx, query, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var teachers []*entity.Teacher

	for rows.Next() {
		var t entity.Teacher
		err := rows.Scan(
			&t.UserID,
			&t.Bio,
			&t.Specialization,
			&t.Technologies,
			&t.CoursesCount,
			&t.StudentsCount,
			&t.CreatedAt,
			&t.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		teachers = append(teachers, &t)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return teachers, nil
}

func (r *TeacherRepository) Update(ctx context.Context, teacher *entity.Teacher) error {
	query := `
        UPDATE teachers
        SET bio = $1,
            specialization = $2,
            technologies = $3,
            courses_count = $4,
            students_count = $5,
            updated_at = $6
        WHERE user_id = $7
    `

	res, err := r.db.ExecContext(ctx, query,
		teacher.Bio,
		teacher.Specialization,
		teacher.Technologies,
		teacher.CoursesCount,
		teacher.StudentsCount,
		time.Now(),
		teacher.UserID,
	)
	if err != nil {
		return err
	}

	rowsAffected, err := res.RowsAffected()
	if err != nil {
		return err
	}
	if rowsAffected == 0 {
		return storage.ErrTeacherNotFound
	}

	return nil
}

func (r *TeacherRepository) SoftDelete(ctx context.Context, userID int, deletedAt time.Time) error {
	query := `
        UPDATE teachers
        SET updated_at = $1
        WHERE user_id = $2
    `

	res, err := r.db.ExecContext(ctx, query, deletedAt, userID)
	if err != nil {
		return err
	}

	rowsAffected, err := res.RowsAffected()
	if err != nil {
		return err
	}
	if rowsAffected == 0 {
		return storage.ErrTeacherNotFound
	}

	return nil
}

func (r *TeacherRepository) Exists(ctx context.Context, userID int) (bool, error) {
	query := `SELECT EXISTS(
        SELECT 1 FROM teachers WHERE user_id = $1
    )`

	var exists bool
	err := r.db.QueryRowContext(ctx, query, userID).Scan(&exists)
	if err != nil {
		return false, err
	}

	return exists, nil
}

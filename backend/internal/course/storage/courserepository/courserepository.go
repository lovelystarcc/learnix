package courserepository

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	_ "github.com/lib/pq"

	"github.com/lovelystarcc/learnix/internal/course/entity"
	"github.com/lovelystarcc/learnix/internal/course/storage"
)

type CourseRepository struct {
	db *sql.DB
}

func NewCourseRepository(db *sql.DB) *CourseRepository {
	return &CourseRepository{db: db}
}

func (r *CourseRepository) Create(ctx context.Context, course *entity.Course) error {
	const op = "storage.create"

	query := `
        INSERT INTO courses (
            teacher_id, title, description, status,
            start_date, end_date, deleted_at, created_at, updated_at
        ) VALUES ($1, $2, $3, $4,
                  $5, $6, $7, $8, $9)
        RETURNING id
    `

	// Получаем сгенерированный ID (serial/bigserial)
	err := r.db.QueryRowContext(ctx, query,
		course.TeacherID,
		course.Title,
		course.Description,
		course.Status,
		course.StartDate,
		course.EndDate,
		course.DeletedAt,
		course.CreatedAt,
		course.UpdatedAt,
	).Scan(&course.ID)

	return err
}

func (r *CourseRepository) GetByID(ctx context.Context, id int) (*entity.Course, error) {
	const op = "storage.getbyid"

	var c entity.Course

	query := `SELECT id, teacher_id, title, description, status,
                 start_date, end_date, deleted_at, created_at, updated_at
              FROM courses WHERE id = $1`

	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&c.ID,
		&c.TeacherID,
		&c.Title,
		&c.Description,
		&c.Status,
		&c.StartDate,
		&c.EndDate,
		&c.DeletedAt,
		&c.CreatedAt,
		&c.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, storage.ErrCourseNotFound
	}
	if err != nil {
		return nil, err
	}

	return &c, nil
}

func (r *CourseRepository) List(
	ctx context.Context,
	status string,
	teacherID *int,
	limit,
	offset int) ([]*entity.Course, error) {

	const op = "storage.list"

	query := `SELECT id, teacher_id, title, description, status,
                     start_date, end_date, deleted_at, created_at, updated_at
              FROM courses
              WHERE deleted_at IS NULL`

	args := []interface{}{}
	argPos := 1

	if status != "" {
		query += fmt.Sprintf(" AND status = $%d", argPos)
		args = append(args, status)
		argPos++
	}

	if teacherID != nil {
		query += fmt.Sprintf(" AND teacher_id = $%d", argPos)
		args = append(args, *teacherID)
		argPos++
	}

	query += fmt.Sprintf(" ORDER BY created_at DESC LIMIT $%d OFFSET $%d", argPos, argPos+1)
	args = append(args, limit, offset)

	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var courses []*entity.Course

	for rows.Next() {
		var c entity.Course
		err := rows.Scan(
			&c.ID,
			&c.TeacherID,
			&c.Title,
			&c.Description,
			&c.Status,
			&c.StartDate,
			&c.EndDate,
			&c.DeletedAt,
			&c.CreatedAt,
			&c.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		courses = append(courses, &c)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return courses, nil
}

func (r *CourseRepository) SoftDelete(ctx context.Context, id int, deletedAt time.Time) error {
	const op = "storage.softdelete"

	query := `
        UPDATE courses
        SET deleted_at = $1, updated_at = $2
        WHERE id = $3
    `

	res, err := r.db.ExecContext(ctx, query, deletedAt, time.Now(), id)
	if err != nil {
		return err
	}

	rowsAffected, err := res.RowsAffected()
	if err != nil {
		return err
	}
	if rowsAffected == 0 {
		return storage.ErrCourseNotFound
	}

	return nil
}

func (r *CourseRepository) UpdateStatus(ctx context.Context, id int, status string) error {
	const op = "storage.updatestatus"

	query := `
        UPDATE courses
        SET status = $1, updated_at = $2
        WHERE id = $3 AND deleted_at IS NULL
    `

	res, err := r.db.ExecContext(ctx, query, status, time.Now(), id)
	if err != nil {
		return err
	}

	rowsAffected, err := res.RowsAffected()
	if err != nil {
		return err
	}
	if rowsAffected == 0 {
		return storage.ErrCourseNotFound
	}

	return nil
}

func (r *CourseRepository) Exists(ctx context.Context, id int) (bool, error) {
	const op = "storage.exists"

	query := `SELECT EXISTS(
        SELECT 1 FROM courses WHERE id = $1 AND deleted_at IS NULL
    )`

	var exists bool
	err := r.db.QueryRowContext(ctx, query, id).Scan(&exists)
	if err != nil {
		return false, err
	}

	return exists, nil
}

func (r *CourseRepository) Update(ctx context.Context, course *entity.Course) error {
	const op = "storage.update"

	query := `
        UPDATE courses
        SET teacher_id = $1,
            title = $2,
            description = $3,
            status = $4,
            start_date = $5,
            end_date = $6,
            updated_at = $7
        WHERE id = $8 AND deleted_at IS NULL
    `

	res, err := r.db.ExecContext(ctx, query,
		course.TeacherID,
		course.Title,
		course.Description,
		course.Status,
		course.StartDate,
		course.EndDate,
		time.Now(),
		course.ID,
	)
	if err != nil {
		return err
	}

	rowsAffected, err := res.RowsAffected()
	if err != nil {
		return err
	}
	if rowsAffected == 0 {
		return storage.ErrCourseNotFound
	}

	return nil
}

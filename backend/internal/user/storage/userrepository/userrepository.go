package userrepository

import (
	"context"
	"database/sql"
	"time"

	_ "github.com/lib/pq"

	"github.com/lovelystarcc/learnix/internal/user/entity"
	"github.com/lovelystarcc/learnix/internal/user/storage"
)

type UserRepository struct {
	db *sql.DB
}

func NewUserRepository(db *sql.DB) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) Create(ctx context.Context, user *entity.User) (*entity.User, error) {
	query := `
        INSERT INTO users (
            email, password_hash, full_name, role,
            created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, created_at, updated_at
    `

	err := r.db.QueryRowContext(ctx, query,
		user.Email,
		user.Password,
		user.FullName,
		user.Role,
		user.CreatedAt,
		user.UpdatedAt,
	).Scan(&user.ID, &user.CreatedAt, &user.UpdatedAt)

	if err != nil {
		return nil, err
	}

	return user, nil
}

func (r *UserRepository) GetByEmail(ctx context.Context, email string) (*entity.User, error) {
	var u entity.User

	query := `SELECT id, email, password_hash, full_name, role,
                     created_at, updated_at
              FROM users WHERE email = $1`

	err := r.db.QueryRowContext(ctx, query, email).Scan(
		&u.ID,
		&u.Email,
		&u.Password,
		&u.FullName,
		&u.Role,
		&u.CreatedAt,
		&u.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, storage.ErrUserNotFound
	}
	if err != nil {
		return nil, err
	}

	return &u, nil
}

func (r *UserRepository) GetByID(ctx context.Context, id int) (*entity.User, error) {
	var u entity.User

	query := `SELECT id, email, password_hash, full_name, role,
                     created_at, updated_at
              FROM users WHERE id = $1`

	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&u.ID,
		&u.Email,
		&u.Password,
		&u.FullName,
		&u.Role,
		&u.CreatedAt,
		&u.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, storage.ErrUserNotFound
	}
	if err != nil {
		return nil, err
	}

	return &u, nil
}

func (r *UserRepository) List(ctx context.Context, limit, offset int) ([]*entity.User, error) {
	query := `SELECT id, email, password_hash, full_name, role,
                     created_at, updated_at
              FROM users
              ORDER BY created_at DESC
              LIMIT $1 OFFSET $2`

	rows, err := r.db.QueryContext(ctx, query, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []*entity.User

	for rows.Next() {
		var u entity.User
		err := rows.Scan(
			&u.ID,
			&u.Email,
			&u.Password,
			&u.FullName,
			&u.Role,
			&u.CreatedAt,
			&u.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		users = append(users, &u)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return users, nil
}

func (r *UserRepository) Update(ctx context.Context, user *entity.User) error {
	query := `
        UPDATE users
        SET email = $1,
            password_hash = $2,
            full_name = $3,
            role = $4,
            updated_at = $5
        WHERE id = $6
    `

	res, err := r.db.ExecContext(ctx, query,
		user.Email,
		user.Password,
		user.FullName,
		user.Role,
		time.Now(),
		user.ID,
	)
	if err != nil {
		return err
	}

	rowsAffected, err := res.RowsAffected()
	if err != nil {
		return err
	}
	if rowsAffected == 0 {
		return storage.ErrUserNotFound
	}

	return nil
}

func (r *UserRepository) SoftDelete(ctx context.Context, id int, deletedAt time.Time) error {
	query := `
        UPDATE users
        SET updated_at = $1
        WHERE id = $2
    `

	res, err := r.db.ExecContext(ctx, query, deletedAt, id)
	if err != nil {
		return err
	}

	rowsAffected, err := res.RowsAffected()
	if err != nil {
		return err
	}
	if rowsAffected == 0 {
		return storage.ErrUserNotFound
	}

	return nil
}

func (r *UserRepository) Exists(ctx context.Context, id int) (bool, error) {
	query := `SELECT EXISTS(
        SELECT 1 FROM users WHERE id = $1
    )`

	var exists bool
	err := r.db.QueryRowContext(ctx, query, id).Scan(&exists)
	if err != nil {
		return false, err
	}

	return exists, nil
}

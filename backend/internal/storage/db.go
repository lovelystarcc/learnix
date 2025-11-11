package storage

import (
	"database/sql"
	"fmt"

	_ "github.com/lib/pq"
)

func New(dsn string) (*sql.DB, error) {
	const op = "storage.postgres.New"

	// dsn (Data Source Name) должен быть вида:
	// "postgres://user:password@host:port/dbname?sslmode=disable"
	db, err := sql.Open("postgres", dsn)
	if err != nil {
		return nil, fmt.Errorf("%s: %w", op, err)
	}

	if err = db.Ping(); err != nil {
		return nil, fmt.Errorf("%s: %w", op, err)
	}

	return db, nil
}

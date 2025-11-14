package entity

import "time"

type Teacher struct {
	UserID         int       `json:"user_id"`
	Bio            string    `json:"bio"`
	Description    string    `json:"description"`
	Specialization string    `json:"specialization"`
	Technologies   string    `json:"technologies"`
	CoursesCount   int       `json:"courses_count"`
	StudentsCount  int       `json:"students_count"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

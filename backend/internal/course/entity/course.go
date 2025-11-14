package entity

import (
	"time"
)

type Course struct {
	ID            int        `json:"id"`
	TeacherID     int        `json:"teacher_id"`
	Title         string     `json:"title"`
	Description   string     `json:"description"`
	CourseType    string     `json:"course_type"`
	DurationWeeks int        `json:"duration_weeks"`
	DeletedAt     *time.Time `json:"deleted_at,omitempty"`
	CreatedAt     time.Time  `json:"created_at"`
	UpdatedAt     time.Time  `json:"updated_at"`
}

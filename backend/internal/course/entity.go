package course

import (
	"time"
)

type Course struct {
	ID            int       `gorm:"primaryKey;autoIncrement" json:"id"`
	TeacherID     int       `gorm:"not null;index" json:"teacher_id"`
	Title         string    `gorm:"not null;size:255" json:"title"`
	Description   string    `gorm:"type:text" json:"description"`
	CourseType    string    `gorm:"not null;size:50;index;check:course_type IN ('programming', 'design', 'marketing', 'business')" json:"course_type"`
	DurationWeeks int       `gorm:"not null;check:duration_weeks > 0" json:"duration_weeks"`
	CreatedAt     time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt     time.Time `gorm:"autoUpdateTime" json:"updated_at"`
	DeletedAt     time.Time `gorm:"index" json:"deleted_at"`
}

func (Course) TableName() string {
	return "courses"
}

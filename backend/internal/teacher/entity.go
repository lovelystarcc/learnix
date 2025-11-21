package teacher

import (
	"time"

	"gorm.io/gorm"
)

type Teacher struct {
	UserID         int            `gorm:"primaryKey" json:"user_id"`
	Bio            string         `gorm:"type:text" json:"bio"`
	Specialization string         `gorm:"size:255" json:"specialization"`
	Technologies   string         `gorm:"type:text" json:"technologies"`
	CoursesCount   int            `gorm:"default:0" json:"courses_count"`
	StudentsCount  int            `gorm:"default:0" json:"students_count"`
	CreatedAt      time.Time      `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt      time.Time      `gorm:"autoUpdateTime" json:"updated_at"`
	DeletedAt      gorm.DeletedAt `gorm:"index" json:"deleted_at"`
}

func (Teacher) TableName() string {
	return "teachers"
}

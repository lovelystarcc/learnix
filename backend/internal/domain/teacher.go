package domain

import (
	"fmt"
	"net/http"
	"time"

	"github.com/go-chi/render"
	"gorm.io/gorm"
)

type Teacher struct {
	UserID         int            `gorm:"primaryKey" json:"user_id"`
	Bio            string         `gorm:"type:text" json:"bio"`
	FullName       string         `gorm:"->" json:"full_name"`
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

type TeacherRequest struct {
	Bio            string `json:"bio"`
	Specialization string `json:"specialization"`
	Technologies   string `json:"technologies"`
	UserID         int    `json:"user_id"`
}

func (t *TeacherRequest) Bind(r *http.Request) error {
	if t.Specialization == "" {
		return fmt.Errorf("specialization is required")
	}
	return nil
}

type TeacherResponse struct {
	UserID         int    `json:"user_id"`
	Bio            string `json:"bio"`
	FullName       string `json:"full_name"`
	Specialization string `json:"specialization"`
	Technologies   string `json:"technologies"`
	CoursesCount   int    `json:"courses_count"`
	StudentsCount  int    `json:"students_count"`
	CreatedAt      string `json:"created_at"`
	UpdatedAt      string `json:"updated_at"`
}

func (t *TeacherResponse) Render(w http.ResponseWriter, r *http.Request) error {
	return nil
}

func NewTeacherResponse(t *Teacher) *TeacherResponse {
	return &TeacherResponse{
		UserID:         t.UserID,
		Bio:            t.Bio,
		FullName:       t.FullName,
		Specialization: t.Specialization,
		Technologies:   t.Technologies,
		CoursesCount:   t.CoursesCount,
		StudentsCount:  t.StudentsCount,
		CreatedAt:      t.CreatedAt.Format(time.RFC3339),
		UpdatedAt:      t.UpdatedAt.Format(time.RFC3339),
	}
}

func NewTeacherListResponse(teachers []*Teacher) []render.Renderer {
	list := make([]render.Renderer, len(teachers))
	for i, t := range teachers {
		list[i] = NewTeacherResponse(t)
	}
	return list
}

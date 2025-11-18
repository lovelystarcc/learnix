package dto

import (
	"fmt"
	"net/http"

	"github.com/go-chi/render"
	"github.com/lovelystarcc/learnix/internal/teacher/entity"
)

type TeacherRequest struct {
	Bio            string `json:"bio"`
	Specialization string `json:"specialization"`
	Technologies   string `json:"technologies"`
	UserID         int    `json:"user_id"`
}

func (t *TeacherRequest) Bind(r *http.Request) error {
	// user_id теперь берется из контекста middleware, не проверяем его здесь
	if t.Specialization == "" {
		return fmt.Errorf("specialization is required")
	}
	return nil
}

type TeacherResponse struct {
	UserID         int    `json:"user_id"`
	Bio            string `json:"bio"`
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

func NewTeacherResponse(t *entity.Teacher) *TeacherResponse {
	return &TeacherResponse{
		UserID:         t.UserID,
		Bio:            t.Bio,
		Specialization: t.Specialization,
		Technologies:   t.Technologies,
		CoursesCount:   t.CoursesCount,
		StudentsCount:  t.StudentsCount,
		CreatedAt:      t.CreatedAt.Format("2006-01-02T15:04:05Z"),
		UpdatedAt:      t.UpdatedAt.Format("2006-01-02T15:04:05Z"),
	}
}

func NewTeacherListResponse(teachers []*entity.Teacher) []render.Renderer {
	list := make([]render.Renderer, len(teachers))
	for i, t := range teachers {
		list[i] = NewTeacherResponse(t)
	}
	return list
}

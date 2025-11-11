package dto

import (
	"fmt"
	"net/http"
	"time"

	"github.com/lovelystarcc/learnix/internal/course/entity"

	"github.com/go-chi/render"
)

type CourseRequest struct {
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Status      string    `json:"status"`
	StartDate   time.Time `json:"start_date"`
	EndDate     time.Time `json:"end_date"`
	TeacherID   string    `json:"teacher_id"`
}

func (c *CourseRequest) Bind(r *http.Request) error {
	if c.Title == "" {
		return fmt.Errorf("title is required")
	}
	if c.TeacherID == "" {
		return fmt.Errorf("teacher_id is required")
	}
	if c.StartDate.IsZero() || c.EndDate.IsZero() {
		return fmt.Errorf("start_date and end_date are required")
	}
	return nil
}

type CourseResponse struct {
	ID          int        `json:"id"`
	TeacherID   int        `json:"teacher_id"`
	Title       string     `json:"title"`
	Description string     `json:"description"`
	Status      string     `json:"status"`
	StartDate   time.Time  `json:"start_date"`
	EndDate     time.Time  `json:"end_date"`
	DeletedAt   *time.Time `json:"deleted_at,omitempty"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
}

func (c *CourseResponse) Render(w http.ResponseWriter, r *http.Request) error {
	return nil
}

func NewCourseResponse(c *entity.Course) *CourseResponse {
	return &CourseResponse{
		ID:          c.ID,
		TeacherID:   c.TeacherID,
		Title:       c.Title,
		Description: c.Description,
		Status:      c.Status,
		StartDate:   c.StartDate,
		EndDate:     c.EndDate,
		DeletedAt:   c.DeletedAt,
		CreatedAt:   c.CreatedAt,
		UpdatedAt:   c.UpdatedAt,
	}
}

func NewCourseListResponse(courses []*entity.Course) []render.Renderer {
	list := make([]render.Renderer, len(courses))
	for i, c := range courses {
		list[i] = NewCourseResponse(c)
	}
	return list
}

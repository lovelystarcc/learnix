package dto

import (
	"fmt"
	"net/http"
	"time"

	"github.com/go-chi/render"
	"github.com/lovelystarcc/learnix/internal/course/entity"
)

type CourseRequest struct {
	Title         string `json:"title"`
	Description   string `json:"description"`
	CourseType    string `json:"course_type"`
	DurationWeeks int    `json:"duration_weeks"`
	TeacherID     int    `json:"teacher_id"`
}

func (c *CourseRequest) Bind(r *http.Request) error {
	if c.Title == "" {
		return fmt.Errorf("title is required")
	}
	if c.TeacherID == 0 {
		return fmt.Errorf("teacher_id is required")
	}
	if c.CourseType == "" {
		return fmt.Errorf("course_type is required")
	}
	if c.DurationWeeks <= 0 {
		return fmt.Errorf("duration_weeks must be greater than 0")
	}
	return nil
}

type CourseResponse struct {
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

func (c *CourseResponse) Render(w http.ResponseWriter, r *http.Request) error {
	return nil
}

func NewCourseResponse(c *entity.Course) *CourseResponse {
	return &CourseResponse{
		ID:            c.ID,
		TeacherID:     c.TeacherID,
		Title:         c.Title,
		Description:   c.Description,
		CourseType:    c.CourseType,
		DurationWeeks: c.DurationWeeks,
		DeletedAt:     c.DeletedAt,
		CreatedAt:     c.CreatedAt,
		UpdatedAt:     c.UpdatedAt,
	}
}

func NewCourseListResponse(courses []*entity.Course) []render.Renderer {
	list := make([]render.Renderer, len(courses))
	for i, c := range courses {
		list[i] = NewCourseResponse(c)
	}
	return list
}

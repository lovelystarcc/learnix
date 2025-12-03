package domain

import (
	"fmt"
	"net/http"
	"time"

	"github.com/go-chi/render"
)

type Course struct {
	ID            int       `gorm:"primaryKey;autoIncrement" json:"id"`
	TeacherID     int       `gorm:"not null;index" json:"teacher_id"`
	FullName      string    `gorm:"->" json:"full_name"`
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
	validCourseTypes := map[string]bool{
		"programming": true,
		"design":      true,
		"marketing":   true,
		"business":    true,
	}
	if !validCourseTypes[c.CourseType] {
		return fmt.Errorf("course_type must be one of: programming, design, marketing, business")
	}
	if c.DurationWeeks <= 0 {
		return fmt.Errorf("duration_weeks must be greater than 0")
	}
	return nil
}

type CourseResponse struct {
	ID            int       `json:"id"`
	TeacherID     int       `json:"teacher_id"`
	FullName      string    `json:"full_name"`
	Title         string    `json:"title"`
	Description   string    `json:"description"`
	CourseType    string    `json:"course_type"`
	DurationWeeks int       `json:"duration_weeks"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

func (c *CourseResponse) Render(w http.ResponseWriter, r *http.Request) error {
	return nil
}

func NewCourseResponse(c *Course) *CourseResponse {
	return &CourseResponse{
		ID:            c.ID,
		TeacherID:     c.TeacherID,
		FullName:      c.FullName,
		Title:         c.Title,
		Description:   c.Description,
		CourseType:    c.CourseType,
		DurationWeeks: c.DurationWeeks,
		CreatedAt:     c.CreatedAt,
		UpdatedAt:     c.UpdatedAt,
	}
}

func NewCourseListResponse(courses []*Course) []render.Renderer {
	list := make([]render.Renderer, len(courses))
	for i, c := range courses {
		list[i] = NewCourseResponse(c)
	}
	return list
}

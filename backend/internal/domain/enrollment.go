package domain

import (
	"fmt"
	"net/http"
	"time"

	"github.com/go-chi/render"
	"gorm.io/gorm"
)

type Enrollment struct {
	ID              int            `gorm:"primaryKey;autoIncrement" json:"id"`
	StudentID       int            `gorm:"not null;index:idx_enrollments_student_id;column:student_id" json:"student_id"`
	CourseID        int            `gorm:"not null;index:idx_enrollments_course_id;column:course_id" json:"course_id"`
	Status          string         `gorm:"type:varchar(20);not null;default:'active';check:status IN ('active','completed','cancelled','paused')" json:"status"`
	ProgressPercent int            `gorm:"default:0;check:progress_percent >= 0 AND progress_percent <= 100;column:progress_percent" json:"progress_percent"`
	CreatedAt       time.Time      `gorm:"autoCreateTime;column:created_at" json:"created_at"`
	UpdatedAt       time.Time      `gorm:"autoUpdateTime;column:updated_at" json:"updated_at"`
	CompletedAt     *time.Time     `gorm:"column:completed_at" json:"completed_at,omitempty"`
	DeletedAt       gorm.DeletedAt `gorm:"index;column:deleted_at" json:"deleted_at,omitempty"`
}

func (Enrollment) TableName() string {
	return "enrollments"
}

type EnrollmentRequest struct {
	StudentID int    `json:"student_id"`
	CourseID  int    `json:"course_id"`
	Status    string `json:"status"`
}

func (e *EnrollmentRequest) Bind(r *http.Request) error {
	if e.StudentID == 0 {
		return fmt.Errorf("student_id is required")
	}
	if e.CourseID == 0 {
		return fmt.Errorf("course_id is required")
	}
	validStatuses := map[string]bool{
		"active":    true,
		"completed": true,
		"cancelled": true,
		"paused":    true,
	}
	if e.Status != "" && !validStatuses[e.Status] {
		return fmt.Errorf("status must be one of: active, completed, cancelled, paused")
	}
	return nil
}

type EnrollmentResponse struct {
	ID              int        `json:"id"`
	StudentID       int        `json:"student_id"`
	CourseID        int        `json:"course_id"`
	Status          string     `json:"status"`
	ProgressPercent int        `json:"progress_percent"`
	CreatedAt       time.Time  `json:"created_at"`
	UpdatedAt       time.Time  `json:"updated_at"`
	CompletedAt     *time.Time `json:"completed_at,omitempty"`
}

func (e *EnrollmentResponse) Render(w http.ResponseWriter, r *http.Request) error {
	return nil
}

func NewEnrollmentResponse(e *Enrollment) *EnrollmentResponse {
	return &EnrollmentResponse{
		ID:              e.ID,
		StudentID:       e.StudentID,
		CourseID:        e.CourseID,
		Status:          e.Status,
		ProgressPercent: e.ProgressPercent,
		CreatedAt:       e.CreatedAt,
		UpdatedAt:       e.UpdatedAt,
		CompletedAt:     e.CompletedAt,
	}
}

func NewEnrollmentListResponse(enrollments []*Enrollment) []render.Renderer {
	list := make([]render.Renderer, len(enrollments))
	for i, e := range enrollments {
		list[i] = NewEnrollmentResponse(e)
	}
	return list
}

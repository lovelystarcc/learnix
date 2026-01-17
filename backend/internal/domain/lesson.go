package domain

import (
	"fmt"
	"net/http"
	"time"

	"github.com/go-chi/render"
	"gorm.io/gorm"
)

type Lesson struct {
	ID        int            `gorm:"primaryKey;autoIncrement" json:"id"`
	CourseID  int            `gorm:"not null;index" json:"course_id"`
	Title     string         `gorm:"not null;size:255" json:"title"`
	Content   string         `gorm:"type:text;not null" json:"content"`
	OrderNum  int            `gorm:"not null" json:"order_num"`
	CreatedAt time.Time      `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt time.Time      `gorm:"autoUpdateTime" json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`
}

func (Lesson) TableName() string {
	return "lessons"
}

type LessonRequest struct {
	CourseID int    `json:"course_id"`
	Title    string `json:"title"`
	Content  string `json:"content"`
	OrderNum int    `json:"order_num"`
}

func (l *LessonRequest) Bind(r *http.Request) error {
	if l.CourseID == 0 {
		return fmt.Errorf("course_id is required")
	}
	if l.Title == "" {
		return fmt.Errorf("title is required")
	}
	if l.Content == "" {
		return fmt.Errorf("content is required")
	}
	if l.OrderNum <= 0 {
		return fmt.Errorf("order_num must be greater than 0")
	}
	return nil
}

type LessonResponse struct {
	ID        int       `json:"id"`
	CourseID  int       `json:"course_id"`
	Title     string    `json:"title"`
	Content   string    `json:"content"`
	OrderNum  int       `json:"order_num"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

func (l *LessonResponse) Render(w http.ResponseWriter, r *http.Request) error {
	return nil
}

func NewLessonResponse(l *Lesson) *LessonResponse {
	return &LessonResponse{
		ID:        l.ID,
		CourseID:  l.CourseID,
		Title:     l.Title,
		Content:   l.Content,
		OrderNum:  l.OrderNum,
		CreatedAt: l.CreatedAt,
		UpdatedAt: l.UpdatedAt,
	}
}

func NewLessonListResponse(lessons []*Lesson) []render.Renderer {
	list := make([]render.Renderer, len(lessons))
	for i, l := range lessons {
		list[i] = NewLessonResponse(l)
	}
	return list
}

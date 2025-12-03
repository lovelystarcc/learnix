package api

import (
	"fmt"
	"log/slog"
	"net/http"
	"strconv"

	"github.com/go-chi/render"

	"github.com/lovelystarcc/learnix/internal/domain"
	"github.com/lovelystarcc/learnix/internal/presenter"
	"github.com/lovelystarcc/learnix/internal/usecase"
)

type CourseHandler struct {
	log *slog.Logger
	uc  usecase.CourseUseCase
}

func NewCourseHandler(log *slog.Logger, uc usecase.CourseUseCase) *CourseHandler {
	return &CourseHandler{
		log: log,
		uc:  uc,
	}
}

// POST /course
func (h *CourseHandler) Create(w http.ResponseWriter, r *http.Request) {
	const op = "course.handler.create"
	log := h.log.With(slog.String("op", op))

	var req domain.CourseRequest
	if err := render.DecodeJSON(r.Body, &req); err != nil {
		log.Error("failed to decode request", slog.Any("err", err))
		render.Render(w, r, presenter.NewErrResponse(http.StatusBadRequest,
			fmt.Errorf("failed to decode request: %w", err)))
		return
	}

	if err := req.Bind(r); err != nil {
		log.Error("validation failed", slog.Any("err", err))
		render.Render(w, r, presenter.NewErrResponse(http.StatusBadRequest, err))
		return
	}

	course, err := h.uc.Create(r.Context(), &req)
	if err != nil {
		log.Error("failed to create course", slog.Any("err", err))
		render.Render(w, r, presenter.NewErrResponse(http.StatusInternalServerError, err))
		return
	}

	render.Status(r, http.StatusCreated)
	render.Render(w, r, domain.NewCourseResponse(course))

	log.Info("course created", slog.Int("course_id", course.ID))
}

// GET /course
func (h *CourseHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	const op = "course.handler.getAll"
	log := h.log.With(slog.String("op", op))

	teacherParam := r.URL.Query().Get("teacher_id")

	var teacherID *int
	if teacherParam != "" {
		tid, err := strconv.Atoi(teacherParam)
		if err != nil {
			log.Error("invalid teacher_id", slog.String("teacher_id", teacherParam))
			render.Render(w, r, presenter.NewErrResponse(http.StatusBadRequest,
				fmt.Errorf("invalid teacher_id")))
			return
		}
		teacherID = &tid
	}

	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	if limit == 0 {
		limit = 20
	}
	offset, _ := strconv.Atoi(r.URL.Query().Get("offset"))

	list, err := h.uc.GetAll(r.Context(), teacherID, limit, offset)
	if err != nil {
		log.Error("failed to get courses", slog.Any("err", err))
		render.Render(w, r, presenter.NewErrResponse(http.StatusInternalServerError, err))
		return
	}

	render.Status(r, http.StatusOK)
	render.RenderList(w, r, domain.NewCourseListResponse(list))

	log.Info("courses retrieved",
		slog.Int("count", len(list)),
	)
}

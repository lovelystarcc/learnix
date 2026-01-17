package api

import (
	"fmt"
	"log/slog"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
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

// GET /course/{id}
func (h *CourseHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	const op = "course.handler.getByID"
	log := h.log.With(slog.String("op", op))

	idParam := chi.URLParam(r, "id")
	id, err := strconv.Atoi(idParam)
	if err != nil || id <= 0 {
		log.Error("invalid course id", slog.String("id", idParam))
		render.Render(w, r, presenter.NewErrResponse(http.StatusBadRequest,
			fmt.Errorf("invalid course id")))
		return
	}

	course, err := h.uc.GetByID(r.Context(), id)
	if err != nil {
		log.Error("failed to get course", slog.Any("err", err))
		render.Render(w, r, presenter.NewErrResponse(http.StatusNotFound, err))
		return
	}

	render.Status(r, http.StatusOK)
	render.Render(w, r, domain.NewCourseResponse(course))

	log.Info("course retrieved", slog.Int("course_id", course.ID))
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

// GET /course/search
func (h *CourseHandler) Search(w http.ResponseWriter, r *http.Request) {
	const op = "course.handler.search"
	log := h.log.With(slog.String("op", op))

	query := r.URL.Query().Get("q")
	courseType := r.URL.Query().Get("type")

	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	if limit == 0 {
		limit = 20
	}
	offset, _ := strconv.Atoi(r.URL.Query().Get("offset"))

	list, err := h.uc.Search(r.Context(), query, courseType, limit, offset)
	if err != nil {
		log.Error("failed to search courses", slog.Any("err", err))
		render.Render(w, r, presenter.NewErrResponse(http.StatusInternalServerError, err))
		return
	}

	render.Status(r, http.StatusOK)
	render.RenderList(w, r, domain.NewCourseListResponse(list))

	log.Info("courses search completed",
		slog.String("query", query),
		slog.String("type", courseType),
		slog.Int("count", len(list)),
	)
}

// PUT /course/{id}
func (h *CourseHandler) Update(w http.ResponseWriter, r *http.Request) {
	const op = "course.handler.update"
	log := h.log.With(slog.String("op", op))

	idParam := chi.URLParam(r, "id")
	id, err := strconv.Atoi(idParam)
	if err != nil || id <= 0 {
		log.Error("invalid course id", slog.String("id", idParam))
		render.Render(w, r, presenter.NewErrResponse(http.StatusBadRequest,
			fmt.Errorf("invalid course id")))
		return
	}

	var req domain.CourseRequest
	if err := render.DecodeJSON(r.Body, &req); err != nil {
		log.Error("failed to decode request", slog.Any("err", err))
		render.Render(w, r, presenter.NewErrResponse(http.StatusBadRequest,
			fmt.Errorf("invalid request body")))
		return
	}

	course, err := h.uc.Update(r.Context(), id, &req)
	if err != nil {
		log.Error("failed to update course", slog.Any("err", err))
		render.Render(w, r, presenter.NewErrResponse(http.StatusInternalServerError, err))
		return
	}

	render.Status(r, http.StatusOK)
	render.Render(w, r, domain.NewCourseResponse(course))

	log.Info("course updated", slog.Int("course_id", course.ID))
}

// DELETE /course/{id}
func (h *CourseHandler) Delete(w http.ResponseWriter, r *http.Request) {
	const op = "course.handler.delete"
	log := h.log.With(slog.String("op", op))

	idParam := chi.URLParam(r, "id")
	id, err := strconv.Atoi(idParam)
	if err != nil || id <= 0 {
		log.Error("invalid course id", slog.String("id", idParam))
		render.Render(w, r, presenter.NewErrResponse(http.StatusBadRequest,
			fmt.Errorf("invalid course id")))
		return
	}

	if err := h.uc.Delete(r.Context(), id); err != nil {
		log.Error("failed to delete course", slog.Any("err", err))
		render.Render(w, r, presenter.NewErrResponse(http.StatusInternalServerError, err))
		return
	}

	render.Status(r, http.StatusNoContent)
	w.WriteHeader(http.StatusNoContent)

	log.Info("course deleted", slog.Int("course_id", id))
}

package api

import (
	"fmt"
	"log/slog"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"

	"github.com/lovelystarcc/learnix/internal/domain"
	"github.com/lovelystarcc/learnix/internal/middleware"
	"github.com/lovelystarcc/learnix/internal/presenter"
	"github.com/lovelystarcc/learnix/internal/usecase"
)

type LessonHandler struct {
	log      *slog.Logger
	uc       usecase.LessonUseCase
	courseUC usecase.CourseUseCase
}

func NewLessonHandler(log *slog.Logger, uc usecase.LessonUseCase, courseUC usecase.CourseUseCase) *LessonHandler {
	return &LessonHandler{
		log:      log,
		uc:       uc,
		courseUC: courseUC,
	}
}

// POST /lesson
func (h *LessonHandler) Create(w http.ResponseWriter, r *http.Request) {
	const op = "lesson.handler.create"
	log := h.log.With(slog.String("op", op))

	_, err := middleware.GetUserID(r.Context())
	if err != nil {
		log.Error("unauthorized", slog.Any("err", err))
		render.Render(w, r, presenter.NewErrResponse(http.StatusUnauthorized,
			fmt.Errorf("unauthorized")))
		return
	}

	var req domain.LessonRequest
	if err := render.DecodeJSON(r.Body, &req); err != nil {
		log.Error("failed to decode request", slog.Any("err", err))
		render.Render(w, r, presenter.NewErrResponse(http.StatusBadRequest,
			fmt.Errorf("invalid request body")))
		return
	}

	if err := req.Bind(r); err != nil {
		log.Error("validation failed", slog.Any("err", err))
		render.Render(w, r, presenter.NewErrResponse(http.StatusBadRequest, err))
		return
	}

	lesson, err := h.uc.Create(r.Context(), &req)
	if err != nil {
		log.Error("failed to create lesson", slog.Any("err", err))
		render.Render(w, r, presenter.NewErrResponse(http.StatusInternalServerError, err))
		return
	}

	render.Status(r, http.StatusCreated)
	render.Render(w, r, domain.NewLessonResponse(lesson))

	log.Info("lesson created", slog.Int("lesson_id", lesson.ID))
}

// GET /lesson/{id}
func (h *LessonHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	const op = "lesson.handler.getByID"
	log := h.log.With(slog.String("op", op))

	idParam := chi.URLParam(r, "id")
	id, err := strconv.Atoi(idParam)
	if err != nil || id <= 0 {
		log.Error("invalid lesson id", slog.String("id", idParam))
		render.Render(w, r, presenter.NewErrResponse(http.StatusBadRequest,
			fmt.Errorf("invalid lesson id")))
		return
	}

	lesson, err := h.uc.GetByID(r.Context(), id)
	if err != nil {
		log.Error("failed to get lesson", slog.Any("err", err))
		render.Render(w, r, presenter.NewErrResponse(http.StatusNotFound, err))
		return
	}

	render.Status(r, http.StatusOK)
	render.Render(w, r, domain.NewLessonResponse(lesson))

	log.Info("lesson retrieved", slog.Int("lesson_id", lesson.ID))
}

// GET /course/{id}/lessons
func (h *LessonHandler) GetByCourse(w http.ResponseWriter, r *http.Request) {
	const op = "lesson.handler.getByCourse"
	log := h.log.With(slog.String("op", op))

	idParam := chi.URLParam(r, "id")
	courseID, err := strconv.Atoi(idParam)
	if err != nil || courseID <= 0 {
		log.Error("invalid course id", slog.String("id", idParam))
		render.Render(w, r, presenter.NewErrResponse(http.StatusBadRequest,
			fmt.Errorf("invalid course id")))
		return
	}

	lessons, err := h.uc.GetByCourse(r.Context(), courseID)
	if err != nil {
		log.Error("failed to get lessons", slog.Any("err", err))
		render.Render(w, r, presenter.NewErrResponse(http.StatusInternalServerError, err))
		return
	}

	render.Status(r, http.StatusOK)
	render.RenderList(w, r, domain.NewLessonListResponse(lessons))

	log.Info("lessons retrieved", slog.Int("course_id", courseID), slog.Int("count", len(lessons)))
}

// PUT /lesson/{id}
func (h *LessonHandler) Update(w http.ResponseWriter, r *http.Request) {
	const op = "lesson.handler.update"
	log := h.log.With(slog.String("op", op))

	_, err := middleware.GetUserID(r.Context())
	if err != nil {
		log.Error("unauthorized", slog.Any("err", err))
		render.Render(w, r, presenter.NewErrResponse(http.StatusUnauthorized,
			fmt.Errorf("unauthorized")))
		return
	}

	idParam := chi.URLParam(r, "id")
	id, err := strconv.Atoi(idParam)
	if err != nil || id <= 0 {
		log.Error("invalid lesson id", slog.String("id", idParam))
		render.Render(w, r, presenter.NewErrResponse(http.StatusBadRequest,
			fmt.Errorf("invalid lesson id")))
		return
	}

	var req domain.LessonRequest
	if err := render.DecodeJSON(r.Body, &req); err != nil {
		log.Error("failed to decode request", slog.Any("err", err))
		render.Render(w, r, presenter.NewErrResponse(http.StatusBadRequest,
			fmt.Errorf("invalid request body")))
		return
	}

	lesson, err := h.uc.Update(r.Context(), id, &req)
	if err != nil {
		log.Error("failed to update lesson", slog.Any("err", err))
		render.Render(w, r, presenter.NewErrResponse(http.StatusInternalServerError, err))
		return
	}

	render.Status(r, http.StatusOK)
	render.Render(w, r, domain.NewLessonResponse(lesson))

	log.Info("lesson updated", slog.Int("lesson_id", lesson.ID))
}

// DELETE /lesson/{id}
func (h *LessonHandler) Delete(w http.ResponseWriter, r *http.Request) {
	const op = "lesson.handler.delete"
	log := h.log.With(slog.String("op", op))

	_, err := middleware.GetUserID(r.Context())
	if err != nil {
		log.Error("unauthorized", slog.Any("err", err))
		render.Render(w, r, presenter.NewErrResponse(http.StatusUnauthorized,
			fmt.Errorf("unauthorized")))
		return
	}

	idParam := chi.URLParam(r, "id")
	id, err := strconv.Atoi(idParam)
	if err != nil || id <= 0 {
		log.Error("invalid lesson id", slog.String("id", idParam))
		render.Render(w, r, presenter.NewErrResponse(http.StatusBadRequest,
			fmt.Errorf("invalid lesson id")))
		return
	}

	if err := h.uc.Delete(r.Context(), id); err != nil {
		log.Error("failed to delete lesson", slog.Any("err", err))
		render.Render(w, r, presenter.NewErrResponse(http.StatusInternalServerError, err))
		return
	}

	render.Status(r, http.StatusNoContent)
	w.WriteHeader(http.StatusNoContent)

	log.Info("lesson deleted", slog.Int("lesson_id", id))
}

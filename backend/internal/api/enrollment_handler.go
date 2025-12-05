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

type EnrollmentHandler struct {
	log *slog.Logger
	uc  usecase.EnrollmentUseCase
}

func NewEnrollmentHandler(log *slog.Logger, uc usecase.EnrollmentUseCase) *EnrollmentHandler {
	return &EnrollmentHandler{
		log: log,
		uc:  uc,
	}
}

// POST /enrollments
func (h *EnrollmentHandler) Enroll(w http.ResponseWriter, r *http.Request) {
	const op = "enrollment.handler.enroll"
	log := h.log.With(slog.String("op", op))

	var req domain.EnrollmentRequest
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

	enrollment, err := h.uc.Enroll(r.Context(), &req)
	if err != nil {
		log.Error("failed to create enrollment", slog.Any("err", err))
		render.Render(w, r, presenter.NewErrResponse(http.StatusInternalServerError, err))
		return
	}

	render.Status(r, http.StatusCreated)
	render.Render(w, r, domain.NewEnrollmentResponse(enrollment))

	log.Info("enrollment created", slog.Int("enrollment_id", enrollment.ID))
}

// GET /enrollments/{id}
func (h *EnrollmentHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	const op = "enrollment.handler.getByID"
	log := h.log.With(slog.String("op", op))

	idParam := r.URL.Query().Get("id")
	id, err := strconv.Atoi(idParam)
	if err != nil || id <= 0 {
		log.Error("invalid enrollment id", slog.String("id", idParam))
		render.Render(w, r, presenter.NewErrResponse(http.StatusBadRequest,
			fmt.Errorf("invalid enrollment id")))
		return
	}

	enrollment, err := h.uc.GetByID(r.Context(), id)
	if err != nil {
		log.Error("failed to get enrollment", slog.Any("err", err))
		render.Render(w, r, presenter.NewErrResponse(http.StatusNotFound, err))
		return
	}

	render.Status(r, http.StatusOK)
	render.Render(w, r, domain.NewEnrollmentResponse(enrollment))

	log.Info("enrollment retrieved", slog.Int("enrollment_id", enrollment.ID))
}

// GET /enrollments?student_id=...&course_id=...
func (h *EnrollmentHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	const op = "enrollment.handler.getAll"
	log := h.log.With(slog.String("op", op))

	studentParam := r.URL.Query().Get("student_id")
	courseParam := r.URL.Query().Get("course_id")

	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	if limit == 0 {
		limit = 20
	}
	offset, _ := strconv.Atoi(r.URL.Query().Get("offset"))

	if studentParam != "" {
		studentID, err := strconv.Atoi(studentParam)
		if err != nil {
			log.Error("invalid student_id", slog.String("student_id", studentParam))
			render.Render(w, r, presenter.NewErrResponse(http.StatusBadRequest,
				fmt.Errorf("invalid student_id")))
			return
		}
		list, err := h.uc.GetByStudent(r.Context(), studentID, limit, offset)
		if err != nil {
			log.Error("failed to get enrollments by student", slog.Any("err", err))
			render.Render(w, r, presenter.NewErrResponse(http.StatusInternalServerError, err))
			return
		}
		render.Status(r, http.StatusOK)
		render.RenderList(w, r, domain.NewEnrollmentListResponse(list))

		log.Info("enrollments retrieved by student",
			slog.Int("student_id", studentID),
			slog.Int("count", len(list)),
		)
		return
	}

	if courseParam != "" {
		courseID, err := strconv.Atoi(courseParam)
		if err != nil {
			log.Error("invalid course_id", slog.String("course_id", courseParam))
			render.Render(w, r, presenter.NewErrResponse(http.StatusBadRequest,
				fmt.Errorf("invalid course_id")))
			return
		}
		list, err := h.uc.GetByCourse(r.Context(), courseID, limit, offset)
		if err != nil {
			log.Error("failed to get enrollments by course", slog.Any("err", err))
			render.Render(w, r, presenter.NewErrResponse(http.StatusInternalServerError, err))
			return
		}
		render.Status(r, http.StatusOK)
		render.RenderList(w, r, domain.NewEnrollmentListResponse(list))

		log.Info("enrollments retrieved by course",
			slog.Int("course_id", courseID),
			slog.Int("count", len(list)),
		)
		return
	}

	render.Render(w, r, presenter.NewErrResponse(http.StatusBadRequest,
		fmt.Errorf("either student_id or course_id must be provided")))

	log.Warn("no filter provided for enrollments")
}

package api

import (
	"errors"
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

type TeacherHandler struct {
	log *slog.Logger
	uc  usecase.TeacherUseCase
}

func NewTeacherHandler(log *slog.Logger, uc usecase.TeacherUseCase) *TeacherHandler {
	return &TeacherHandler{
		log: log,
		uc:  uc,
	}
}

// POST /teacher
func (h *TeacherHandler) Create(w http.ResponseWriter, r *http.Request) {
	const op = "teacher.handler.create"
	log := h.log.With(slog.String("op", op))

	userID, err := middleware.GetUserID(r.Context())
	if err != nil {
		log.Error("failed to get user id", slog.Any("err", err))
		render.Render(w, r, presenter.NewErrResponse(http.StatusUnauthorized,
			fmt.Errorf("failed to get user id: %w", err)))
		return
	}

	var req domain.TeacherRequest
	if err := render.DecodeJSON(r.Body, &req); err != nil {
		log.Error("failed to decode request", slog.Any("err", err))
		render.Render(w, r, presenter.NewErrResponse(http.StatusBadRequest,
			fmt.Errorf("failed to decode request: %w", err)))
		return
	}
	req.UserID = userID

	if err := req.Bind(r); err != nil {
		log.Error("validation failed", slog.Any("err", err))
		render.Render(w, r, presenter.NewErrResponse(http.StatusBadRequest, err))
		return
	}

	teacher, err := h.uc.Create(r.Context(), &req)
	if err != nil {
		if errors.Is(err, usecase.ErrTeacherAlreadyExists) {
			log.Warn("teacher already exists", slog.Int("user_id", userID))
			render.Render(w, r, presenter.NewErrResponse(http.StatusConflict,
				fmt.Errorf("you are already registered as a teacher")))
			return
		}
		log.Error("failed to create teacher", slog.Any("err", err))
		render.Render(w, r, presenter.NewErrResponse(http.StatusInternalServerError, err))
		return
	}

	render.Status(r, http.StatusCreated)
	render.Render(w, r, domain.NewTeacherResponse(teacher))

	log.Info("teacher created", slog.Int("user_id", teacher.UserID))
}

// GET /teacher/{id}
func (h *TeacherHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	const op = "teacher.handler.getByID"
	log := h.log.With(slog.String("op", op))

	idParam := chi.URLParam(r, "id")
	id, err := strconv.Atoi(idParam)
	if err != nil || id <= 0 {
		log.Error("invalid teacher id", slog.String("id", idParam))
		render.Render(w, r, presenter.NewErrResponse(http.StatusBadRequest,
			fmt.Errorf("invalid teacher id")))
		return
	}

	teacher, err := h.uc.GetByID(r.Context(), id)
	if err != nil {
		log.Error("failed to get teacher", slog.Any("err", err))
		render.Render(w, r, presenter.NewErrResponse(http.StatusNotFound,
			fmt.Errorf("teacher not found")))
		return
	}

	render.Status(r, http.StatusOK)
	render.Render(w, r, domain.NewTeacherResponse(teacher))

	log.Info("teacher retrieved", slog.Int("user_id", teacher.UserID))
}

// GET /teacher
func (h *TeacherHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	const op = "teacher.handler.getAll"
	log := h.log.With(slog.String("op", op))

	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	if limit == 0 {
		limit = 20
	}
	offset, _ := strconv.Atoi(r.URL.Query().Get("offset"))

	list, err := h.uc.GetAll(r.Context(), limit, offset)
	if err != nil {
		log.Error("failed to get teachers", slog.Any("err", err))
		render.Render(w, r, presenter.NewErrResponse(http.StatusInternalServerError, err))
		return
	}

	render.Status(r, http.StatusOK)
	render.RenderList(w, r, domain.NewTeacherListResponse(list))

	log.Info("teachers retrieved",
		slog.Int("count", len(list)),
	)
}

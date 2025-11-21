package teacher

import (
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"strconv"
	"time"

	"github.com/go-chi/render"

	"github.com/lovelystarcc/learnix/internal/api"
	"github.com/lovelystarcc/learnix/internal/middleware"
)

type Handler struct {
	log     *slog.Logger
	storage TeacherRepository
}

func NewHandler(log *slog.Logger, storage TeacherRepository) *Handler {
	return &Handler{
		log:     log,
		storage: storage,
	}
}

func (h *Handler) Create(w http.ResponseWriter, r *http.Request) {
	const op = "teacher.handler.create"
	log := h.log.With(slog.String("op", op))

	userID, err := middleware.GetUserID(r.Context())
	if err != nil {
		log.Error("failed to get user id", slog.Any("err", err))
		render.Render(w, r, api.NewErrResponse(http.StatusUnauthorized,
			fmt.Errorf("failed to get user id: %w", err)))
		return
	}

	var req TeacherRequest
	if err := render.DecodeJSON(r.Body, &req); err != nil {
		log.Error("failed to decode request", slog.Any("err", err))
		render.Render(w, r, api.NewErrResponse(http.StatusBadRequest,
			fmt.Errorf("failed to decode request: %w", err)))
		return
	}

	req.UserID = userID

	if err := req.Bind(r); err != nil {
		log.Error("validation failed", slog.Any("err", err))
		render.Render(w, r, api.NewErrResponse(http.StatusBadRequest, err))
		return
	}

	teacher := &Teacher{
		UserID:         req.UserID,
		Bio:            req.Bio,
		Specialization: req.Specialization,
		Technologies:   req.Technologies,
		CoursesCount:   0,
		StudentsCount:  0,
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
	}

	created, err := h.storage.Create(r.Context(), teacher)
	if err != nil {
		if errors.Is(err, ErrTeacherAlreadyExists) {
			log.Warn("teacher already exists", slog.Int("user_id", userID))
			render.Render(w, r, api.NewErrResponse(http.StatusConflict,
				fmt.Errorf("you are already registered as a teacher")))
			return
		}
		log.Error("failed to create teacher", slog.Any("err", err))
		render.Render(w, r, api.NewErrResponse(http.StatusInternalServerError, err))
		return
	}

	render.Status(r, http.StatusCreated)
	render.Render(w, r, NewTeacherResponse(created))

	log.Info("teacher created", slog.Int("user_id", created.UserID))
}

func (h *Handler) GetAll(w http.ResponseWriter, r *http.Request) {
	const op = "teacher.handler.getAll"
	log := h.log.With(slog.String("op", op))

	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	if limit == 0 {
		limit = 20
	}
	offset, _ := strconv.Atoi(r.URL.Query().Get("offset"))

	list, err := h.storage.List(r.Context(), limit, offset)
	if err != nil {
		log.Error("failed to get teachers", slog.Any("err", err))
		render.Render(w, r, api.NewErrResponse(http.StatusInternalServerError, err))
		return
	}

	render.Status(r, http.StatusOK)
	render.RenderList(w, r, NewTeacherListResponse(list))

	log.Info("teachers retrieved",
		slog.Int("count", len(list)),
	)
}


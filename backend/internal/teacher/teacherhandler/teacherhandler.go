package teacherhandler

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
	"github.com/lovelystarcc/learnix/internal/teacher/dto"
	"github.com/lovelystarcc/learnix/internal/teacher/entity"
	"github.com/lovelystarcc/learnix/internal/teacher/storage"
)

type Handler struct {
	log     *slog.Logger
	storage storage.TeacherRepository
}

func NewHandler(log *slog.Logger, storage storage.TeacherRepository) *Handler {
	return &Handler{
		log:     log,
		storage: storage,
	}
}

func (h *Handler) Create(w http.ResponseWriter, r *http.Request) {
	const op = "teacher.handler.create"
	log := h.log.With(slog.String("op", op))

	uidVal := r.Context().Value(middleware.UserIDKey)
	if uidVal == nil {
		log.Error("no user id in context")
		render.Render(w, r, api.NewErrResponse(http.StatusUnauthorized, fmt.Errorf("unauthorized")))
		return
	}

	userID, ok := uidVal.(int)
	if !ok {
		log.Error("invalid user id type")
		render.Render(w, r, api.NewErrResponse(http.StatusUnauthorized, fmt.Errorf("unauthorized")))
		return
	}

	var req dto.TeacherRequest
	if err := render.DecodeJSON(r.Body, &req); err != nil {
		log.Error("failed to decode request", slog.Any("err", err))
		render.Render(w, r, api.NewErrResponse(http.StatusBadRequest, fmt.Errorf("invalid request body")))
		return
	}

	req.UserID = userID

	if err := req.Bind(r); err != nil {
		log.Error("validation failed", slog.Any("err", err))
		render.Render(w, r, api.NewErrResponse(http.StatusBadRequest, err))
		return
	}

	teacher := &entity.Teacher{
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
		if errors.Is(err, storage.ErrTeacherAlreadyExists) {
			log.Warn("teacher already exists", slog.Int("user_id", userID))
			render.Render(w, r, api.NewErrResponse(http.StatusConflict, fmt.Errorf("вы уже зарегистрированы как преподаватель")))
			return
		}
		log.Error("failed to create teacher", slog.Any("err", err))
		render.Render(w, r, api.NewErrResponse(http.StatusInternalServerError, err))
		return
	}

	render.Status(r, http.StatusCreated)
	render.Render(w, r, dto.NewTeacherResponse(created))

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
	render.RenderList(w, r, dto.NewTeacherListResponse(list))

	log.Info("teachers retrieved",
		slog.Int("count", len(list)),
	)
}

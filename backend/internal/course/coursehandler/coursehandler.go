package coursehandler

import (
	"fmt"
	"log/slog"
	"net/http"
	"strconv"

	"github.com/go-chi/render"

	"github.com/lovelystarcc/learnix/internal/api"
	"github.com/lovelystarcc/learnix/internal/course/dto"
	"github.com/lovelystarcc/learnix/internal/course/storage"
)

type Handler struct {
	log     *slog.Logger
	storage storage.CourseRepository
}

func NewHandler(log *slog.Logger, storage storage.CourseRepository) *Handler {
	return &Handler{
		log:     log,
		storage: storage,
	}
}

func (h *Handler) GetAll(w http.ResponseWriter, r *http.Request) {
	const op = "course.handler.getAll"
	log := h.log.With(slog.String("op", op))

	status := r.URL.Query().Get("status")
	teacherParam := r.URL.Query().Get("teacher_id")

	var teacherID *int
	if teacherParam != "" {
		tid, err := strconv.Atoi(teacherParam)
		if err != nil {
			log.Error("invalid teacher_id", slog.String("teacher_id", teacherParam))
			render.Render(w, r, api.NewErrResponse(http.StatusBadRequest, fmt.Errorf("invalid teacher_id")))
			return
		}
		teacherID = &tid
	}

	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	if limit == 0 {
		limit = 20
	}
	offset, _ := strconv.Atoi(r.URL.Query().Get("offset"))

	list, err := h.storage.List(r.Context(), status, teacherID, limit, offset)
	if err != nil {
		log.Error("failed to get courses", slog.Any("err", err))
		render.Render(w, r, api.NewErrResponse(http.StatusInternalServerError, err))
		return
	}

	render.Status(r, http.StatusOK)
	render.RenderList(w, r, dto.NewCourseListResponse(list))

	log.Info("courses retrieved",
		slog.Int("count", len(list)),
		slog.String("status", status),
	)
}

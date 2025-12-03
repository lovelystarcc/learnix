package api

import (
	"fmt"
	"log/slog"
	"net/http"
	"strconv"

	"github.com/go-chi/render"
	"github.com/lovelystarcc/learnix/internal/domain"
	"github.com/lovelystarcc/learnix/internal/middleware"
	"github.com/lovelystarcc/learnix/internal/presenter"
	"github.com/lovelystarcc/learnix/internal/usecase"
)

type UserHandler struct {
	log *slog.Logger
	uc  usecase.UserUseCase
}

func NewUserHandler(log *slog.Logger, uc usecase.UserUseCase) *UserHandler {
	return &UserHandler{log: log, uc: uc}
}

// POST /user/register
func (h *UserHandler) Register(w http.ResponseWriter, r *http.Request) {
	const op = "user.handler.register"
	log := h.log.With(slog.String("op", op))

	var req domain.UserRequest
	if err := render.DecodeJSON(r.Body, &req); err != nil {
		log.Error("failed to decode request", slog.Any("err", err))
		render.Render(w, r, presenter.NewErrResponse(http.StatusBadRequest, fmt.Errorf("invalid request body")))
		return
	}

	if err := req.Bind(r); err != nil {
		log.Error("validation failed", slog.Any("err", err))
		render.Render(w, r, presenter.NewErrResponse(http.StatusBadRequest, err))
		return
	}

	user, err := h.uc.Register(r.Context(), &req)
	if err != nil {
		log.Error("failed to register user", slog.Any("err", err))
		render.Render(w, r, presenter.NewErrResponse(http.StatusInternalServerError, err))
		return
	}

	render.Status(r, http.StatusCreated)
	render.Render(w, r, domain.NewUserResponse(user))

	log.Info("user registered", slog.Int("user_id", user.ID))
}

// POST /user/login
func (h *UserHandler) Login(w http.ResponseWriter, r *http.Request) {
	const op = "user.handler.login"
	log := h.log.With(slog.String("op", op))

	var req domain.UserLoginRequest
	if err := render.DecodeJSON(r.Body, &req); err != nil {
		log.Error("failed to decode login request", slog.Any("err", err))
		render.Render(w, r, presenter.NewErrResponse(http.StatusBadRequest, err))
		return
	}

	token, user, err := h.uc.Login(r.Context(), &req)
	if err != nil {
		log.Error("login failed", slog.Any("err", err))
		render.Render(w, r, presenter.NewErrResponse(http.StatusUnauthorized, fmt.Errorf("invalid credentials")))
		return
	}

	render.Status(r, http.StatusOK)
	render.Render(w, r, domain.NewUserLoginResponse(user.Email, user.FullName, token))

	log.Info("user logged in", slog.String("email", req.Email))
}

// GET /user/me
func (h *UserHandler) Me(w http.ResponseWriter, r *http.Request) {
	const op = "user.handler.me"
	log := h.log.With(slog.String("op", op))

	uid, err := middleware.GetUserID(r.Context())
	if err != nil {
		log.Error("failed to get user id", slog.Any("err", err))
		render.Render(w, r, presenter.NewErrResponse(http.StatusUnauthorized, fmt.Errorf("unauthorized")))
		return
	}

	user, err := h.uc.GetMe(r.Context(), uid)
	if user == nil || err != nil {
		log.Error("user not found", slog.Int("user_id", uid))
		render.Render(w, r, presenter.NewErrResponse(http.StatusNotFound, fmt.Errorf("user not found")))
		return
	}

	render.Status(r, http.StatusOK)
	render.Render(w, r, domain.NewUserResponse(user))

	log.Info("current user retrieved", slog.Int("user_id", uid))
}

// GET /user
func (h *UserHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	const op = "user.handler.getAll"
	log := h.log.With(slog.String("op", op))

	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	if limit == 0 {
		limit = 20
	}
	offset, _ := strconv.Atoi(r.URL.Query().Get("offset"))

	list, err := h.uc.GetAll(r.Context(), limit, offset)
	if err != nil {
		log.Error("failed to get users", slog.Any("err", err))
		render.Render(w, r, presenter.NewErrResponse(http.StatusInternalServerError, err))
		return
	}

	render.Status(r, http.StatusOK)
	render.RenderList(w, r, domain.NewUserListResponse(list))

	log.Info("users retrieved", slog.Int("count", len(list)))
}

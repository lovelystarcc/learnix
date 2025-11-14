package userhandler

import (
	"fmt"
	"log/slog"
	"net/http"
	"strconv"
	"time"

	"github.com/go-chi/render"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"

	"github.com/lovelystarcc/learnix/internal/api"
	"github.com/lovelystarcc/learnix/internal/middleware"
	"github.com/lovelystarcc/learnix/internal/user/dto"
	"github.com/lovelystarcc/learnix/internal/user/entity"

	"github.com/lovelystarcc/learnix/internal/user/storage"
)

type Handler struct {
	log     *slog.Logger
	storage storage.UserRepository
	secret  []byte
}

func NewHandler(log *slog.Logger, storage storage.UserRepository, secret []byte) *Handler {
	return &Handler{
		log:     log,
		storage: storage,
		secret:  secret,
	}
}

func (h *Handler) Register(w http.ResponseWriter, r *http.Request) {
	const op = "user.handler.register"
	log := h.log.With(slog.String("op", op))

	var req dto.UserRequest
	if err := render.DecodeJSON(r.Body, &req); err != nil {
		log.Error("failed to decode request", slog.Any("err", err))
		render.Render(w, r, api.NewErrResponse(http.StatusBadRequest, fmt.Errorf("invalid request body")))
		return
	}

	if err := req.Bind(r); err != nil {
		log.Error("validation failed", slog.Any("err", err))
		render.Render(w, r, api.NewErrResponse(http.StatusBadRequest, err))
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		log.Error("failed to hash password", slog.Any("err", err))
		render.Render(w, r, api.NewErrResponse(http.StatusInternalServerError, fmt.Errorf("failed to hash password")))
		return
	}

	user := &entity.User{
		Email:     req.Email,
		Password:  string(hashedPassword),
		FullName:  req.FullName,
		Role:      req.Role,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	created, err := h.storage.Create(r.Context(), user)
	if err != nil {
		log.Error("failed to create user", slog.Any("err", err))
		render.Render(w, r, api.NewErrResponse(http.StatusInternalServerError, err))
		return
	}

	render.Status(r, http.StatusCreated)
	render.Render(w, r, dto.NewUserResponse(created))

	log.Info("user created", slog.Int("user_id", created.ID))
}

func (h *Handler) Login(w http.ResponseWriter, r *http.Request) {
	const op = "auth.handler.login"
	log := h.log.With(slog.String("op", op))

	var req dto.LoginRequest
	if err := render.Bind(r, &req); err != nil {
		log.Error("invalid request", slog.Any("err", err))
		render.Render(w, r, api.NewErrResponse(http.StatusBadRequest, err))
		return
	}

	user, err := h.storage.GetByEmail(r.Context(), req.Email)
	if err != nil {
		log.Error("user not found", slog.Any("err", err))
		render.Render(w, r, api.NewErrResponse(http.StatusUnauthorized, fmt.Errorf("invalid credentials")))
		return
	}

	if bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)) != nil {
		log.Error("invalid password")
		render.Render(w, r, api.NewErrResponse(http.StatusUnauthorized, fmt.Errorf("invalid credentials")))
		return
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub": strconv.Itoa(user.ID),
		"exp": time.Now().Add(24 * time.Hour).Unix(),
	})

	tokenStr, err := token.SignedString(h.secret)
	if err != nil {
		log.Error("failed to sign token", slog.Any("err", err))
		render.Render(w, r, api.NewErrResponse(http.StatusInternalServerError, err))
		return
	}

	render.Status(r, http.StatusOK)
	render.Render(w, r, dto.NewLoginResponse(user.Email, user.FullName, tokenStr))

	log.Info("user logged in", slog.Int("user_id", user.ID))
}

func (h *Handler) GetAll(w http.ResponseWriter, r *http.Request) {
	const op = "user.handler.getAll"
	log := h.log.With(slog.String("op", op))

	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	if limit == 0 {
		limit = 20
	}
	offset, _ := strconv.Atoi(r.URL.Query().Get("offset"))

	list, err := h.storage.List(r.Context(), limit, offset)
	if err != nil {
		log.Error("failed to get users", slog.Any("err", err))
		render.Render(w, r, api.NewErrResponse(http.StatusInternalServerError, err))
		return
	}

	render.Status(r, http.StatusOK)
	render.RenderList(w, r, dto.NewUserListResponse(list))

	log.Info("users retrieved", slog.Int("count", len(list)))
}

func (h *Handler) Me(w http.ResponseWriter, r *http.Request) {
	const op = "user.handler.me"
	log := h.log.With(slog.String("op", op))

	uidVal := r.Context().Value(middleware.UserIDKey)
	if uidVal == nil {
		log.Error("no user id in context")
		render.Render(w, r, api.NewErrResponse(http.StatusUnauthorized, fmt.Errorf("unauthorized")))
		return
	}

	uid, ok := uidVal.(int)
	if !ok {
		log.Error("invalid user id type")
		render.Render(w, r, api.NewErrResponse(http.StatusUnauthorized, fmt.Errorf("unauthorized")))
		return
	}

	user, err := h.storage.GetByID(r.Context(), uid)
	if err != nil {
		log.Error("failed to get user", slog.Any("err", err))
		render.Render(w, r, api.NewErrResponse(http.StatusInternalServerError, err))
		return
	}

	render.Status(r, http.StatusOK)
	render.Render(w, r, dto.NewUserResponse(user))

	log.Info("current user retrieved", slog.Int("user_id", user.ID))
}

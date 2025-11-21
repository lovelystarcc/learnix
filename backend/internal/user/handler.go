package user

import (
	"errors"
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
)

type Handler struct {
	log        *slog.Logger
	storage    UserRepository
	secret     []byte
	expiration time.Duration
}

func NewHandler(log *slog.Logger, storage UserRepository, secret []byte, expiration time.Duration) *Handler {
	return &Handler{
		log:        log,
		storage:    storage,
		secret:     secret,
		expiration: expiration,
	}
}

func (h *Handler) Register(w http.ResponseWriter, r *http.Request) {
	const op = "user.handler.register"
	log := h.log.With(slog.String("op", op))

	var req UserRequest
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

	user := &User{
		Email:     req.Email,
		Password:  string(hashedPassword),
		FullName:  req.FullName,
		Role:      req.Role,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	created, err := h.storage.Create(r.Context(), user)
	if err != nil {
		if errors.Is(err, ErrUserAlreadyExists) {
			log.Error("user already exists", slog.Any("err", err))
			render.Render(w, r, api.NewErrResponse(http.StatusConflict,
				fmt.Errorf("user already exists")))
			return
		}
		log.Error("failed to create user", slog.Any("err", err))
		render.Render(w, r, api.NewErrResponse(http.StatusInternalServerError, err))
		return
	}

	render.Status(r, http.StatusCreated)
	render.Render(w, r, NewUserResponse(created))

	log.Info("user created", slog.Int("user_id", created.ID))
}

func (h *Handler) Login(w http.ResponseWriter, r *http.Request) {
	const op = "auth.handler.login"
	log := h.log.With(slog.String("op", op))

	var req LoginRequest
	if err := render.Bind(r, &req); err != nil {
		log.Error("invalid request", slog.Any("err", err))
		render.Render(w, r, api.NewErrResponse(http.StatusBadRequest, err))
		return
	}

	user, err := h.storage.GetByEmail(r.Context(), req.Email)
	if err != nil {
		log.Error("invalid credentials", slog.Any("err", err))
		render.Render(w, r, api.NewErrResponse(http.StatusUnauthorized, fmt.Errorf("invalid credentials")))
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		log.Error("invalid credentials", slog.Any("err", err))
		render.Render(w, r, api.NewErrResponse(http.StatusUnauthorized, fmt.Errorf("invalid credentials")))
		return
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub": strconv.Itoa(user.ID),
		"exp": time.Now().Add(h.expiration).Unix(),
	})

	tokenStr, err := token.SignedString(h.secret)
	if err != nil {
		log.Error("failed to sign token", slog.Any("err", err))
		render.Render(w, r, api.NewErrResponse(http.StatusInternalServerError, err))
		return
	}

	render.Status(r, http.StatusOK)
	render.Render(w, r, NewLoginResponse(user.Email, user.FullName, tokenStr))

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
	render.RenderList(w, r, NewUserListResponse(list))

	log.Info("users retrieved", slog.Int("count", len(list)))
}

func (h *Handler) Me(w http.ResponseWriter, r *http.Request) {
	const op = "user.handler.me"
	log := h.log.With(slog.String("op", op))

	uid, err := middleware.GetUserID(r.Context())
	if err != nil {
		log.Error("failed to get user id", slog.Any("err", err))
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
	render.Render(w, r, NewUserResponse(user))

	log.Info("current user retrieved", slog.Int("user_id", user.ID))
}

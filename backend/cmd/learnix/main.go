package main

import (
	"context"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/cors"

	"github.com/lovelystarcc/learnix/internal/config"
	"github.com/lovelystarcc/learnix/internal/lib/logger"
	"github.com/lovelystarcc/learnix/internal/middleware"
	"github.com/lovelystarcc/learnix/internal/storage"

	"github.com/lovelystarcc/learnix/internal/api"
	"github.com/lovelystarcc/learnix/internal/usecase"

	courserepo "github.com/lovelystarcc/learnix/internal/repository/course"
	teacherrepo "github.com/lovelystarcc/learnix/internal/repository/teacher"
	userrepo "github.com/lovelystarcc/learnix/internal/repository/user"
)

func main() {
	cfg := config.MustLoadConfig()
	log := logger.New(cfg.Env)

	router := chi.NewRouter()

	address := fmt.Sprintf("%s:%d", cfg.ServerHost, cfg.ServerPort)

	srv := &http.Server{
		Addr:         address,
		Handler:      router,
		ReadTimeout:  cfg.Timeout,
		WriteTimeout: cfg.Timeout,
		IdleTimeout:  cfg.IdleTime,
	}

	dsn := fmt.Sprintf(
		"postgres://%s:%s@%s:%d/%s?sslmode=%s",
		cfg.DBUser,
		cfg.DBPassword,
		cfg.DBHost,
		cfg.DBPort,
		cfg.DBName,
		cfg.DBSSLMode,
	)

	db, err := storage.New(dsn)
	if err != nil {
		log.Error("failed to init storage", slog.Any("err", err))
		os.Exit(1)
	}

	sqlDB, err := db.DB()
	if err != nil {
		log.Error("failed to get sql.DB", slog.Any("err", err))
		os.Exit(1)
	}
	defer sqlDB.Close()

	secret := []byte(cfg.JWTSecret)
	authMW := middleware.NewAuthMiddleware(secret)

	userrepo := userrepo.NewRepository(db)
	userusecase := usecase.NewUserUseCase(userrepo, secret, time.Duration(cfg.JWTExpiryHours)*time.Hour)
	userhandler := api.NewUserHandler(log, userusecase)

	courserepo := courserepo.NewRepository(db)
	courseusecase := usecase.NewCourseUseCase(courserepo)
	coursehandler := api.NewCourseHandler(log, courseusecase)

	teacherrepo := teacherrepo.NewRepository(db)
	teacherusecase := usecase.NewTeacherUseCase(teacherrepo)
	teacherhandler := api.NewTeacherHandler(log, teacherusecase)

	router.Use(cors.Handler(cors.Options{
		AllowedOrigins:   strings.Split(cfg.CORSAllowedOrigins, ","),
		AllowedMethods:   strings.Split(cfg.CORSAllowedMethods, ","),
		AllowedHeaders:   strings.Split(cfg.CORSAllowedHeaders, ","),
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	router.Route("/user", func(r chi.Router) {
		r.Use(authMW.Auth)
		r.Get("/me", userhandler.Me)
	})

	router.Get("/user", userhandler.GetAll)
	router.Post("/user/register", userhandler.Register)
	router.Post("/user/login", userhandler.Login)

	router.Get("/course", coursehandler.GetAll)
	router.With(authMW.Auth).Post("/course", coursehandler.Create)

	router.Get("/teacher", teacherhandler.GetAll)
	router.With(authMW.Auth).Post("/teacher", teacherhandler.Create)

	log.Info("starting server", "address", address)

	go func() {
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Error("server error", slog.Any("err", err))
		}
	}()

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, syscall.SIGINT, syscall.SIGTERM)

	<-stop
	log.Info("shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Error("shutdown error", slog.Any("err", err))
	}

	log.Info("server stopped")
}

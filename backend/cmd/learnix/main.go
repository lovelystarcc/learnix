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
	"github.com/lovelystarcc/learnix/internal/course"
	"github.com/lovelystarcc/learnix/internal/lib/logger"
	"github.com/lovelystarcc/learnix/internal/middleware"
	"github.com/lovelystarcc/learnix/internal/storage"
	"github.com/lovelystarcc/learnix/internal/teacher"
	"github.com/lovelystarcc/learnix/internal/user"
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

	userrepo := user.NewRepository(db)
	userhandler := user.NewHandler(log, userrepo, secret,
		time.Duration(cfg.JWTExpiryHours)*time.Hour,
	)

	courserepo := course.NewRepository(db)
	coursehandler := course.NewHandler(log, courserepo)

	teacherrepo := teacher.NewRepository(db)
	teacherhandler := teacher.NewHandler(log, teacherrepo)

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
	router.Route("/course", func(r chi.Router) {
		r.Use(authMW.Auth)
		r.Post("/", coursehandler.Create)
	})

	router.Get("/teacher", teacherhandler.GetAll)
	router.Route("/teacher", func(r chi.Router) {
		r.Use(authMW.Auth)
		r.Post("/", teacherhandler.Create)
	})

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

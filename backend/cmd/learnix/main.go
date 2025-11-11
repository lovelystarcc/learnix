package main

import (
	"database/sql"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"strings"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/cors"

	"github.com/lovelystarcc/learnix/internal/config"
	"github.com/lovelystarcc/learnix/internal/course/coursehandler"
	"github.com/lovelystarcc/learnix/internal/course/storage/courserepository"
	"github.com/lovelystarcc/learnix/internal/lib/logger"
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

	db, err := sql.Open("postgres", dsn)
	if err != nil {
		log.Error("failed to init storage", slog.Any("err", err))
		os.Exit(1)
	}
	defer db.Close()

	repo := courserepository.NewCourseRepository(db)
	handler := coursehandler.NewHandler(log, repo)

	router.Use(cors.Handler(cors.Options{
		AllowedOrigins:   strings.Split(cfg.CORSAllowedOrigins, ","),
		AllowedMethods:   strings.Split(cfg.CORSAllowedMethods, ","),
		AllowedHeaders:   strings.Split(cfg.CORSAllowedHeaders, ","),
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	// GET для получения списка курсов
	router.Get("/courses", handler.GetAll)

	log.Info("starting server", "address", address)

	if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Error("server error", slog.Any("err", err))
	}

	log.Info("server stopped")
}

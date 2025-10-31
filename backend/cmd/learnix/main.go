package main

import (
	"fmt"
	"log/slog"
	"net/http"

	"github.com/go-chi/chi"
	"github.com/lovelystarcc/learnix/internal/config"
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

	log.Info("starting server", "address", address)

	if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Error("server error", slog.Any("err", err))
	}

	log.Info("server stopped")
}

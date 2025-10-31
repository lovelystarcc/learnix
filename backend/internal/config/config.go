package config

import (
	"log"
	"time"

	"github.com/ilyakaznacheev/cleanenv"
)

type Config struct {
	Env string `env:"ENVIRONMENT" env-default:"local"`

	JWTSecret          string `env:"JWT_SECRET" env-required:"true"`
	JWTExpiryHours     int    `env:"JWT_EXPIRY_HOURS" env-default:"1"`
	RefreshTokenExpiry int    `env:"REFRESH_TOKEN_EXPIRY_DAYS" env-default:"7"`

	DBHost     string `env:"DB_HOST" env-default:"localhost"`
	DBPort     int    `env:"DB_PORT" env-default:"5432"`
	DBUser     string `env:"DB_USER" env-default:"user"`
	DBPassword string `env:"DB_PASSWORD" env-required:"true"`
	DBName     string `env:"DB_NAME" env-default:"learnix_db"`
	DBSSLMode  string `env:"DB_SSLMODE" env-default:"disable"`

	ServerHost string        `env:"SERVER_HOST" env-default:"0.0.0.0"`
	ServerPort int           `env:"SERVER_PORT" env-default:"8080"`
	Timeout    time.Duration `env:"SERVER_TIMEOUT" env-default:"4s"`
	IdleTime   time.Duration `env:"SERVER_IDLE_TIMEOUT" env-default:"60s"`

	CORSAllowedOrigins string `env:"CORS_ALLOWED_ORIGINS" env-default:"*"`
	CORSAllowedMethods string `env:"CORS_ALLOWED_METHODS" env-default:"GET,POST,PUT,DELETE,PATCH,OPTIONS"`
	CORSAllowedHeaders string `env:"CORS_ALLOWED_HEADERS" env-default:"Authorization,Content-Type"`

	RateLimitRequests      int `env:"RATE_LIMIT_REQUESTS" env-default:"100"`
	RateLimitWindowSeconds int `env:"RATE_LIMIT_WINDOW_SECONDS" env-default:"60"`

	LogLevel string `env:"LOG_LEVEL" env-default:"info"`
}

func MustLoadConfig() *Config {
	var cfg Config
	if err := cleanenv.ReadEnv(&cfg); err != nil {
		log.Fatalf("Failed to read environment: %s", err)
	}
	return &cfg
}

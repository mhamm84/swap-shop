package api

import (
	"context"
	"github.com/common-nighthawk/go-figure"
	_ "github.com/lib/pq"
	"github.com/mhamm84/swap-shop/server/cmd/config"
	"github.com/mhamm84/swap-shop/server/internal/utils"
	"go.uber.org/zap"
	"sync"
)

type application struct {
	cfg config.ApiConfig
	wg  *sync.WaitGroup
}

func StartApi(cfg *config.ApiConfig) {

	// Fancy ascii splash when starting the app
	myFigure := figure.NewColorFigure("Swap Shop API", "", "green", true)
	myFigure.Print()

	// Create the app
	app := application{
		cfg: *cfg,
	}

	logConfig(cfg)

	// Serve the API
	err := app.serve()
	if err != nil {
		utils.Logger(context.TODO()).Fatal("fatal error", zap.Error(err))
	}
}

func logConfig(cfg *config.ApiConfig) {
	utils.Logger(context.TODO()).Info("API",
		zap.String("host", cfg.Host),
		zap.Int("port", cfg.Port),
		zap.String("env", cfg.Env),
		zap.Strings("cors", cfg.Cors.TrustedOrigins),
		zap.String("logLevel", cfg.LogLevel),
	)
	utils.Logger(context.TODO()).Info("SMTP Server Config",
		zap.String("host", cfg.SMTP.Host),
		zap.Int("port", cfg.SMTP.Port),
		zap.String("username", cfg.SMTP.Username),
		zap.String("password", cfg.SMTP.Password),
		zap.String("sender", cfg.SMTP.Sender),
	)
	utils.Logger(context.TODO()).Info("Rate Limiter",
		zap.Bool("enabled", cfg.Limiter.Enabled),
		zap.Float64("rps", cfg.Limiter.RPS),
		zap.Int("username", cfg.Limiter.Burst),
	)
	utils.Logger(context.TODO()).Info("DB",
		zap.String("dsn", cfg.DB.Dsn),
		zap.Int("port", cfg.DB.MaxOpenConns),
		zap.Int("env", cfg.DB.MaxIdleConns),
		zap.String("cors", cfg.DB.MaxIdleTime),
	)
}

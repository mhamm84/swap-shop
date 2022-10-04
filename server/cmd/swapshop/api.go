package main

import (
	"fmt"
	"github.com/mhamm84/swap-shop/server/cmd/api"
	"github.com/mhamm84/swap-shop/server/cmd/config"
	"github.com/spf13/cobra"
	"os"
	"strconv"
	"strings"
)

const (
	version  = "1.0.0"
	logLevel = "log-level"
	host     = "host"
	port     = "port"
	env      = "env"

	dbDsn          = "db-dsn"
	dbMaxOpenConns = "db-max-open-conns"
	dbMaxIdleConns = "db-max-idle-conns"
	dbMaxIdleTime  = "db-max-idle-time"

	rateLimiterRPS     = "limiter-rps"
	rateLimiterBurst   = "limiter-burst"
	rateLimiterEnabled = "limiter-enabled"

	smtpHost     = "smtp-host"
	smtpPort     = "smtp-port"
	smtpUsername = "smtp-username"
	smtpPassword = "smtp-password"
	smtpSender   = "smtp-sender"

	dev        = "dev"
	staging    = "stg"
	uat        = "uat"
	production = "prod"
	cors       = "cors-trusted-origins"

	defaultPort           = 9081
	defaultMaxOpenConns   = 25
	defaultMaxIdleConns   = 25
	defaultMaxIdleTime    = "15m"
	defaultRatePerSeconds = 2
	defaultRateBurst      = 4
	defaultCors           = "http://localhost:9090"

	defaultSmtpPort = 25
)

var cfg config.ApiConfig

func RunApiCmd() *cobra.Command {

	var runCmd = &cobra.Command{
		Use:   "run-api",
		Short: "Launches the Swap Shop HTTP API.",
		Run: func(cmd *cobra.Command, args []string) {
			api.StartApi(&cfg)
		},
	} // End Run CMD

	// Parse arguments passed in on startup
	runCmd.Flags().StringVar(&cfg.LogLevel, logLevel, "INFO", "logging level [DEBUG,INFO,WARNING,ERROR,FATAL]")
	hostToConfigure := cfg.Host
	if hostToConfigure == "localhost" {
		hostToConfigure = ""
	}
	runCmd.Flags().String(host, hostToConfigure, "Swap Shop API hostname")
	runCmd.Flags().IntVar(&cfg.Port, port, defaultPort, "Swap Shop API port number")
	runCmd.Flags().StringVar(&cfg.Env, env, dev, fmt.Sprintf("%s|%s|%s|%s", dev, staging, uat, production))

	// POSTGRESQL
	runCmd.Flags().StringVar(&cfg.DB.Dsn, dbDsn, os.Getenv("SWAPSHOP_DB_DSN"), "Postgres DSN")
	runCmd.Flags().IntVar(&cfg.DB.MaxOpenConns, dbMaxOpenConns, defaultMaxOpenConns, "PostgreSQL max open connections")
	runCmd.Flags().IntVar(&cfg.DB.MaxIdleConns, dbMaxIdleConns, defaultMaxIdleConns, "PostgreSQL max open connections")
	runCmd.Flags().StringVar(&cfg.DB.MaxIdleTime, dbMaxIdleTime, defaultMaxIdleTime, "PostgreSQL max connection idle time")

	// API Rate Limiter
	runCmd.Flags().Float64Var(&cfg.Limiter.RPS, rateLimiterRPS, defaultRatePerSeconds, "Rate limiter maximum requests per second")
	runCmd.Flags().IntVar(&cfg.Limiter.Burst, rateLimiterBurst, defaultRateBurst, "Rate limiter maximum burst")
	runCmd.Flags().BoolVar(&cfg.Limiter.Enabled, rateLimiterEnabled, true, "Enable rate limiter")

	// CORS
	runCmd.Flags().StringSliceVar(&cfg.Cors.TrustedOrigins, cors, []string{defaultCors}, "all the Cors trusted origin URLS, usage: --cors-trusted-origin=url1,url2")
	cfg.Cors.TrustedOrigins = strings.Fields(os.Getenv("SWAPSHOP_CORS_TRUSTED_ORIGIN"))

	// SMTP
	runCmd.Flags().StringVar(&cfg.SMTP.Host, smtpHost, os.Getenv("SWAPSHOP_SMTP_HOST"), "SMTP host name")
	smtpPortEnv := os.Getenv("SWAPSHOP_SMTP_PORT")
	smtpPortVal, err := strconv.Atoi(smtpPortEnv)
	if err != nil {
		smtpPortVal = defaultSmtpPort
	}
	runCmd.Flags().IntVar(&cfg.SMTP.Port, smtpPort, smtpPortVal, "SMTP port")
	runCmd.Flags().StringVar(&cfg.SMTP.Username, smtpUsername, os.Getenv("SWAPSHOP_SMTP_USERNAME"), "SMTP username")
	runCmd.Flags().StringVar(&cfg.SMTP.Password, smtpPassword, os.Getenv("SWAPSHOP_SMTP_PASSWORD"), "SMTP password")
	runCmd.Flags().StringVar(&cfg.SMTP.Sender, smtpSender, os.Getenv("SWAPSHOP_SMTP_SENDER"), "SMTP sender")

	return runCmd
} // End CMD

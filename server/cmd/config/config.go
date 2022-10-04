package config

type ApiConfig struct {
	Host    string
	Port    int
	Env     string
	DB      DbConfig
	Limiter struct {
		RPS     float64
		Burst   int
		Enabled bool
	}
	Cors struct {
		TrustedOrigins []string
	}
	LogLevel string
	SMTP     struct {
		Host     string
		Port     int
		Username string
		Password string
		Sender   string
	}
}

type DbConfig struct {
	Dsn          string
	MaxOpenConns int
	MaxIdleConns int
	MaxIdleTime  string
}

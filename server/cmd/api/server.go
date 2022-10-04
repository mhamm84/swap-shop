package api

import (
	"context"
	"fmt"
	"github.com/mhamm84/swap-shop/server/internal/utils"
	"github.com/pkg/errors"
	"go.uber.org/zap"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"
)

func (app *application) serve() error {
	srv := &http.Server{
		Addr:         fmt.Sprintf("%s:%d", app.cfg.Host, app.cfg.Port),
		Handler:      http.TimeoutHandler(app.routes(), 5*time.Second, "timeout limit of request reached"),
		IdleTimeout:  time.Minute,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 30 * time.Second,
	}

	shutdownError := make(chan error)

	go func() {
		quit := make(chan os.Signal, 1)
		signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
		s := <-quit

		utils.Logger(context.TODO()).Info("signal caught", zap.String("signal", s.String()))

		ctx, cancel := context.WithTimeout(context.Background(), 20*time.Second)
		defer cancel()

		err := srv.Shutdown(ctx)
		if err != nil {
			shutdownError <- err
		}
		utils.Logger(context.TODO()).Info("signal caught", zap.String("addr", srv.Addr))

		app.wg.Wait()
		shutdownError <- nil
	}()

	utils.Logger(context.TODO()).Info("address:", zap.String("Addr", srv.Addr))

	err := srv.ListenAndServe()
	if !errors.Is(err, http.ErrServerClosed) {
		return err
	}

	err = <-shutdownError
	if err != nil {
		return err
	}

	utils.Logger(context.TODO()).Info("signal caught",
		zap.String("addr", srv.Addr),
		zap.String("env", app.cfg.Env),
	)

	return nil
}

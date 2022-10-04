package main

import (
	"context"
	"github.com/common-nighthawk/go-figure"
	"github.com/mhamm84/swap-shop/server/internal/utils"
	"go.uber.org/zap"
	"os"
)

func init() {
	utils.RootCmd.AddCommand(RunApiCmd())
}

func main() {
	// Fancy ascii splash when starting the app
	myFigure := figure.NewColorFigure("Swap Shop API Admin CLI", "", "green", true)
	myFigure.Print()

	utils.Logger(context.TODO()).Info("Hi! Welcome to Swap Shop!")

	if err := utils.RootCmd.Execute(); err != nil {
		utils.Logger(context.TODO()).Fatal("Fatal error executing root command", zap.Error(err))
		os.Exit(1)
	}
}

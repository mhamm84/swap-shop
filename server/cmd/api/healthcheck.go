package api

import "net/http"

func (app *application) healthCheckHandler(w http.ResponseWriter, r *http.Request) {
	env := envelope{
		"status": "UP",
		"systemInfo": map[string]interface{}{
			"env":     app.cfg.Env,
			"version": "1.0.0",
		},
	}

	err := app.WriteData(w, http.StatusOK, env, nil)
	if err != nil {
		app.serverErrorResponse(w, r, err)
	}
}

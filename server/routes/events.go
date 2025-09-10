package routes

import (
	"server/controllers"
	"server/middleware"

	"github.com/gin-gonic/gin"
)

func SetupEventRoutes(r *gin.Engine) {
	eventController := &controllers.EventController{}
	events := r.Group("/events")
	{
		// Public routes
		events.GET("", eventController.GetEvents)
		events.GET("/:id", eventController.GetEvent)

		// Protected routes (organizer only)
		events.POST("", middleware.AuthRequired(), middleware.RoleRequired("organizer"), eventController.CreateEvent)
		events.PUT("/:id", middleware.AuthRequired(), middleware.RoleRequired("organizer"), eventController.UpdateEvent)
		events.DELETE("/:id", middleware.AuthRequired(), middleware.RoleRequired("organizer"), eventController.DeleteEvent)
	}
}

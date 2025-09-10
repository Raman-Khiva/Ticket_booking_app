package routes

import (
	"server/controllers"
	"server/middleware"

	"github.com/gin-gonic/gin"
)

func SetupTicketRoutes(r *gin.Engine) {
	ticketController := &controllers.TicketController{}
	tickets := r.Group("/tickets")
	{
		// User routes
		tickets.POST("/book/:eventId", middleware.AuthRequired(), ticketController.BookTicket)
		tickets.GET("/my", middleware.AuthRequired(), ticketController.GetMyTickets)

		// Organizer routes
		tickets.POST("/validate", middleware.AuthRequired(), middleware.RoleRequired("organizer"), ticketController.ValidateTicket)
	}
}

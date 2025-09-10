package controllers

import (
	"context"
	"net/http"
	"server/database"
	"server/models"
	"server/utils"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type TicketController struct{}

func (tc *TicketController) BookTicket(c *gin.Context) {
	eventID := c.Param("eventId")
	eventObjectID, err := primitive.ObjectIDFromHex(eventID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid event ID"})
		return
	}

	// Get user ID from context
	userID, _ := c.Get("userID")
	userObjectID, _ := primitive.ObjectIDFromHex(userID.(string))

	// Check if event exists and has available tickets
	eventsCollection := database.GetCollection("events")
	var event models.Event
	err = eventsCollection.FindOne(context.Background(), bson.M{"_id": eventObjectID}).Decode(&event)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusNotFound, gin.H{"error": "Event not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	if event.AvailableTickets <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No tickets available"})
		return
	}

	// Generate QR code string
	qrCode := utils.GenerateQRString()

	// Create ticket
	ticket := models.Ticket{
		EventID:   eventObjectID,
		UserID:    userObjectID,
		QRCode:    qrCode,
		Status:    "active",
		Price:     event.Price,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	ticketsCollection := database.GetCollection("tickets")
	result, err := ticketsCollection.InsertOne(context.Background(), ticket)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to book ticket"})
		return
	}

	// Update available tickets count
	_, err = eventsCollection.UpdateOne(
		context.Background(),
		bson.M{"_id": eventObjectID},
		bson.M{"$inc": bson.M{"available_tickets": -1}},
	)
	if err != nil {
		// Rollback ticket creation
		ticketsCollection.DeleteOne(context.Background(), bson.M{"_id": result.InsertedID})
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update event"})
		return
	}

	ticket.ID = result.InsertedID.(primitive.ObjectID)
	c.JSON(http.StatusCreated, ticket)
}

func (tc *TicketController) GetMyTickets(c *gin.Context) {
	userID, _ := c.Get("userID")
	userObjectID, _ := primitive.ObjectIDFromHex(userID.(string))

	ticketsCollection := database.GetCollection("tickets")

	// Aggregation pipeline to join tickets with events
	pipeline := []bson.M{
		{"$match": bson.M{"user_id": userObjectID}},
		{"$lookup": bson.M{
			"from":         "events",
			"localField":   "event_id",
			"foreignField": "_id",
			"as":           "event",
		}},
		{"$unwind": "$event"},
		{"$sort": bson.M{"created_at": -1}},
	}

	cursor, err := ticketsCollection.Aggregate(context.Background(), pipeline)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch tickets"})
		return
	}
	defer cursor.Close(context.Background())

	var tickets []bson.M
	if err := cursor.All(context.Background(), &tickets); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode tickets"})
		return
	}

	// Transform the result to match our desired structure
	var result []models.TicketWithEvent
	for _, ticket := range tickets {
		eventData := ticket["event"].(bson.M)

		// Convert event data
		event := models.Event{
			ID:          eventData["_id"].(primitive.ObjectID),
			Title:       eventData["title"].(string),
			Description: eventData["description"].(string),
			Date:        eventData["date"].(primitive.DateTime).Time(),
			Location:    eventData["location"].(string),
			Price:       eventData["price"].(float64),
		}

		ticketWithEvent := models.TicketWithEvent{
			ID:        ticket["_id"].(primitive.ObjectID),
			Event:     event,
			QRCode:    ticket["qr_code"].(string),
			Status:    ticket["status"].(string),
			Price:     ticket["price"].(float64),
			CreatedAt: ticket["created_at"].(primitive.DateTime).Time(),
		}
		result = append(result, ticketWithEvent)
	}

	c.JSON(http.StatusOK, gin.H{"tickets": result})
}

func (tc *TicketController) ValidateTicket(c *gin.Context) {
	var req models.ValidateTicketRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Find ticket by QR code
	ticketsCollection := database.GetCollection("tickets")
	var ticket models.Ticket
	err := ticketsCollection.FindOne(context.Background(), bson.M{"qr_code": req.QRCode}).Decode(&ticket)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusNotFound, gin.H{"error": "Invalid QR code"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	// Check if ticket is already used
	if ticket.Status == "used" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Ticket already used"})
		return
	}

	if ticket.Status == "cancelled" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Ticket is cancelled"})
		return
	}

	// Mark ticket as used
	_, err = ticketsCollection.UpdateOne(
		context.Background(),
		bson.M{"_id": ticket.ID},
		bson.M{"$set": bson.M{"status": "used", "updated_at": time.Now()}},
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to validate ticket"})
		return
	}

	// Get event details
	eventsCollection := database.GetCollection("events")
	var event models.Event
	eventsCollection.FindOne(context.Background(), bson.M{"_id": ticket.EventID}).Decode(&event)

	c.JSON(http.StatusOK, gin.H{
		"message": "Ticket validated successfully",
		"ticket": gin.H{
			"id":      ticket.ID,
			"event":   event.Title,
			"user_id": ticket.UserID,
		},
	})
}

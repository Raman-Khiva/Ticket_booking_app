package controllers

import (
	"context"
	"net/http"
	"server/database"
	"server/models"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type EventController struct{}

func (ec *EventController) GetEvents(c *gin.Context) {
	collection := database.GetCollection("events")

	// Find all events, sorted by date
	cursor, err := collection.Find(context.Background(), bson.M{}, options.Find().SetSort(bson.D{{Key: "date", Value: 1}}))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch events"})
		return
	}
	defer cursor.Close(context.Background())

	var events []models.Event
	if err := cursor.All(context.Background(), &events); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode events"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"events": events})
}

func (ec *EventController) GetEvent(c *gin.Context) {
	id := c.Param("id")
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid event ID"})
		return
	}

	collection := database.GetCollection("events")
	var event models.Event
	err = collection.FindOne(context.Background(), bson.M{"_id": objectID}).Decode(&event)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusNotFound, gin.H{"error": "Event not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	c.JSON(http.StatusOK, event)
}

func (ec *EventController) CreateEvent(c *gin.Context) {
	var req models.CreateEventRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get organizer ID from context (set by auth middleware)
	organizerID, _ := c.Get("userID")
	organizerObjectID, _ := primitive.ObjectIDFromHex(organizerID.(string))

	event := models.Event{
		Title:            req.Title,
		Description:      req.Description,
		Date:             req.Date,
		Location:         req.Location,
		Price:            req.Price,
		TotalTickets:     req.TotalTickets,
		AvailableTickets: req.TotalTickets,
		OrganizerID:      organizerObjectID,
		CreatedAt:        time.Now(),
		UpdatedAt:        time.Now(),
	}

	collection := database.GetCollection("events")
	result, err := collection.InsertOne(context.Background(), event)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create event"})
		return
	}

	event.ID = result.InsertedID.(primitive.ObjectID)
	c.JSON(http.StatusCreated, event)
}

func (ec *EventController) UpdateEvent(c *gin.Context) {
	id := c.Param("id")
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid event ID"})
		return
	}

	var req models.UpdateEventRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get organizer ID from context
	organizerID, _ := c.Get("userID")
	organizerObjectID, _ := primitive.ObjectIDFromHex(organizerID.(string))

	collection := database.GetCollection("events")

	// Check if event exists and belongs to organizer
	var existingEvent models.Event
	err = collection.FindOne(context.Background(), bson.M{"_id": objectID, "organizer_id": organizerObjectID}).Decode(&existingEvent)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusNotFound, gin.H{"error": "Event not found or unauthorized"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	// Build update document
	update := bson.M{"updated_at": time.Now()}
	if req.Title != nil {
		update["title"] = *req.Title
	}
	if req.Description != nil {
		update["description"] = *req.Description
	}
	if req.Date != nil {
		update["date"] = *req.Date
	}
	if req.Location != nil {
		update["location"] = *req.Location
	}
	if req.Price != nil {
		update["price"] = *req.Price
	}
	if req.TotalTickets != nil {
		// Update available tickets proportionally
		soldTickets := existingEvent.TotalTickets - existingEvent.AvailableTickets
		update["total_tickets"] = *req.TotalTickets
		update["available_tickets"] = *req.TotalTickets - soldTickets
	}

	result, err := collection.UpdateOne(context.Background(), bson.M{"_id": objectID}, bson.M{"$set": update})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update event"})
		return
	}

	if result.MatchedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Event not found"})
		return
	}

	// Fetch updated event
	var updatedEvent models.Event
	collection.FindOne(context.Background(), bson.M{"_id": objectID}).Decode(&updatedEvent)

	c.JSON(http.StatusOK, updatedEvent)
}

func (ec *EventController) DeleteEvent(c *gin.Context) {
	id := c.Param("id")
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid event ID"})
		return
	}

	// Get organizer ID from context
	organizerID, _ := c.Get("userID")
	organizerObjectID, _ := primitive.ObjectIDFromHex(organizerID.(string))

	collection := database.GetCollection("events")
	result, err := collection.DeleteOne(context.Background(), bson.M{"_id": objectID, "organizer_id": organizerObjectID})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete event"})
		return
	}

	if result.DeletedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Event not found or unauthorized"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Event deleted successfully"})
}

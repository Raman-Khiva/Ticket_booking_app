package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Event struct {
	ID               primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	Title            string             `json:"title" bson:"title" validate:"required"`
	Description      string             `json:"description" bson:"description"`
	Date             time.Time          `json:"date" bson:"date" validate:"required"`
	Location         string             `json:"location" bson:"location" validate:"required"`
	Price            float64            `json:"price" bson:"price" validate:"required,gte=0"`
	TotalTickets     int                `json:"total_tickets" bson:"total_tickets" validate:"required,gt=0"`
	AvailableTickets int                `json:"available_tickets" bson:"available_tickets"`
	OrganizerID      primitive.ObjectID `json:"organizer_id" bson:"organizer_id"`
	CreatedAt        time.Time          `json:"created_at" bson:"created_at"`
	UpdatedAt        time.Time          `json:"updated_at" bson:"updated_at"`
}

type CreateEventRequest struct {
	Title        string    `json:"title" validate:"required"`
	Description  string    `json:"description"`
	Date         time.Time `json:"date" validate:"required"`
	Location     string    `json:"location" validate:"required"`
	Price        float64   `json:"price" validate:"required,gte=0"`
	TotalTickets int       `json:"total_tickets" validate:"required,gt=0"`
}

type UpdateEventRequest struct {
	Title        *string    `json:"title,omitempty"`
	Description  *string    `json:"description,omitempty"`
	Date         *time.Time `json:"date,omitempty"`
	Location     *string    `json:"location,omitempty"`
	Price        *float64   `json:"price,omitempty" validate:"omitempty,gte=0"`
	TotalTickets *int       `json:"total_tickets,omitempty" validate:"omitempty,gt=0"`
}

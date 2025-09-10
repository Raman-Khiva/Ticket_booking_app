package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Ticket struct {
	ID        primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	EventID   primitive.ObjectID `json:"event_id" bson:"event_id"`
	UserID    primitive.ObjectID `json:"user_id" bson:"user_id"`
	QRCode    string             `json:"qr_code" bson:"qr_code"`
	Status    string             `json:"status" bson:"status"` // "active", "used", "cancelled"
	Price     float64            `json:"price" bson:"price"`
	CreatedAt time.Time          `json:"created_at" bson:"created_at"`
	UpdatedAt time.Time          `json:"updated_at" bson:"updated_at"`
}

type TicketWithEvent struct {
	ID        primitive.ObjectID `json:"id"`
	Event     Event              `json:"event"`
	QRCode    string             `json:"qr_code"`
	Status    string             `json:"status"`
	Price     float64            `json:"price"`
	CreatedAt time.Time          `json:"created_at"`
}

type ValidateTicketRequest struct {
	QRCode string `json:"qr_code" validate:"required"`
}

type BookTicketResponse struct {
	ID        primitive.ObjectID `json:"id"`
	EventID   primitive.ObjectID `json:"event_id"`
	QRCode    string             `json:"qr_code"`
	Status    string             `json:"status"`
	Price     float64            `json:"price"`
	Message   string             `json:"message"`
	CreatedAt time.Time          `json:"created_at"`
}

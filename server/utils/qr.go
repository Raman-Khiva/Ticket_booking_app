package utils

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"time"
)

func GenerateQRString() string {
	// Generate random bytes
	bytes := make([]byte, 16)
	rand.Read(bytes)

	// Create unique QR string with timestamp
	timestamp := time.Now().Unix()
	randomHex := hex.EncodeToString(bytes)

	return fmt.Sprintf("TKT-%d-%s", timestamp, randomHex)
}

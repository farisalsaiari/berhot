package service

import (
	"context"
	"crypto/rand"
	"fmt"
	"log"
	"math/big"
	"net/smtp"
	"strings"
)

// OTPSender defines how OTP codes are delivered
type OTPSender interface {
	Send(ctx context.Context, destination, code string) error
}

// GenerateOTPCode creates a cryptographically secure 6-digit code
func GenerateOTPCode() string {
	n, err := rand.Int(rand.Reader, big.NewInt(1000000))
	if err != nil {
		// Fallback to simpler generation
		return "123456"
	}
	return fmt.Sprintf("%06d", n.Int64())
}

// ── Console Sender (dev: logs to stdout) ────────────────────

type ConsoleSender struct{}

func (s *ConsoleSender) Send(_ context.Context, destination, code string) error {
	log.Printf("📱 OTP for %s: %s", destination, code)
	return nil
}

// ── Mailhog Sender (dev: sends email via SMTP to Mailhog) ───

type MailhogSender struct {
	Host string
	Port string
	From string
}

func (s *MailhogSender) Send(_ context.Context, destination, code string) error {
	subject := "Your Berhot verification code"
	body := fmt.Sprintf(
		"Your verification code is: %s\n\nThis code expires in 5 minutes.\n\nIf you didn't request this code, please ignore this email.",
		code,
	)

	msg := fmt.Sprintf(
		"From: %s\r\nTo: %s\r\nSubject: %s\r\nContent-Type: text/plain; charset=UTF-8\r\n\r\n%s",
		s.From, destination, subject, body,
	)

	addr := fmt.Sprintf("%s:%s", s.Host, s.Port)
	err := smtp.SendMail(addr, nil, s.From, []string{destination}, []byte(msg))
	if err != nil {
		log.Printf("⚠️ Failed to send email to %s: %v (falling back to console)", destination, err)
		log.Printf("📧 OTP for %s: %s", destination, code)
		return nil // Don't fail — just log it
	}

	log.Printf("📧 OTP email sent to %s via Mailhog", destination)
	return nil
}

// ── Multi Sender (tries email for emails, console for phones) ─

type MultiSender struct {
	EmailSender OTPSender
	PhoneSender OTPSender
}

func (s *MultiSender) Send(ctx context.Context, destination, code string) error {
	// Always log to console
	log.Printf("🔑 OTP for %s: %s", destination, code)

	if strings.Contains(destination, "@") {
		return s.EmailSender.Send(ctx, destination, code)
	}
	return s.PhoneSender.Send(ctx, destination, code)
}

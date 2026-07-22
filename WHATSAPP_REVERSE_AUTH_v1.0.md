# WhatsApp Reverse Authentication
## MamaPrice Authentication Flow (No OTP, No OAuth)

**Version:** 1.0  
**Status:** Core Architecture & Implementation Specification  
**Owner:** MamaPrice Authentication & Platform Layer

---

# Overview

Since WhatsApp does not provide a native OAuth ("Continue with WhatsApp"), MamaPrice implements **Reverse Authentication**.

Instead of sending an OTP to the user, the user authenticates themselves by sending a unique login code to the official MamaPrice WhatsApp bot.

This provides:

- **Zero SMS costs**
- **Zero Authentication Template costs**
- **No OTP input fields**
- Authentication tied to the user's verified WhatsApp number
- Seamless onboarding into the MamaPrice WhatsApp ecosystem

---

# High Level Flow

```text
User
 │
 │ Click "Continue with WhatsApp"
 ▼

MamaPrice Frontend
 │
 │ Generate Login Session
 ▼

Unique Login Code
LOGIN_92XG7AB

 │
 ▼

Open WhatsApp

https://wa.me/234XXXXXXXXXX?text=LOGIN_92XG7AB

 │
 ▼

User presses Send

 │
 ▼

Meta Webhook

 │
 ▼

MamaPrice Backend

 │
 ├── Verify login code
 ├── Get sender phone number
 ├── Match login session
 ├── Authenticate user
 └── Create JWT

 │
 ▼

Frontend receives authentication

 │
 ▼

Redirect to Dashboard
```

---

# Authentication Components

## Frontend

Responsibilities:
- Generate temporary login session
- Create WhatsApp deep link
- Open WhatsApp
- Listen for authentication completion
- Store JWT
- Redirect user

---

## Backend

Responsibilities:
- Generate secure login sessions
- Store temporary sessions
- Receive WhatsApp webhook
- Verify login code
- Authenticate phone number
- Create JWT
- Notify frontend

---

## WhatsApp Cloud API

Responsibilities:
- Receive user message
- Send webhook
- Allow confirmation reply

---

# Database Schema

## LoginSessions

```sql
id
session_id
login_code
status
created_at
expires_at
phone_number
user_id
```

Status:
- `pending`
- `authenticated`
- `expired`

---

## Users

```sql
id
phone_number
name
avatar
created_at
last_login
```

---

# API Endpoints

```
POST   /auth/session
GET    /auth/session/:sessionId
POST   /webhooks/whatsapp
POST   /auth/verify-simulated
POST   /auth/logout
POST   /auth/refresh
GET    /me
```

---

# Step 1: Generate Login Session

User clicks `Continue with WhatsApp` $\rightarrow$ Frontend calls `POST /auth/session` $\rightarrow$ Backend returns:

```json
{
    "sessionId": "abc123",
    "loginCode": "LOGIN_92XG7AB",
    "deepLink": "https://wa.me/2348123456789?text=LOGIN_92XG7AB",
    "expiresIn": 300
}
```

---

# Step 2: User Sends WhatsApp Message

Conversation pre-filled: `LOGIN_92XG7AB`.

---

# Step 3: Webhook Receives Message & Authenticates

Payload received from Meta:

```json
{
  "from": "2348012345678",
  "text": "LOGIN_92XG7AB"
}
```

Backend validates session, creates/logs in user, issues JWT, and marks `LoginSession.status = "authenticated"`.

---

# Security

- **Login Code**: 128-bit random secure token (e.g. `LOGIN_C4G92XABK2D9`). Never sequential.
- **Expiry**: 5 minutes maximum.
- **Single Use**: Immediately invalidated upon authentication.
- **Replay Protection**: Rejects reused login codes.
- **JWT Expiry**: 15 minutes access token, 30 days refresh token.

---

# Advantages

- **Zero SMS costs** & no authentication template fees
- No OTP entry or SMS delay
- Phone number automatically verified through WhatsApp
- Connects user to the MamaPrice WhatsApp bot for live market alerts, rewards, and notifications
- Scalable to millions of users

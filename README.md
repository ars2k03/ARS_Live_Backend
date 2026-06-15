# ARS Live Backend 💬📞

**ARS Live** is the backend for a secure, real-time messaging app that keeps people connected instantly, anywhere. It's built with **Node.js + Express + TypeScript**, using **Socket.io** for real-time communication.

---

## ✨ Features

- 🔐 Google OAuth Login
- 🔑 JWT-based Authentication (Access Token + Refresh Token)
- 📱 Phone Number Verification (OTP system)
- 💬 Real-time Messaging (powered by Socket.io)
- 👀 Message Seen/Unseen Status
- 👥 User List & Profile Fetch
- 🗨️ Conversation Open/Create system

---

## 🛠️ Tech Stack

| Category | Technology |
|---|---|
| Language | TypeScript |
| Runtime | Node.js |
| Framework | Express.js |
| Real-time | Socket.io |
| Authentication | JWT (jsonwebtoken), Google Auth Library |
| Password Hashing | bcrypt |

---

## 🗄️ Database

This project uses **three different databases**, each with a dedicated role:

### 1️⃣ PostgreSQL — User & Auth Data
- Library: `pg`
- Stores core user information in the `userinfo` table (id, name, email, avatar_url, phone_number).
- On Google Login, new users are inserted here, and existing users are fetched from here.
- Connection string is read from the `AUTH_DB` env variable.

### 2️⃣ MongoDB — Chat & Conversation Data
- Library: `mongodb` + `mongoose`
- Database name: `users`
- Stores conversations and messages via the `Conversation` model.
  - Each conversation has `participants` (the two user IDs) and a `messages` array.
  - Each message contains `senderId`, `text`, `seen`, and `createdAt`.
- Connection string is read from the `MONGO_DB` env variable.

### 3️⃣ Redis (Upstash) — OTP / Temporary Data
- Library: `@upstash/redis`
- Used to temporarily store OTPs — key format: `otp:{phoneNumber}`, with a TTL of **300 seconds (5 minutes)**.
- The key is deleted once the OTP is verified.
- Requires `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` for connection.

---

## 📁 Project Structure

```
ARS_Live_Backend/
├── src/
│   ├── controller/
│   │   ├── chat/
│   │   │   └── openConversation.ts   # Open/create a conversation
│   │   ├── otp.send.ts               # Send OTP (Redis + Pg)
│   │   └── otp.verify.ts             # Verify OTP
│   ├── database/
│   │   ├── auth.redis.ts             # Redis (Upstash) connection
│   │   ├── user.auth.ts              # PostgreSQL connection (Pool)
│   │   └── user.mongo.ts             # MongoDB connection (Mongoose)
│   ├── log/
│   │   ├── google.ts                 # Google OAuth login logic
│   │   └── refreshToken.ts           # JWT refresh token logic
│   ├── middleware/
│   │   └── auth.middle.ts            # JWT verify middleware
│   ├── model/
│   │   └── conversation.model.ts     # Mongoose Conversation schema
│   ├── router/
│   │   └── route.ts                  # All API routes
│   ├── socket/
│   │   └── socket.io.ts              # Socket.io events
│   └── server.ts                     # Entry point
├── package.json
├── tsconfig.json
└── .gitignore
```

---

## 🔌 API Endpoints

| Method | Endpoint | Protected | Description |
|---|---|---|---|
| GET | `/` | ❌ | Health check (`ARS Live Now`) |
| POST | `/google-login` | ❌ | Login/signup with a Google ID Token |
| POST | `/refresh` | ❌ | Get a new access token |
| POST | `/send-otp` | ✅ | Send an OTP for phone number verification |
| POST | `/verify-otp` | ✅ | Verify OTP and set the user's phone_number |
| GET | `/profile` | ✅ | Get the logged-in user's profile |
| GET | `/users` | ✅ | List all users except the current user |
| POST | `/chat/open` | ✅ | Open/create a conversation between two users |

> **Protected** routes require an `Authorization: Bearer <token>` header.

---

## 🔄 Socket.io Events

| Event | Direction | Description |
|---|---|---|
| `register` | client → server | Register a socket against a user ID |
| `send-message` | client → server | Send a new message (saved to MongoDB) |
| `new-message` | server → client | Push the new message to the receiver |
| `message-sent` | server → client | Send confirmation to the sender |
| `mark-seen` | client → server | Mark messages as seen |
| `messages-seen` | server → client | Broadcast the seen status |
| `disconnect` | client → server | Remove the user from the online list |

---

## ⚙️ Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# PostgreSQL (User/Auth DB)
AUTH_DB=postgres://username:password@host:port/dbname

# MongoDB (Chat DB)
MONGO_DB=mongodb+srv://username:password@cluster.mongodb.net

# Redis (Upstash - OTP storage)
UPSTASH_REDIS_REST_URL=https://your-upstash-url
UPSTASH_REDIS_REST_TOKEN=your-upstash-token

# JWT Secrets
JWT_SECRET=your_access_token_secret
JWT_REFRESH_SECRET=your_refresh_token_secret

```

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/ars2k03/ARS_Live_Backend.git
cd ARS_Live_Backend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up the `.env` file
Create a `.env` file as described in the Environment Variables section above, and fill in your own credentials.

### 4. Run the development server
```bash
npm run dev
```

### 5. Production build
```bash
npm run build
npm start
```

By default, the server runs on: `http://localhost:8000`

---

## 📜 Scripts

| Command | Description |
|---|---|
| `npm run dev` | Runs the server in development mode using `tsx watch` |
| `npm run build` | Compiles TypeScript into the `dist/` folder |
| `npm start` | Runs the production server from the compiled JS |

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.
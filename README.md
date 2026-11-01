# LandChat AI 🏡

[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-1.5_Flash-4285F4?logo=google&logoColor=white)](https://ai.google.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

An intelligent, full-stack real estate and land investment advisory platform engineered to help buyers, sellers, and investors discover, evaluate, and transact land properties seamlessly through conversational AI.

---

## 📌 Overview

**LandChat AI** pairs structured MongoDB property listings with an AI-augmented recommendation pipeline powered by Google Gemini and intelligent semantic fallback logic. Whether looking for agricultural acreage, prime commercial plots along highway corridors, or affordable residential layouts, LandChat AI provides instant conversational answers, location clustering, and direct inquiry channels.

---

## ✨ Key Features

- 🤖 **Conversational AI Real Estate Assistant**
  - Natural language property queries (e.g., *"give me affordable land near hyd"* or *"agricultural plots under ₹50 Lakh"*).
  - Handles regional abbreviations (`hyd`, `vja`, `vizag`, `gnt`) and automatically searches surrounding investment corridors.
  - Zero-downtime architecture: seamlessly falls back to high-performance heuristic & regex parsing if API quotas are reached.

- 🔍 **Dynamic Property Discovery & Filtering**
  - Filter by category: **Agricultural**, **Residential**, **Commercial**, and **Industrial**.
  - Advanced price range filters (INR / multi-currency notation: `₹`, `k`, `lakh`, `cr`).
  - Acreage, dimension, and zoning specifications.

- 💬 **Buyer-Seller Messaging Channel**
  - Direct inquiry threads between prospective buyers and verified sellers/admins.
  - Unread message tracking and instant communication.

- 📊 **Dashboards & Financial Utilities**
  - **Customer Dashboard**: Track saved favorite properties, active conversations, and scheduled visits.
  - **Seller/Admin Dashboard**: Manage inventory, publish listings with media, and monitor inquiries.
  - **Built-in Financial Tools**: Interactive EMI loan calculator and price-per-acre analysis.

- 🔒 **Secure Role-Based Authentication**
  - Stateless JSON Web Tokens (JWT) with `bcryptjs` password hashing.
  - Protected API endpoints and role guards for `customer` and `admin` portals.

---

## 🛠 Tech Stack

| Domain | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, shadcn/ui, Radix UI Primitives, Lucide React, TanStack Query (v5), Recharts |
| **Backend** | Node.js, Express.js, Express Async Handler, CORS |
| **Database** | MongoDB Atlas, Mongoose ODM (v8) |
| **AI / NLP** | Google Gemini API (`@google/generative-ai`), Custom Semantic Query Engine |
| **Authentication** | JWT (JSON Web Tokens), bcryptjs |
| **Deployment** | Render (Blueprint `render.yaml`), Vercel (`vercel.json`) |

---

## 📁 Repository Structure

```text
LandChat-AI/
├── public/                     # Static assets (images, icons, robots.txt, _redirects)
├── src/                        # React frontend application
│   ├── components/             # Reusable UI components & shadcn primitives
│   ├── contexts/               # React Contexts (AuthContext, ThemeContext)
│   ├── hooks/                  # Custom React hooks (mobile detection, toast)
│   ├── lib/                    # Axios instance (api.js), utility helpers (utils.js)
│   ├── pages/                  # Application views & dashboards
│   │   ├── AIAssistant.jsx     # Conversational AI Assistant page
│   │   ├── Auth.jsx            # Sign In / Sign Up portal
│   │   ├── CustomerDashboard.jsx
│   │   ├── AdminDashboard.jsx
│   │   └── LandDetails.jsx     # Detailed property overview & inquiry
│   ├── App.jsx                 # Client router configuration & protected routes
│   └── main.jsx                # Application root entrypoint
├── server/                     # Express.js REST API Backend
│   ├── config/                 # Database configuration (db.js)
│   ├── controllers/            # Route controllers (aiController, authController, etc.)
│   ├── middleware/             # Auth verification & admin protection middleware
│   ├── models/                 # Mongoose database schemas (User, Property, Message)
│   ├── routes/                 # REST API route handlers
│   ├── properties_dataset.json # Seed dataset of curated parcels
│   ├── seed_properties.js      # Database seed automation script
│   └── server.js               # Express application initialization & middleware
├── .env.example                # Sample environment configuration for frontend
├── server/.env.example         # Sample environment configuration for backend
├── render.yaml                 # Infrastructure-as-code for Render deployment
├── vercel.json                 # SPA routing configuration for Vercel
├── vite.config.js              # Vite bundler configuration
└── README.md                   # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your local machine:
- [Node.js](https://nodejs.org/) (v18.0.0 or higher)
- [npm](https://www.npmjs.com/) (v9.0.0 or higher)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account or local MongoDB instance

---

### 1. Clone the Repository

```bash
git clone https://github.com/Balu-parasa/LandChat-AI.git
cd LandChat-AI
```

---

### 2. Configure Environment Variables

Create `.env` files in both the root directory and the `server` directory using the provided examples:

#### Frontend (`.env` in root)
```bash
cp .env.example .env
```
```env
VITE_API_URL=http://localhost:5000/api
```

#### Backend (`server/.env`)
```bash
cp server/.env.example server/.env
```
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
GEMINI_API_KEY=your_google_gemini_api_key
```

---

### 3. Install Dependencies

Install root (frontend) and server dependencies:

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

---

### 4. (Optional) Seed the Database

To populate the database with initial sample properties:

```bash
cd server
node seed_properties.js
cd ..
```

---

### 5. Run the Application

You can start both the client and server concurrently from the root directory:

```bash
npm run dev
```

Or start them individually:

```bash
# Terminal 1 - Backend (Port 5000)
cd server
npm run dev

# Terminal 2 - Frontend (Port 8081)
npm run client
```

Open [http://localhost:8081](http://localhost:8081) in your browser to view the application.

---

## 📡 API Endpoints Overview

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register a new user (`customer` or `admin`) | Public |
| `POST` | `/api/auth/login` | Authenticate user and receive JWT token | Public |
| `GET` | `/api/auth/profile` | Retrieve authenticated user profile | Private |
| `GET` | `/api/properties` | Fetch all available land properties | Public |
| `GET` | `/api/properties/:id` | Get detailed information for a property | Public |
| `POST` | `/api/properties` | Create a new property listing | Admin / Seller |
| `POST` | `/api/ai` | Send query to AI Assistant & retrieve matches | Private |
| `GET` | `/api/chat/:userId` | Retrieve message history with a user | Private |
| `POST` | `/api/chat` | Send a new message | Private |
| `GET` | `/api/health` | Health check probe | Public |

---

## 🌐 Deployment Guide

### Deploying to Render
The repository includes a ready-to-deploy [`render.yaml`](render.yaml) Blueprint:
1. Connect your repository in [Render Dashboard](https://dashboard.render.com/).
2. Select **New Blueprint Instance**.
3. Supply the environment variables:
   - Backend: `MONGO_URI`, `JWT_SECRET`, `GEMINI_API_KEY`
   - Frontend: `VITE_API_URL` (points to your deployed backend URL, e.g. `https://landchat-backend.onrender.com/api`)

### Deploying Frontend to Vercel
1. Import the repository in [Vercel](https://vercel.com/).
2. Configure environment variable: `VITE_API_URL`.
3. The included [`vercel.json`](vercel.json) automatically handles SPA client-side route rewrites.

---

## 🛡 Security Best Practices

- All `.env` and sensitive credential files are excluded via `.gitignore`.
- Password hashes are stored using salt-generated `bcrypt` rounds.
- Cross-Origin Resource Sharing (CORS) is configured for authenticated access.
- MongoDB injection risks are mitigated using Mongoose schemas and sanitized regex lookups.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the Project.
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3. Commit your Changes (`git commit -m 'feat: Add AmazingFeature'`).
4. Push to the Branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

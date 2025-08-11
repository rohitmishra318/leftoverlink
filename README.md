# 🍲 LeftoverLink

**LeftoverLink** is a MERN + Vite-based web application that enables individuals, restaurants, and caterers to donate leftover food to nearby NGOs.  
It features **AI-powered NGO recommendations** based on proximity and past donation history, along with a volunteer community (via WhatsApp) for efficient delivery coordination.

---

## 🚀 Features

- **Food Donation System** — Donors can register donations with details about food quantity, type, and pickup location.
- **AI-based NGO Recommendations** — Suggests NGOs based on:
  - Distance from donor
  - Past donation history
  - NGO availability
- **Volunteer Community Integration** — Dedicated WhatsApp group for volunteers to coordinate pickups and deliveries.
- **Real-time Updates** — Volunteers and NGOs get notified instantly when a donation is made.
- **Donation Tracking** — Keep track of total food donated and received.
- **Modern UI** — Built with React + Vite and styled using Tailwind CSS.

---

## 🛠️ Tech Stack

### **Frontend**
- React.js (Vite)
- Tailwind CSS
- Socket.IO (for real-time notifications)

### **Backend**
- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication
- Socket.IO Server
- Custom AI-based Recommendation Service

---

## 📂 Project Structure

LEFTOVERLINK/
│
├── backend/ # Backend API and services
│ ├── ai_model/ # AI Recommendation Model
│ ├── config/ # Config files (DB, env)
│ ├── controllers/ # Request handlers
│ ├── middlewares/ # Middleware functions
│ ├── models/ # Mongoose models
│ ├── routes/ # API routes
│ ├── seed/ # Seed scripts (if any)
│ ├── services/ # Business logic services
│ ├── server.js # Entry point for backend
│ └── .env # Backend environment variables
│
├── frontend/ # Frontend code (React + Vite)
│ ├── public/ # Static files
│ ├── src/
│ │ ├── assets/ # Images and static assets
│ │ ├── components/ # UI components
│ │ ├── context/ # Context API state
│ │ ├── pages/ # Page components
│ │ ├── App.jsx # Main app component
│ │ ├── main.jsx # React DOM rendering
│ │ ├── socket.js # Socket.IO client setup
│ │ └── index.css # Global styles
│ └── .env # Frontend environment variables
│
├── .gitignore
├── README.md
└── Dockerfile







---

## ⚙️ Installation & Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-username/leftoverlink.git
   cd leftoverlink


--FRONTEND--

cd frontend
npm install


--BACKEND--


cd ../backend
npm install




--Set .env File--

PORT=4000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key






const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const http = require('http');
const socketIO = require('socket.io');
require('dotenv').config();

const authenticateToken = require('./middlewares/auth');
const mongoose = require('mongoose');
const userRoutes = require('./routes/user.routes');
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/leftoverlink';
const donationRoutes = require('./routes/donationRoutes');

// ✅ DB Connection
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// ✅ Express app setup
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ API routes
app.use('/api/users', userRoutes);
app.use('/api/dn', donationRoutes);

// ✅ Create HTTP server and Socket.IO server
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: '*', // 👈 you can restrict to frontend origin here
    methods: ['GET', 'POST']
  }
});

// ...existing code...

// ✅ Socket.IO logic
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Join room by user ID
  socket.on('join', userId => socket.join(userId));

  socket.on('new-donation', data => {
    // if targeting a specific receiver:
    if (data.receiverId) {
      io.to(data.receiverId).emit('receive-donation', data);
    } else {
      // broadcast to every connected donor/volunteer:
      io.emit('receive-donation', data);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Make io accessible in controllers
app.set("io", io);

// ✅ Start the server
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
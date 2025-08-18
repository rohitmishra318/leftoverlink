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


mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));



  

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/api/users', userRoutes);
app.use('/api/dn', donationRoutes);


const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: '*', 
    methods: ['GET', 'POST']
  }
});




io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  
  socket.on('join', userId => socket.join(userId));

  socket.on('new-donation', data => {
    
    if (data.receiverId) {
      io.to(data.receiverId).emit('receive-donation', data);
    } else {
      
      io.emit('receive-donation', data);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

app.set("io", io);


const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));



// Install required dependencies: express, socket.io, cors
// Command: npm install express socket.io cors

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

let leaderboards = {
  Math: [],
  Science: [],
};

app.use(cors());
app.use(express.json());

// Login Endpoint
app.post('/login', (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).send('Username is required');
  res.send({ success: true });
});

// Socket.io Events
io.on('connection', (socket) => {
  console.log('A user connected');

  // Listen for quiz submissions
  socket.on('submitQuiz', (data) => {
    const { username, score, subject } = data;

    // Add the score to the appropriate subject leaderboard
    leaderboards[subject].push({ username, score });
    leaderboards[subject].sort((a, b) => b.score - a.score); // Sort by score (descending)

    // Send updated leaderboards to all clients
    io.emit('updateLeaderboard', leaderboards);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

// Start Server
server.listen(4000, () => {
  console.log('Server running on port 4000');
});

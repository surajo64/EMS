import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth.js';
import connectToDatabase from './db/db.js';
import adminRouter from './routes/adminRoute.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';
import fs from 'fs';
import http from 'http';
import { Server } from 'socket.io';

dotenv.config(); 

// ✅ Connect to DB
connectToDatabase();
const app = express();

// ✅ Wrap Express with HTTP server
const server = http.createServer(app);

// ✅ Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*", // change this to your frontend domain in production
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

// ✅ Socket.IO handlers
io.on("connection", (socket) => {
  console.log("🔗 User connected:", socket.id);

  // join private room for this user
  socket.on("join", (userId) => {
    socket.join(userId.toString());
    console.log(`👤 User ${userId} joined room`);
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

// ✅ Export io so controllers can emit events
export { io };

// ✅ Path setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(cors());
app.use(express.json());

// ✅ Routes
app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);

// ✅ Serve frontend
const frontendPath = path.join(__dirname, '..', 'frontend', 'dist');
if (fs.existsSync(frontendPath)) {
  app.use(express.static(frontendPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
} else {
  console.error('Frontend build directory not found:', frontendPath);
}

// ✅ Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});

import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth.js';
import connectToDatabase from './db/db.js';
import adminRouter from './routes/adminRoute.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';
import fs from 'fs'; // ✅ Fix: import fs here


dotenv.config(); // ✅ Make sure env vars like PORT and Cloudinary keys are loaded

connectToDatabase();
const app = express();

// These are still needed
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(cors());
app.use(express.json());

// ✅ Routes
app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);


// Serve frontend
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
app.listen(process.env.PORT || 5000, () => {
  console.log(`✅ Server is running on port ${process.env.PORT || 5000}`);
});

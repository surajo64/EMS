import express from 'express'
import cors from 'cors'
import authRouter from './routes/auth.js'
import connectToDatabase from './db/db.js'
import adminRouter from './routes/adminRoute.js'
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';


connectToDatabase()
const app = express()


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Serve the uploads folder
app.use('/upload', express.static(path.join(__dirname, 'public/upload')));


app.use(cors())
app.use(express.json())
app.use('/api/auth', authRouter)
app.use('/api/admin', adminRouter)


// Serve static files from Vite build
const frontendPath = path.join(__dirname, 'public');

if (fs.existsSync(frontendPath)) {
  app.use(express.static(frontendPath));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
} else {
  console.error('Frontend files not found at:', frontendPath);
  console.log('Did you forget to build the frontend?');
}


app.listen(process.env.PORT,() => {
console.log(`Server is running on port ${process.env.PORT}`);

  
})
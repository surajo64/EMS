import express from 'express'
import cors from 'cors'
import authRouter from './routes/auth.js'
import connectToDatabase from './db/db.js'
import adminRouter from './routes/adminRoute.js'
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';


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


// ✅ Serve React frontend (AFTER API routes)
app.use(express.static(path.join(__dirname, '..', 'frontend', 'build')));

// ✅ Catch-all route for React Router (very important!)
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '..', 'frontend', 'build', 'index.html'));
});
app.listen(process.env.PORT,() => {
console.log(`Server is running on port ${process.env.PORT}`);

  
})
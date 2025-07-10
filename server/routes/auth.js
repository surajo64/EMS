import express from 'express'
import { login } from '../controller/authController.js';
import { fetchEmployees } from '../controller/adminController.js';



const authRouter = express.Router();

 
authRouter.post('/login', login);
authRouter.get('/get-employees',fetchEmployees );




export default authRouter;
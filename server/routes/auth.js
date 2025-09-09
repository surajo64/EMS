import express from 'express'
import { deleteMessage, getMessage, login, markRead, sendMessage } from '../controller/authController.js';
import { fetchEmployees } from '../controller/adminController.js';
import authUser from '../middlewares/authUser.js';



const authRouter = express.Router();


authRouter.post('/login', login);
authRouter.get('/get-employees',fetchEmployees );
authRouter.post("/send-message", authUser, sendMessage );
authRouter.get("/get-message", authUser, getMessage );
authRouter.post("/:id/read", authUser, markRead );
authRouter.delete("/delete/:id", authUser, deleteMessage);




export default authRouter;
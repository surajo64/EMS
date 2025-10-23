// routes/accountRoute.js
import express from 'express'
import authUser from '../middlewares/authUser.js';
import { 
  createTransaction, 
  getAllTransactions, 
  getTransaction, 
  createAccount,
  getAllAccounts,
  updateAccount,
  deleteAccount,
  getAccountDetail,
  addOrUpdateBudget,
  getBudgets,
  AddPayroll,
  GetPayroll,
  updatePayroll,
  downloadExcel
} from '../controller/accountController.js';

const accountRouter = express.Router();

// ✅ Transaction routes
accountRouter.post('/add-transaction', authUser, createTransaction);
accountRouter.get('/get-all-transaction', authUser, getAllTransactions);
accountRouter.get('/get-transaction/:id', authUser, getTransaction);
accountRouter.delete('/deleteTransaction/:id', authUser); // you still need controller here

// ✅ Account routes
accountRouter.post('/add-account', authUser, createAccount);
accountRouter.get('/get-all-account', authUser, getAllAccounts);
accountRouter.get('/accountDetail/:id', authUser, getAccountDetail);
accountRouter.post('/updateAccount/:id', authUser, updateAccount);
accountRouter.delete('/deleteAccount/:id', authUser, deleteAccount);


// Budget Routes

accountRouter.post("/add-Budget", authUser, addOrUpdateBudget);
accountRouter.get("/getBudget", authUser, getBudgets);


// Payroll Routes
accountRouter.post("/add-payroll", authUser, AddPayroll);
accountRouter.get("/get-payroll", authUser, GetPayroll);
accountRouter.post("/update-payroll", authUser, updatePayroll);
accountRouter.get("/download-excel", authUser, downloadExcel);

export default accountRouter;

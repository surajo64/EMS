import express from 'express'
import authUser from '../middlewares/authUser.js';
import { addDepartment, addEmployee, addLeave, addSalary, adminEvaluation, approveHodLeave, approveLeave,
     changePassword,
     deleteDepartment, deleteEmployee, deleteLeave, fetchEmployees, forgotPassword, getAllAttendance, getAllDepartment, 
     getAllEmployees, getAllevaluations, getAllLeaves,getAllSalaries,getAttendance,getEmployeeDashboardData,getEmployeeLeaves,  
    getEmployeeSalaries, 
    getKpi, 
    getKpiByDepartment, 
    getLeaveToHod, 
    getUsers, 
    hodEvaluation, 
    rejectHodLeave, 
    rejectLeave, resetPassword, resumeLeave, submitKpi, updateAdminEvaluation, updateDepartment, updateEmployee, updateEvaluation, updateLeave,
    uploadAttendance,} from '../controller/adminController.js';
import upload from '../middlewares/multer.js';




const adminRouter = express.Router();

// routes for Department
adminRouter.post('/add-department', authUser, addDepartment );
adminRouter.get('/department-list', authUser,getAllDepartment );
adminRouter.post('/update-department', authUser, updateDepartment);
adminRouter.delete('/delete-department/:id',authUser, deleteDepartment);


// routes for Employee
adminRouter.post('/add-employee',authUser,  upload.fields([{ name: 'image', maxCount: 1 },{ name: 'cv', maxCount: 1 }  ]),  addEmployee);
adminRouter.get('/employee-list', authUser,fetchEmployees );
adminRouter.post('/update-employee', authUser, upload.fields([{ name: 'image', maxCount: 1 },{ name: 'cv', maxCount: 1 }  ]), updateEmployee);
adminRouter.delete('/delete-employee/:id', deleteEmployee);
adminRouter.get('/employee-leave',authUser, getEmployeeLeaves );
adminRouter.get('/get-all-employees', authUser, getAllEmployees);



// employee leave
adminRouter.post('/add-leave',authUser, addLeave );
adminRouter.get('/leave-list', getAllLeaves  );
adminRouter.post('/update-leave', updateLeave );
adminRouter.delete('/delete-leave/:id',authUser, deleteLeave);
adminRouter.post('/approve-leave',authUser, approveLeave );
adminRouter.post('/reject-leave',authUser, rejectLeave );
adminRouter.get('/employee-dashboard', authUser, getEmployeeDashboardData  );
adminRouter.post('/leave-resumed',authUser, resumeLeave );


// HOD Leaves
adminRouter.get('/hod-leave', authUser, getLeaveToHod);
adminRouter.post('/hod-approve',authUser, approveHodLeave );
adminRouter.post('/hod-reject',authUser, rejectHodLeave );




//salary Routes
adminRouter.post('/add-salary', authUser, upload.single('file'), addSalary);
adminRouter.get('/get-salaries', authUser, getAllSalaries);
adminRouter.get('/get-employee-salaries', authUser, getEmployeeSalaries);


// Password Category

adminRouter.post('/change-password',authUser, changePassword);
adminRouter.post('/forgot-password',  forgotPassword)
adminRouter.post("/reset-password/:token", resetPassword)


// Performance evaluation
adminRouter.post('/admin-evaluation',authUser,adminEvaluation);
adminRouter.post('/update-admin-evaluation',authUser, updateAdminEvaluation);
adminRouter.post('/hod-evaluation',authUser, hodEvaluation);
adminRouter.get('/evaluation-list', authUser, getAllevaluations);
adminRouter.post('/update-evaluation',authUser,updateEvaluation);
adminRouter.get('/search-users', authUser, getUsers);

// employee KPI
adminRouter.post('/kpi',authUser,submitKpi);
adminRouter.get('/get-kpi', authUser, getKpi);
adminRouter.get('/get-departmentkpi', authUser, getKpiByDepartment);
adminRouter.get('/get-employees', authUser, getAllEmployees);

//Attendance
adminRouter.post('/add-attendance', authUser, upload.single('file'), uploadAttendance);
adminRouter.get('/report/:month', authUser, getAttendance);
adminRouter.get('/get-Attendance', authUser, getAllAttendance);

export default adminRouter;
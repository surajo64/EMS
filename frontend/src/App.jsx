import React, { useContext, useEffect, useState } from 'react';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/login';
import AdminDashboard from './pages/adminDashboard';
import EmployeeDashboard from './pages/emplyeeDashboard';
import Employee from './pages/employee.jsx';
import Department from './pages/department.jsx';
import Leave from './pages/leave.jsx';
import HodLeave from './pages/hodLeave.jsx'
import Setting from './pages/setting.jsx';
import Salary from './pages/salary.jsx';
import HodDashboar from './pages/hodDashboard.jsx'
import Profile from './pages/EmployeeProfile.jsx';
import EmployeeLeave from './pages/employeeLeave.jsx';
import EmployeeSetting from './pages/employeeSetting.jsx';
import EmployeeSalary from './pages/employeeSalary.jsx';
import { AppContext } from './context/AppContext';
import Navbar from './components/Navbar.jsx';
import Sidebar from './components/Sidebar.jsx';
import Attendance from './pages/attendance.jsx'
import Evaluation from './pages/evaluation.jsx';
import KPI from './pages/employeeKpi.jsx'
import AdminEvaluation from './pages/adminEvaluation.jsx'
import ForgetPassword from './pages/ForgotPassword.jsx'
import ResetPassword from './pages/resetPassword.jsx'
import EmployeeLoan from './pages/employeeLoan.jsx'
import Loan from './pages/loan.jsx'
import LoadingOverlay from './components/loadingOverlay.jsx';

const App = () => {
  const { token } = useContext(AppContext);

 const location = useLocation();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Show overlay briefly during route change
    setLoading(true);

    const timeout = setTimeout(() => {
      setLoading(false);
    }, 500); // Adjust duration as needed

    return () => clearTimeout(timeout);
  }, [location.pathname]);
  return (
    <>
      <ToastContainer />
      {loading && <LoadingOverlay />}
      {token ? (
        <div className=' bg-gray-100 min-h-[50px] max-h-full overflow-auto'>
          <Navbar />
          <div className='flex items-start'>
            <Sidebar />
            <Routes>
              <Route path='/admin-dashboard' element={<AdminDashboard />} />
              <Route path='/employee-dashboard' element={<EmployeeDashboard />} />
              <Route path='/hod-dashboard' element={<HodDashboar />} />
              <Route path='/employee' element={<Employee />} />
              <Route path='/department' element={<Department />} />
              <Route path='/leave' element={<Leave />} />
              <Route path='/loan' element={<Loan />} />
              <Route path='/salary' element={<Salary />} />
              <Route path='/setting' element={<Setting />} />

              <Route path='/profile' element={<Profile />} />
              <Route path='/employee-leave' element={<EmployeeLeave />} />
              <Route path='/employee-loan' element={<EmployeeLoan />} />
              <Route path='/employee-salary' element={<EmployeeSalary />} />
              <Route path='/hod-leave' element={<HodLeave />} />
              <Route path='/employee-kpi' element={<KPI />} />
              <Route path='/setting' element={<EmployeeSetting />} />
              <Route path='/evaluation' element={<Evaluation />} />
              <Route path='/admin-evaluation' element={<AdminEvaluation />} />
              <Route path='/attendence' element={<Attendance />} />

            </Routes>
          </div>
        </div>
      ) : (
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path='/login' element={<Login />} />
          <Route path='/forgot-password' element={<ForgetPassword />} />
          <Route path='/reset-password/:token' element={<ResetPassword />} />

        </Routes>
      )}
    </>
  );
};

export default App;

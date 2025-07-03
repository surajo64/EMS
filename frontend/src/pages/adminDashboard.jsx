import React from 'react';
import { AppContext, useAuth } from '../context/AppContext';
import {
  UserCircle,
  CalendarCheck,
  Building2,
  DollarSign
} from 'lucide-react';
import { useContext } from 'react';
import { useEffect } from 'react';
import { useState } from 'react';



const AdminDashboard = () => {
  const { token, user, backendUrl, getAllLeaves, leaves, setLeaves, getAllDepartment, department,
    employees, setEmployees, getAllEmployees } = useContext(AppContext)
  const [totalSalary, setTotalSalary] = useState(0);

  const [latestMonth, setLatestMonth] = useState("");
  const [latestYear, setLatestYear] = useState("");
  const [salaryGroups, setSalaryGroups] = useState([]);
  // Defensive fallback if leaves is undefined
  const pendingLeaves = leaves?.filter(leave => leave.status === "Pending") || [];
  const approvedLeaves = leaves?.filter(leave => leave.status === "Approved") || [];
  const rejectedLeaves = leaves?.filter(leave => leave.status === "Rejected") || [];

  useEffect(() => {
    const fetchSalaries = async () => {
      try {
        const res = await fetch(`${backendUrl}/api/admin/get-salaries`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await res.json();

        const salaryGroups = result.data || [];
        setSalaryGroups(salaryGroups);

        // ✅ Get the latest group (already sorted in backend)
        const latestGroup = salaryGroups[0]; // first one is latest

        if (latestGroup) {
          setTotalSalary(latestGroup.totalAmount || 0);
          setLatestMonth(latestGroup.month);
          setLatestYear(latestGroup.year);
        } else {
          setTotalSalary(0); // fallback if no data
        }
      } catch (error) {
        console.error("Error loading salaries:", error);
      }
    };

    fetchSalaries();
  }, []);




  // Fetch data on component mount
  useEffect(() => {
    getAllEmployees();
    getAllDepartment();
    getAllLeaves();
  }, [token]);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Greeting */}
      <div className="text-center mb-6 sm:mb-10 px-4">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800">
          KIRCT {token && user?.role === 'admin' ? 'ADMIN' : 'EMPLOYEE'} DASHBOARD
        </h1>
        <p className="text-sm sm:text-base md:text-lg text-gray-600 mt-2">
          Here's your dashboard overview
        </p>
      </div>


      {/* Top Summary Cards */}
      <div className="flex justify-center mb-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 w-full max-w-6xl">

          <Card
            title="Total Employees"
            value={`${employees?.filter(emp => emp.status === true).length ?? 0} Active`}
            icon={<UserCircle className="text-green-500 w-12 h-12" />}
            bg="bg-green-100"
            textColor="text-green-600"
          />


          <Card
            title="Departments"
            value={`${department?.length ?? 0} Active`}
            icon={<Building2 className="text-blue-500 w-12 h-12" />}
            bg="bg-blue-100"
            textColor="text-blue-600"
          />

          <Card
            title={`${latestMonth} ${latestYear} Payment`}
            value={`₦${totalSalary.toLocaleString()}`}
            icon={<DollarSign className="text-purple-500 w-12 h-12" />}
            bg="bg-purple-100"
            textColor="text-purple-600"
          />

          <Card
            title="Leave Applied"
            value={`${leaves?.length ?? 0} Applied`}
            icon={<CalendarCheck className="text-yellow-500 w-12 h-12" />}
            bg="bg-yellow-100"
            textColor="text-yellow-600"
          />
        </div>
      </div>

      {/* Leave Section */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold text-green-500">Leave Details</h2>
        <p className="text-gray-600 text-md">Overview of employee leave statuses</p>
      </div>

      <div className="flex justify-center">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl">
          <SmallCard
            title="Pending Requests"
            value={`${pendingLeaves.length} Pending`}
            icon={<CalendarCheck className="text-orange-500 w-8 h-8" />}
            bg="bg-orange-100"
            textColor="text-orange-600"
          />

          <SmallCard
            title="Approved Leaves"
            value={`${approvedLeaves.length} Approved`}
            icon={<CalendarCheck className="text-green-500 w-8 h-8" />}
            bg="bg-green-100"
            textColor="text-green-600"
          />

          <SmallCard
            title="Rejected Leaves"
            value={`${rejectedLeaves.length} Rejected`}
            icon={<CalendarCheck className="text-red-500 w-8 h-8" />}
            bg="bg-red-100"
            textColor="text-red-600"
          />

          <SmallCard
            title="Total Leaves"
            value={`${leaves?.length ?? 0} All Leaves`}
            icon={<CalendarCheck className="text-indigo-500 w-8 h-8" />}
            bg="bg-indigo-100"
            textColor="text-indigo-600"
          />

        </div>
      </div>

    </div>
  );
};

const SmallCard = ({ title, value, icon, bg, textColor }) => (
  <div className={`${bg} p-6 rounded-xl shadow hover:shadow-md transition w-full`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <h2 className={`text-xl font-semibold ${textColor}`}>{value}</h2>
      </div>
      {icon}
    </div>
  </div>
);

// Card Component for Reuse
const Card = ({ title, value, icon, bg, textColor }) => (
  <div className={`${bg} p-8 rounded-2xl shadow hover:shadow-lg transition w-full`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <h2 className={`text-3xl font-bold ${textColor}`}>{value}</h2>
      </div>
      {icon}
    </div>
  </div>
);

export default AdminDashboard;

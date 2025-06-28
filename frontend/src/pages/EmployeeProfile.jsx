import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
import axios from 'axios';

const employeeProfile = () => {
  const { token, user, backendUrl } = useContext(AppContext);

  const [dashboardData, setDashboardData] = useState({
    profile: null,
    leaves: [],
    currentMonthSalary: null
  });

  const fetchDashboardData = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/admin/employee-dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (data.success) {
        setDashboardData(data.data);
        console.log("Response:", data.data);
      }
    } catch (error) {
      console.error('Dashboard data fetch error:', error);
    }
  };

  useEffect(() => {
    if (token) {
      fetchDashboardData();
    }
  }, [token]);

  const employee = dashboardData.profile;

  if (!employee) return <div className="text-center mt-10">Loading profile...</div>;

  return (
   <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
  <div className="w-full max-w-6xl bg-white p-6 sm:p-10 rounded-xl shadow mx-auto">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
      
      {/* Left Column: Image and Name */}
      <div className="flex flex-col items-center text-center col-span-1">
        <h2 className="text-2xl sm:text-3xl font-bold text-green-700 mb-6">
          {employee.userId?.name?.toUpperCase()}
        </h2>
        <img
          src={backendUrl + `/upload/${employee.userId?.profileImage}`}
          alt="Profile"
          className="w-48 h-48 sm:w-56 sm:h-56 rounded-full object-cover border-4 border-gray-300 "
        />
        
      </div>

      {/* Right Column: Employee Details Table */}
      <div className="col-span-1 md:col-span-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm text-gray-700">
           {[
                { label: "Name", value: employee.userId?.name },
                { label: "Email", value: employee.userId?.email },
                { label: "Staff ID", value: employee.staffId },
                { label: "Department", value: employee.department?.name },
                { label: "Designation", value: employee.designation },
                { label: "DOB", value: new Date(employee.dob).toLocaleDateString() },
                { label: "Phone", value: employee.phone },
                { label: "Gender", value: employee.gender },
                { label: "Marital Status", value: employee.maritalStatus },
                { label: "State", value: employee.state },
                { label: "Address", value: employee.address },
                { label: "Join Date", value: new Date(employee.joinDate).toLocaleDateString() },
                { label: "Experience", value: employee.experience },
                { label: "Qualification", value: employee.qualification },
                { label: "Role", value: employee.userId?.role },
                {label: "CV", value: employee.cv ? (
                     <a href={`${backendUrl}/upload/${employee.cv}`}
                      target="_blank" rel="noopener noreferrer"
                      className="text-blue-600 underline block mb-2">
                      View Uploaded CV</a>
                  ) : (
                    <span className="text-red-500">No CV uploaded</span>
                  )
                },


              ].map((item, index) => (
                <div key={index} className="flex border-b py-2">
                  <div className="font-semibold w-40">{item.label}:</div>
                  <div className="text-gray-800">{item.value}</div>
                </div>
              ))}
        </div>
      </div>
    </div>
  </div>
</div>

  );
};

export default employeeProfile;

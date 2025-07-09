import React, { useContext } from "react";
import { NavLink } from "react-router-dom";
import { assets } from "../assets/assets";
import { AppContext } from "../context/AppContext";

const Sidebar = () => {
  const { logout, user, token } = useContext(AppContext);

  return (
    <div className="min-h-screen bg-white border-r p-4">
      {/* Admin Sidebar */}
      {token && user?.role === 'admin' && (
        <nav>
          <ul className="space-y-4">
            <SidebarLink to="/admin-dashboard" label="Dashboard" icon={assets.Home} />
            <SidebarLink to="/employee" label="Employee" icon={assets.Emplyees} />
            <SidebarLink to="/department" label="Department" icon={assets.Department} />
            <SidebarLink to="/leave" label="Leave" icon={assets.Leave} />
            <SidebarLink to="/loan" label="Loan" icon={assets.Salary} />
            <SidebarLink to="/salary" label="Salary" icon={assets.Salary} />
            <SidebarLink to="/attendence" label="Attendance" icon={assets.Attend} />
            <SidebarLink to="/admin-evaluation" label="Performance" icon={assets.Evaluation} />
            <SidebarLink to="/setting" label="Setting" icon={assets.Setting} />

          </ul>
        </nav>
      )}

      {/* Employee Sidebar */}
      {token && user?.role === "employee" && (
        <nav>
          <ul className="space-y-4">
            <SidebarLink to="/employee-dashboard" label="Dashboard" icon={assets.Home} />
            <SidebarLink to="/profile" label="My Profile" icon={assets.Emplyees} />
            <SidebarLink to="/employee-leave" label="Leave" icon={assets.Leave} />
            <SidebarLink to="/employee-loan" label="Loan" icon={assets.Salary} />
            <SidebarLink to="/employee-salary" label="Salary" icon={assets.Salary} />
             <SidebarLink to="/employee-kpi" label="KPI" icon={assets.Evaluation} />
            <SidebarLink to="/setting" label="Change Password" icon={assets.Setting} />
            
           
          </ul>
        </nav>
      )}

      {/* HOD Sidebar */}
      {token && user?.role === "HOD" && (
        <nav>
          <ul className="space-y-4">
            <SidebarLink to="/hod-dashboard" label="Dashboard" icon={assets.Home} />
            <SidebarLink to="/profile" label="My Profile" icon={assets.Emplyees} />
            <SidebarLink to="/hod-leave" label="Leave" icon={assets.Leave} />
            <SidebarLink to="/employee-loan" label="Loan" icon={assets.Salary} />
            <SidebarLink to="/employee-salary" label="Salary" icon={assets.Salary} />
            <SidebarLink to="/attendence" label="Attendance" icon={assets.Attend} />
            <SidebarLink to="/evaluation" label="Performance" icon={assets.Evaluation} />
            <SidebarLink to="/setting" label="Change Password" icon={assets.Setting} />
          </ul>
        </nav>
      )}
    </div>
  );
};

// ✅ Small reusable SidebarLink component
const SidebarLink = ({ to, label, icon }) => (
  <li>
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 py-3.5 px-3 md:px-6 md:min-w-60 rounded-xl cursor-pointer ${isActive ? "bg-gray-200 border-l-4 border-green-500" : ""
        }`
      }
    >
      <img src={icon} alt={label} className="w-6 h-6 mr-2" />
      <p>{label}</p>
    </NavLink>
  </li>
);

export default Sidebar;

import React, { useState } from 'react'
import { assets } from '../assets/assets'
import { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext, useAuth } from '../context/AppContext'



const Navbar = () => {

 const { token, user,setToken } = useAuth();
 const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate()



  const logout = () => {
    if (token) {
      setToken('');
      localStorage.removeItem('token');
      navigate('/login')

    };

  }

const roleTitle =
    user?.role === 'admin' ? 'Admin'
    : user?.role === 'HOD' ? 'HOD'
    : 'Employee';

  return (
    <div className="bg-white border-b rounded px-4 sm:px-10 py-4 shadow-sm">
  <div className="flex items-center justify-between flex-wrap">
    
    {/* Center: Welcome Message (visible on sm+) */}
    <div className="hidden sm:block flex-grow text-center order-1 sm:order-none">
      <p className="text-lg sm:text-xl font-semibold text-green-600">
        Welcome Back: {user?.name || "Admin"}
      </p>
    </div>

    {/* Right: Title + Mobile Toggle Button */}
    <div className="flex items-center gap-2 order-2 sm:order-none ml-auto">
      <h1 className="text-green-500 text-xl font-bold uppercase tracking-wide">
        {token && roleTitle} Dashboard
      </h1>

      {/* Hamburger Menu (small screens only) */}
      <button
        className="sm:hidden ml-2 text-gray-600 focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
          />
        </svg>
      </button>
    </div>

    {/* Logout Button (right on sm+) */}
    <div className="hidden sm:flex justify-end order-3">
      <button
        onClick={logout}
        className="bg-green-500 hover:bg-green-600 text-white text-sm font-medium px-6 py-2 rounded-full transition"
      >
        Logout
      </button>
    </div>
  </div>

  {/* Mobile Dropdown Menu */}
  {isOpen && (
    <div className="sm:hidden mt-4 space-y-2 text-center">
      <p className="text-green-600 font-semibold text-lg">
        Welcome Back: {user?.name || "Admin"}
      </p>
      <button
        onClick={logout}
        className="bg-green-500 hover:bg-green-600 text-white text-sm font-medium px-6 py-2 rounded-full transition"
      >
        Logout
      </button>
    </div>
  )}
</div>

  );
};
export default Navbar

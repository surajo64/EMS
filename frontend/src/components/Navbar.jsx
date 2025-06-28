import React from 'react'
import { assets } from '../assets/assets'
import { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext, useAuth } from '../context/AppContext'



const Navbar = () => {

 const { token, user,setToken } = useAuth();

  const navigate = useNavigate()



  const logout = () => {
    if (token) {
      setToken('');
      localStorage.removeItem('token');
      navigate('/login')

    };





  }
  return (
    <div className="bg-white border-b rounded px-4 sm:px-10 py-4 shadow-sm">
  <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
    
    {/* Dashboard Title */}
    <div className="flex items-center gap-2">
      <h1 className="text-green-500 text-xl font-bold uppercase tracking-wide">
        {token && user?.role === 'admin' ? 'Admin'  : user?.role === 'HOD' ? 'HOD' : 'Employee'} Dashboard

      </h1>
    </div>

    {/* Welcome Message - Centered on larger screens */}
    <div className="flex-grow text-center sm:text-center">
      <p className="text-lg sm:text-xl font-semibold text-green-600">
        Welcome Back: {user?.name || "Admin"}
      </p>
    </div>

    {/* Logout Button */}
    <div className="flex justify-end">
      <button
        onClick={logout}
        className="bg-green-500 hover:bg-green-600 text-white text-sm font-medium px-6 py-2 rounded-full transition"
      >
        Logout
      </button>
    </div>
  </div>
</div>

  )
}

export default Navbar

import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client"; // ✅ import socket.io-client
import { AppContext } from "../context/AppContext";

const Navbar = () => {
  const { token, backendUrl, setToken, user } = useContext(AppContext);
  const [isOpen, setIsOpen] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [messages, setMessages] = useState([]);
  const [showRead, setShowRead] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);

  const navigate = useNavigate();

  // ✅ Setup socket instance
  useEffect(() => {
    if (!user?._id) return;

    const socket = io(backendUrl, {
      auth: { token }, // optional auth
    });

    socket.emit("join", user._id); // join private room

    // listen for new messages
    socket.on("newMessage", () => {
      fetchMessages();
    });

    // listen for read updates
    socket.on("messageRead", () => {
      fetchMessages();
    });

    return () => {
      socket.disconnect();
    };
  }, [user, token, backendUrl]);

  // ✅ fetch messages (reusable)
  const fetchMessages = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/auth/get-message`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        setMessages(data.messages);
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  // initial load
  useEffect(() => {
    if (token) {
      fetchMessages();
    }
  }, [token]);

  const logout = () => {
    if (token) {
      setToken("");
      localStorage.removeItem("token");
      navigate("/login");
    }
  };

  const markMessageRead = async (id) => {
    try {
      await axios.put(
        `${backendUrl}/api/auth/mark-read/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // no need to call fetchMessages manually
      // socket will trigger auto update
    } catch (err) {
      console.error("Error marking message read:", err);
    }
  };

  // ✅ unread filter
  const unreadMessages = (messages || []).filter((msg) => {
  // skip if I am the sender
  if (msg.createdBy?._id === user._id || msg.createdBy === user._id) {
    return false;
  }

  const myReadStatus = msg.isRead?.find(
    (r) => r.userId === user._id || r.userId?._id === user._id
  );

  return !myReadStatus || myReadStatus.read === false;
});


  const latestUnreadMessages = unreadMessages.slice(0, 5);

  const roleTitle =
    user?.role === "admin" ? "Admin" : user?.role === "HOD" ? "HOD" : "Employee";

  return (
    <div className="bg-white border-b rounded px-4 sm:px-10 py-4 shadow-sm relative">
      <div className="flex items-center justify-between flex-wrap">
        {/* Left: Title + Toggle */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start order-2 sm:order-1">
          <h1 className="text-green-500 text-xl font-bold uppercase tracking-wide">
            {token && roleTitle} Dashboard
          </h1>

          {/* Hamburger Toggle */}
          <button
            className="sm:hidden text-gray-600 focus:outline-none"
            onClick={() => setIsOpen(!isOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={
                  isOpen
                    ? "M6 18L18 6M6 6l12 12"
                    : "M4 6h16M4 12h16M4 18h16"
                }
              />
            </svg>
          </button>
        </div>

        {/* Center: Welcome */}
        <div className="hidden sm:block flex-grow text-center order-1 sm:order-2">
          <p className="text-lg sm:text-xl font-semibold text-green-600">
            Welcome Back: {user?.name || "Admin"}
          </p>
        </div>

        {/* Right: Notifications + Logout */}
        <div className="hidden sm:flex items-center gap-4 justify-end order-3 relative">
          {/* Notification Icon */}
          <div className="relative">
            <button
              onClick={() => setShowMessages(!showMessages)}
              className="relative focus:outline-none"
            >
              {/* Bell Icon */}
              <svg
                className="w-7 h-7 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 
                  2.032 0 0118 14.158V11a6.002 
                  6.002 0 00-4-5.659V5a2 
                  2 0 10-4 0v.341C7.67 
                  6.165 6 8.388 6 
                  11v3.159c0 .538-.214 
                  1.055-.595 1.436L4 
                  17h5m6 0v1a3 3 0 
                  11-6 0v-1m6 0H9"
                />
              </svg>

              {/* Badge update */}
              {unreadMessages.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {unreadMessages.length}
                </span>
              )}

            </button>

            {/* Dropdown */}
            {showMessages && (
              <div className="absolute right-0 mt-2 w-64 bg-white border rounded-lg shadow-lg z-50">
                <div className="p-2 border-b text-gray-700 font-bold">
                  Messages
                </div>
                <ul className="max-h-60 overflow-y-auto font-semibold">

                  {latestUnreadMessages.length > 0 ? (
                    latestUnreadMessages.map((msg) => (
                      <li
                        key={msg._id}
                        onClick={() => {
                          markMessageRead(msg._id); // will update isRead for this user
                          setSelectedMessage(msg);
                          setShowRead(true);
                        }}
                        className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                      >
                        {msg.title}
                      </li>
                    ))
                  ) : (
                    <li className="px-4 py-2 text-sm text-gray-500">
                      No unread messages
                    </li>
                  )}
                </ul>

                <div className="p-2 text-center border-t">
                  <button
                    onClick={() => navigate("/messages")} // ✅ link to all messages
                    className="text-green-600 text-sm font-medium hover:underline"
                  >
                    View All
                  </button>
                </div>
              </div>
            )}


            {/* ✅ Read Message Modal */}
            {showRead && selectedMessage && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md relative">
                  <button
                    onClick={() => {
                      setShowRead(false);
                      setSelectedMessage(null);
                    }}
                    className="absolute top-3 right-3 text-gray-500 hover:text-red-600"
                  >
                    ✖
                  </button>

                  <h2 className="text-lg font-bold mb-2 text-green-600">
                    {selectedMessage.title}
                  </h2>

                  <p className="text-gray-700 mb-4 whitespace-pre-wrap">
                    {selectedMessage.text}
                  </p>

                  <div className="text-sm text-gray-500 space-y-1">
                    <p>
                      <span className="font-semibold">From:</span>{" "}
                      {selectedMessage.createdBy?.name} (
                      {selectedMessage.createdBy?.email})
                    </p>
                    <p>
                      <span className="font-semibold">To:</span>{" "}
                      {selectedMessage.userId?.name} ({selectedMessage.userId?.email})
                    </p>
                    <p>
                      <span className="font-semibold">Date:</span>{" "}
                      {new Date(selectedMessage.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Logout */}
          <button
            onClick={logout}
            className="bg-green-500 hover:bg-green-600 text-white text-sm font-medium px-6 py-2 rounded-full transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
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

export default Navbar;

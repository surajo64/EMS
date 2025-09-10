import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";

const SendMessage = () => {
  const { token, backendUrl, user, messages, setMessages, fetchMessages } =
    useContext(AppContext);

  const [employees, setEmployees] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [message, setMessage] = useState("");
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showRead, setShowRead] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const markMessageRead = async (id) => {
  try {
    await axios.put(
      `${backendUrl}/api/auth/mark-read/${id}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchMessages(); // reload updated messages
  } catch (err) {
    console.error("Error marking message read:", err);
  }
};


  // ✅ Fetch employees for HR/Admin
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const { data } = await axios.get(
          backendUrl + "/api/admin/get-all-employees",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (data.success) setEmployees(data.employees);
      } catch (err) {
        console.error("Error fetching employees", err);
      }
    };
    if (user?.role === "admin" || user?.role === "HR") {
      fetchEmployees();
    }
  }, [token, user, backendUrl]);

  // ✅ Send Message
  const handleSend = async (e) => {
    e.preventDefault();
    if (!selectedEmployees.length || !message.trim()) {
      setStatus("Please select at least one employee and type a message.");
      return;
    }

    try {
      const { data } = await axios.post(
        backendUrl + "/api/auth/send-message",
        { userIds: selectedEmployees, text: message, title },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success("Message sent successfully ✅");
        setMessages((prev) => [...prev, ...data.messages]);
        setMessage("");
        setTitle("");
        setSelectedEmployees([]);
        setShowForm(false);
      }
    } catch (err) {
      console.error("Error sending message:", err);
      toast.error("Error sending message ❌");
    }
  };

  // ✅ Delete Message
  const handleDelete = async (id) => {
    try {
      const { data } = await axios.delete(
        backendUrl + `/api/auth/delete/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success("Message deleted ✅");
        setMessages((prev) => prev.filter((m) => m._id !== id));
        setConfirmDeleteId(null);
      } else {
        toast.error("Failed to delete message");
      }
    } catch (err) {
      console.error("Error deleting message:", err);
      toast.error("Error deleting message ❌");
    }
  };

  // ✅ Search filter
  useEffect(() => {
    const filtered = (messages || []).filter((m) =>
      m.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredMessages(filtered);
    setCurrentPage(1);
  }, [searchTerm, messages]);

  // ✅ Pagination logic
  const totalItems = filteredMessages.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const paginatedMessages = filteredMessages.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setFilteredMessages(messages || []);
    setCurrentPage(1);
  }, [messages]);

  useEffect(() => {
    if (token) fetchMessages();
  }, [token]);

  if (user?.role !== "admin" && user?.role !== "HR") {
    return (
      <p className="text-red-500">
        You are not authorized to send messages.
      </p>
    );
  }

  // ✅ Handle employee selection (including select all)
  const handleSelectEmployees = (e) => {
    const values = Array.from(e.target.selectedOptions, (opt) => opt.value);

    if (values.includes("all")) {
      if (selectedEmployees.length === employees.length) {
        setSelectedEmployees([]);
      } else {
        setSelectedEmployees(employees.map((emp) => emp._id));
      }
    } else {
      setSelectedEmployees(values.filter((val) => val !== "all"));
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 text-center">
      <p className="text-xl sm:text-2xl font-bold text-gray-800 mt-5">
        MANAGE MESSAGES
      </p>

      {/* Search and Add */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mt-4">
        <input
          type="text"
          placeholder="Search messages..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 border rounded-md focus:ring-2 focus:ring-green-500 w-full sm:w-1/3"
        />
        <button
          onClick={() => setShowForm(true)}
          className="bg-green-500 text-white py-2 px-4 rounded-md text-sm hover:bg-green-600"
        >
          Send Message
        </button>
      </div>

      {/* Messages List */}
      <div className="bg-white mt-6 rounded-lg shadow overflow-x-auto text-sm max-h-[80vh] min-h-[60vh]">
        <div className="bg-gray-200 hidden sm:grid grid-cols-[0.5fr_2fr_2fr_3fr_2fr] py-3 px-6 rounded-t-xl border-b-4 border-green-500 font-semibold text-gray-700">
          <p>#</p>
          <p>From</p>
          <p>Title</p>
          <p>Message</p>
          <p>Actions</p>
        </div>

        {paginatedMessages.length > 0 ? (
          paginatedMessages.map((item, index) => (
            <div
              key={item._id}
              className="flex flex-col sm:grid sm:grid-cols-[0.5fr_2fr_3fr_2fr_2fr] items-start sm:items-center text-gray-500 py-3 px-6 border-b hover:bg-blue-50 gap-2"
            >
              <p>{(currentPage - 1) * itemsPerPage + index + 1}</p>
               <p>{item.createdBy?.name || "Unknown"}</p>
              <p>{item.title}</p>
              <p className="truncate">{item.text}</p>
             
              <div className="flex sm:justify-end gap-2">
                <button
                  onClick={() => {
                    markMessageRead()
                    setShowRead(true)}}
                  className="bg-green-500 text-white text-sm px-3 py-1 rounded-full"
                >
                  Read
                </button>
                <button
                  onClick={() => setConfirmDeleteId(item._id)}
                  className="bg-red-500 text-white text-sm px-3 py-1 rounded-full"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center py-5 text-gray-500">No messages found.</p>
        )}

      </div>

      {/* ✅ Pagination */}
      {totalPages > 1 && (
        <>
          <div className="flex justify-center items-center flex-wrap gap-2 mt-4 px-4 pb-4">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="text-white px-3 py-1 bg-blue-500 hover:bg-blue-800 rounded disabled:opacity-50"
            >
              Prev
            </button>

            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 rounded ${currentPage === i + 1
                    ? "bg-green-500 text-white"
                    : "bg-gray-100 hover:bg-gray-200"
                  }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="text-white px-3 py-1 bg-blue-500 hover:bg-blue-800 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>

          <div className="flex justify-end mt-2 text-sm text-gray-800 px-4 pb-2">
            Showing {(currentPage - 1) * itemsPerPage + 1}–
            {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}
          </div>
        </>
      )}

      {/* ✅ Send Form Modal */}
      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md relative">
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-red-600"
            >
              ✖
            </button>

            <h2 className="text-lg font-bold mb-4 text-green-600">
              Send Message
            </h2>
            {status && <p className="mb-2 text-sm text-gray-600">{status}</p>}

            <form onSubmit={handleSend} className="space-y-4">
              <select
                multiple
                value={selectedEmployees}
                onChange={handleSelectEmployees}
                className="w-full border px-3 py-2 rounded h-40"
              >
                <option value="all">
                  {selectedEmployees.length === employees.length
                    ? "Unselect All"
                    : "Select All"}
                </option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.name} ({emp.email})
                  </option>
                ))}
              </select>

              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Type the subject"
                className="w-full border px-3 py-2 rounded"
              />
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="w-full border px-3 py-2 rounded"
                rows="4"
              />

              <button
                type="submit"
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg w-full"
              >
                Send
              </button>
            </form>
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

      {/* ✅ Confirm Delete Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow-md max-w-sm">
            <p className="text-red-500 mb-4 font-semibold">
              Are you sure you want to delete this message?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDeleteId)}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SendMessage;

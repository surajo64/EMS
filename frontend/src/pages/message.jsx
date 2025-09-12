import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";

const SendMessage = () => {
  const { token, backendUrl, user, messages, setMessages, fetchMessages } =
    useContext(AppContext);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");
  const [replyToAll, setReplyToAll] = useState(true); // true = reply to all, false = reply to sender only
  const [tab, setTab] = useState("inbox"); // "inbox" or "sent"
  const [users, setUsers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
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

  // ✅ Mark message as read
  const markMessageRead = async (id) => {
    try {
      await axios.put(
        `${backendUrl}/api/auth/mark-read/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchMessages();
    } catch (err) {
      console.error("Error marking message read:", err);
    }
  };

  // ✅ Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await axios.get(
          `${backendUrl}/api/admin/get-all-users`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (data.success) {
          setUsers(data.users);
        }
      } catch (err) {
        console.error("Error fetching users", err);
      }
    };
    fetchUsers();
  }, [token, backendUrl, user]);

  // ✅ Send message
  const handleSend = async (e) => {
    e.preventDefault();
    if (!selectedUsers.length || !message.trim()) {
      setStatus("Please select at least one user and type a message.");
      return;
    }

    try {
      const { data } = await axios.post(
        `${backendUrl}/api/auth/send-message`,
        { userIds: selectedUsers, text: message, title },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success("Message sent successfully ✅");
        setMessages(prev => [data.message, ...prev]); // add new message to list
        setTitle("");
        setMessage("");
        setSelectedUsers([]);
        setStatus("");
        fetchMessages();
        setShowForm(false);
      }
    } catch (err) {
      console.error("Error sending message:", err);
      toast.error("Error sending message ❌");
    }
  };

  // ✅ Remove User from Message (never delete entire message)
  const handleDelete = async (id) => {
    try {
      const { data } = await axios.delete(
        backendUrl + `/api/auth/delete/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success("Message removed from your inbox ✅");

        // Update local state to remove the message from view
        setMessages((prev) => prev.filter((m) => m._id !== id));
        setConfirmDeleteId(null);
      } else {
        toast.error("Failed to remove message");
      }
    } catch (err) {
      console.error("Error removing message:", err);
      toast.error("Error removing message ❌");
    }
  };

  // ✅ Inbox & Sent Filters
  const inboxMessages = (messages || []).filter((msg) =>
    msg.recipients?.some(
      (r) =>
        r._id?.toString() === user._id?.toString() ||
        r._id?.toString() === user.id?.toString()
    )
  );

  const sentMessages = (messages || []).filter(
    (msg) =>
      msg.createdBy?._id?.toString() === user._id?.toString() ||
      msg.createdBy?._id?.toString() === user.id?.toString()
  );



  // ✅ Apply search & tab filter
  useEffect(() => {
    let list = tab === "inbox" ? inboxMessages : sentMessages;
    if (searchTerm.trim() !== "") {
      list = list.filter((m) =>
        m.title?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredMessages(list);
    setCurrentPage(1);
  }, [tab, searchTerm, messages]);

  // ✅ Pagination
  const totalItems = filteredMessages.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedMessages = filteredMessages.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    if (token)
      fetchMessages();
    console.log("Logged in user:", user);
    console.log("All messages:", messages);
  }, [token, messages, user]);


  // ✅ Handle multi-select checkbox
  const handleSelectUser = (userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

// handle replay
  const handleReply = async () => {
  try {
    if (!replyMessage.trim()) return;
    
    const { data } = await axios.post(
      `${backendUrl}/api/auth/messages/${selectedMessage._id}/reply`,
      {
        message: replyMessage,
        replyToAll: replyToAll
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (data.success) {
      toast.success("Reply sent successfully!");
      setReplyMessage("");
      setShowReplyForm(false);
      
      // Update the selected message with the new reply
      setSelectedMessage(data.updatedMessage);
      
      // Optional: Refresh the messages list
      fetchMessages();
    }
  } catch (err) {
    console.error("Error sending reply:", err);
    toast.error("Failed to send reply");
  }
};


  return (
    <div className="w-full max-w-6xl mx-auto px-4 text-center">
      <p className="text-xl sm:text-2xl font-bold text-gray-800 mt-5">
        MANAGE MESSAGES
      </p>

      {/* Tabs */}
      <div className="mt-4 flex justify-center space-x-4">
        <button
          className={`px-4 py-2 rounded-t-lg border-b-2 ${tab === "inbox"
            ? "border-green-500 text-green-700 font-semibold"
            : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          onClick={() => setTab("inbox")}
        >
          Inbox
        </button>
        <button
          className={`px-4 py-2 rounded-t-lg border-b-2 ${tab === "sent"
            ? "border-green-500 text-green-700 font-semibold"
            : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          onClick={() => setTab("sent")}
        >
          Sent
        </button>
      </div>

      {/* Search & Add */}
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
                    markMessageRead(item._id);
                    setSelectedMessage(item);
                    setShowRead(true);
                  }}
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

      {/* Pagination */}
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
              onClick={() => {
                setShowForm(false),
                  fetchMessages()
              }}
              className="absolute top-3 right-3 text-gray-500 hover:text-red-600"
            >
              ✖
            </button>
            <h2 className="text-lg font-bold mb-2">Send Message</h2>
            {status && <p className="text-red-500 mb-2">{status}</p>}

            <form onSubmit={handleSend}>
              <div className="mb-2 max-h-40 overflow-y-auto border p-2 rounded text-right">
                {/* ✅ Select All / Deselect All */}
                <label className="flex justify-end items-center font-semibold mb-1 space-x-2">
                  <span>Select All</span>
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === users.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUsers(users.map(user => user._id));
                      } else {
                        setSelectedUsers([]);
                      }
                    }}
                    className="ml-2"
                  />
                </label>

                {/* ✅ Individual users */}
                {users.map(user => (
                  <label key={user._id} className="flex justify-end items-center mb-1 space-x-2">
                    <span>{user.name} ({user.role})</span>
                    <input
                      type="checkbox"
                      value={user._id}
                      checked={selectedUsers.includes(user._id)}
                      onChange={() => {
                        setSelectedUsers(prev =>
                          prev.includes(user._id)
                            ? prev.filter(id => id !== user._id)
                            : [...prev, user._id]
                        );
                      }}
                      className="ml-2"
                    />
                  </label>
                ))}
              </div>
              <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="border p-2 w-full mb-2 rounded"
              />

              <textarea
                placeholder="Type your message"
                value={message}
                onChange={e => setMessage(e.target.value)}
                className="border p-2 w-full mb-2 rounded"
              />

              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
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
                setShowReplyForm(false);
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
                {selectedMessage.createdBy?.name}
              </p>
              <p>
                <span className="font-semibold">To:</span>{" "}
                {selectedMessage.recipients
                  ?.map((r) => `${r.name}`)
                  .join(", ")}
              </p>
              <p>
                <span className="font-semibold">Date:</span>{" "}
                {new Date(selectedMessage.createdAt).toLocaleString()}
              </p>
            </div>

            {/* Reply Button */}
            {!showReplyForm && (
              <button
                onClick={() => setShowReplyForm(true)}
                className="text-green-500 mt-4 hover:underline"
              >
                Reply
              </button>
            )}

            {/* Reply Form */}
            {showReplyForm && (
              <div className="mt-4 p-3 border rounded-lg">
                <div className="flex space-x-2 mb-3">
                  <button
                    onClick={() => setReplyToAll(true)}
                    className={`px-3 py-1 rounded ${replyToAll
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 text-gray-700"
                      }`}
                  >
                    Reply to All
                  </button>
                  <button
                    onClick={() => setReplyToAll(false)}
                    className={`px-3 py-1 rounded ${!replyToAll
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 text-gray-700"
                      }`}
                  >
                    Reply to Sender
                  </button>
                </div>

                <textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type your reply here..."
                  className="w-full p-2 border rounded mb-3"
                  rows="4"
                />

                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => {
                      setShowReplyForm(false);
                      setReplyMessage("");
                    }}
                    className="px-3 py-1 bg-gray-300 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReply}
                    disabled={!replyMessage.trim()}
                    className={`px-3 py-1 rounded ${!replyMessage.trim()
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-green-500 text-white hover:bg-green-600"
                      }`}
                  >
                    Send Reply
                  </button>
                </div>
              </div>
            )}

            {/* Display Existing Replies */}
            {selectedMessage.replies && selectedMessage.replies.length > 0 && (
              <div className="mt-4 border-t pt-3">
                <h3 className="font-semibold mb-2">Replies:</h3>
                {selectedMessage.replies.map((reply, index) => (
                  <div key={index} className="bg-gray-100 p-2 rounded mb-2">
                    <p className="text-sm">{reply.message}</p>
                    <p className="text-xs text-gray-500">
                      By: {reply.userId?.name || "Unknown"} •{" "}
                      {new Date(reply.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
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

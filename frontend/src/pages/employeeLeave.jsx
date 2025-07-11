import React, { useState, useEffect, useContext } from 'react';
import { toast } from "react-toastify";
import axios from 'axios';
import { AppContext } from '../context/AppContext';
import LoadingOverlay from '../components/loadingOverlay.jsx';


const employeeLeave = () => {
  const { token, backendUrl, leaves, fetchLeaves, getEmployeeLeaves } = useContext(AppContext);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [leave, setLeave] = useState('');
  const [reason, setReason] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [editingLeave, setEditingLeave] = useState(null);
  const [filteredLeaves, setFilteredLeaves] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5

  const onSubmitHandler = async (event) => {

    event.preventDefault();
setIsLoading(true);
    const formData = { leave, reason, from, to };
    try {


    if (editingLeave && editingLeave._id) {
      const { data } = await axios.post(
        backendUrl + '/api/admin/update-leave',
        { leaveid: editingLeave._id, ...formData },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success("Leave updated successfully!");
        setShowForm(false);
        fetchLeaves();
      }
    } else {
      const { data } = await axios.post(
        backendUrl + "/api/admin/add-leave",
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );


      if (data.success) {
        toast.success("Leave added successfully!");
        setLeave("");
        setReason("");
        setFrom("");
        setTo("")
        fetchLeaves();
        setShowForm(false);

      } else {
        toast.error(data.message);
      }
    }
     } catch (error) {
        
        toast.error(error.response?.data?.message || error.message);
      }finally {
      setIsLoading(false);
    }

  }
  const handleDelete = async (id) => {
    const { data } = await axios.delete(
      backendUrl + `/api/admin/delete-leave/${id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (data.success) {
      toast.success(data.message);
      setConfirmDeleteId(null);
      fetchLeaves();
    } else {
      toast.error("Failed to delete department");
    }
  };


  const handleClose = () => {
    setIsLoading(true);
    setTimeout(() => {
    setShowForm(false);
    fetchLeaves();
    setIsLoading(false);
                  }, 300);
  };

  const handleAddNew = () => {
    setIsLoading(true);
    setTimeout(() => {
    setShowForm(true);
    setEditingLeave(null)
    setIsLoading(false);
                  }, 300);
  };

  const handleUpdate = (item) => {
    setIsLoading(true);
    setTimeout(() => {
    setEditingLeave(item);
    setLeave(item.leave);
    setReason(item.reason);
    setFrom(new Date(item.from).toISOString().split('T')[0]);
    setTo(new Date(item.to).toISOString().split('T')[0]);
    setShowForm(true);
       setIsLoading(false);
                  }, 300);
  };


  const handleView = (leaves) => {
    setIsLoading(true);
    setTimeout(() => {
      setSelectedLeave(leaves);
      setIsLoading(false);
    }, 300);
  };


  useEffect(() => {
    if (token) {
      fetchLeaves();
    }
  }, [token, searchTerm]);


  // Filter departments based on search
  useEffect(() => {
    const filtered = (leaves || []).filter((l) =>
      l.leave.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredLeaves(filtered);
    setCurrentPage(1); // Reset to first page on new search
  }, [searchTerm, leaves]);

  // Pagination logic
  const totalItems = leaves?.length;
  const totalPages = Math.ceil(filteredLeaves.length / itemsPerPage);
  const paginatedLeaves = filteredLeaves.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );


  const restrictedLeaves = ["Annual Leave", "Study Leave", "Sabbatical Leave", "Leave of Absence"];
  const today = new Date();
  const todayISO = today.toISOString().split("T")[0];

  const getFutureDate = (daysAhead) => {
    const date = new Date();
    date.setDate(date.getDate() + daysAhead);
    return date.toISOString().split("T")[0];
  };

  const isRestrictedLeave = restrictedLeaves.includes(leave);
  const minFromDate = isRestrictedLeave ? getFutureDate(14) : todayISO;

  useEffect(() => {
    setFrom("");
    setTo("");
  }, [leave]);




  return (
    <div className='w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8'>
      <p className="text-2xl font-bold text-gray-800 text-center">EMPLOYEE LEAVE</p>

      {/* Search & Button */}
      <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center mt-4 gap-4'>
        <input
          type='text'
          placeholder='Search by Department Name...'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className='px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 w-full sm:w-1/2'
        />
        <button
          onClick={handleAddNew}
          className="bg-blue-500 text-white py-2 px-4 rounded-md text-sm hover:bg-blue-600 transition"
        >
          Apply Leave
        </button>
      </div>

      {/* Table Scroll Wrapper */}
      <div className='bg-white mt-6 rounded-md overflow-x-auto max-h-[80vh] min-h-[60vh] text-sm'>
        {/* Table Header */}
        <div className='hidden sm:grid grid-cols-[0.5fr_2fr_2fr_1.5fr_1.5fr_1.5fr_1.5fr_2fr_2fr] py-3 px-6 bg-gray-200 border-b-4 border-green-500 rounded-t-lg'>
          <p>#</p>
          <p>Leave Type</p>
          <p>Reasons</p>
          <p>From</p>
          <p>To</p>
          <p>Applied Date</p>
          <p>Approval</p>
          <p>Status</p>
          <p>Actions</p>
        </div>

        {/* Leave List */}
        {paginatedLeaves.length > 0 ? (
          paginatedLeaves.map((item, index) => (
            <div
              key={index}
              className="flex flex-col sm:grid sm:grid-cols-[0.5fr_2fr_2fr_1.5fr_1.5fr_1.5fr_1.5fr_2fr_2fr] gap-2 sm:gap-0 py-3 px-4 sm:px-6 border-b hover:bg-blue-50 text-gray-700"
            >
              <p>{(currentPage - 1) * itemsPerPage + index + 1}</p>
              <p>{item.leave}</p>
              <p>{item.reason}</p>
              <p>{new Date(item.from).toISOString().split('T')[0]}</p>
              <p>{new Date(item.to).toISOString().split('T')[0]}</p>
              <p>{new Date(item.appliedAt).toISOString().split('T')[0]}</p>
              <p>
                <span className={`font-semibold ${(item.hodStatus === "Rejected" || item.status === "Rejected")
                  ? "text-red-500"
                  : item.status === "Approved"
                    ? "text-green-600"
                    : "text-yellow-600"
                  }`}>
                  {item.hodStatus === "Rejected" ? item.hodStatus : item.status}
                </span>
              </p>

              <p>
                {item.resumeStatus ? (() => {
                  const resumeDate = new Date(item.resumeDate);
                  const toDate = new Date(item.to);
                  resumeDate.setHours(0, 0, 0, 0);
                  toDate.setHours(0, 0, 0, 0);

                  const addedDays = Math.max(0, Math.ceil((resumeDate - toDate) / (1000 * 60 * 60 * 24)));

                  return (
                    <span className={`text-sm font-semibold px-3 py-1 rounded-full ${addedDays > 0
                      ? "text-green-700 bg-green-100"
                      : "text-blue-700 bg-blue-100"}`}>
                      Resumed on {resumeDate.toLocaleDateString()} ({addedDays > 0 ? `${addedDays} day(s) added` : "No days added"})
                    </span>
                  );
                })() : item.status === "Approved" ? (() => {
                  const today = new Date();
                  const from = new Date(item.from);
                  const to = new Date(item.to);
                  from.setHours(0, 0, 0, 0);
                  to.setHours(0, 0, 0, 0);
                  today.setHours(0, 0, 0, 0);

                  if (today < from) {
                    const diffToStart = Math.ceil((from - today) / (1000 * 60 * 60 * 24));
                    return <span className="text-yellow-700 font-bold">{diffToStart} day(s) to Go</span>;
                  } else if (today >= from && today < to) {
                    const daysLeft = Math.ceil((to - today) / (1000 * 60 * 60 * 24));
                    return <span className="text-green-700 font-bold">{daysLeft} day(s) remaining</span>;
                  } else if (today.getTime() === to.getTime()) {
                    return <span className="text-blue-700 font-bold">Returning today</span>;
                  } else {
                    const extraDays = Math.ceil((today - to) / (1000 * 60 * 60 * 24));
                    return <span className="text-red-600 font-bold">Leave ended — You added {extraDays} day(s)</span>;
                  }
                })() : "0 Days"}
              </p>

              <div className="flex flex-wrap sm:justify-end gap-2 mt-2 sm:mt-0">
                <button onClick={() => handleView(item)} className="bg-yellow-500 text-white text-sm px-3 py-1 rounded-full">View</button>

                {item.hodStatus === "Pending" && (
                  <>
                    <button onClick={() => handleUpdate(item)} className="bg-green-500 text-white text-sm px-3 py-1 rounded-full">Update</button>
                    <button onClick={() => setConfirmDeleteId(item._id)} className="bg-red-500 text-white text-sm px-3 py-1 rounded-full">Delete</button>
                  </>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-center py-5 text-gray-500">No departments found.</p>
        )}


        {totalPages > 1 && (
          <>


            {/* Pagination controls */}
            <div className="flex justify-center items-center mt-2 gap-2">
              <button
                onClick={() => {
                  setIsLoading(true);
                  setTimeout(() => {
                    setCurrentPage(prev => Math.max(prev - 1, 1))
                    setIsLoading(false);
                  }, 300);
                }}
                disabled={currentPage === 1}
                className="text-white px-3 py-1 bg-blue-500 hover:bg-blue-800 rounded disabled:opacity-50">
                Prev
              </button>

              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 rounded ${currentPage === i + 1 ? 'bg-green-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() => {
                  setIsLoading(true);
                  setTimeout(() => {
                    setCurrentPage(prev => Math.min(prev + 1, totalPages))
                    setIsLoading(false);
                  }, 300);
                }}
                disabled={currentPage === totalPages}
                className="text-white px-3 py-1 bg-blue-500 hover:bg-blue-800 rounded disabled:opacity-50">
                Next
              </button>
            </div>
            <div className="flex justify-end mt-2 text-sm  text-gray-800">
              Showing {(currentPage - 1) * itemsPerPage + 1}–
              {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}
            </div>
          </>
        )}

      </div>

      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4 sm:p-6">
          <div className="w-full max-w-md bg-white p-4 sm:p-6 rounded-lg shadow-md relative">

            {/* Close Button */}
            <button
              onClick={handleClose}
              className="font-bold text-3xl absolute top-2 right-4 text-red-700 hover:text-red-800"
            >
              ✕
            </button>

            {/* Modal Title */}
            <h2 className="text-xl sm:text-2xl font-bold text-center mb-4 sm:mb-6 text-gray-700">
              {editingLeave ? "Update Leave Request" : "Apply for Leave"}
            </h2>

            {/* Form */}
            <form onSubmit={onSubmitHandler} className="space-y-4">

              {/* Leave Type */}
              <select
                value={leave}
                onChange={(e) => setLeave(e.target.value)}
                required
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              >
                <option value="">-- Select Leave Type --</option>
                <option value="Annual Leave">Annual Leave</option>
                <option value="Casual Leave">Casual Leave</option>
                <option value="Compassionate Leave">Compassionate Leave</option>
                <option value="Leave of Absence">Leave of Absence</option>
                <option value="Maternity Leave">Maternity Leave</option>
                <option value="Paternity Leave">Paternity Leave</option>
                <option value="Sabbatical Leave">Sabbatical Leave</option>
                <option value="Sick Leave">Sick Leave</option>
                <option value="Study Leave">Study Leave</option>
              </select>

              {/* Reason */}
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                placeholder="Reason for leave"
                rows={3}
              />

              {/* Date Inputs */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="block mb-1 text-sm text-gray-700">From</label>
                  <input
                    type="date"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    required
                    min={minFromDate}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                  />
                </div>

                <div className="flex-1">
                  <label className="block mb-1 text-sm text-gray-700">To</label>
                  <input
                    type="date"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    required
                    min={from || new Date().toISOString().split("T")[0]}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-green-500 text-white py-2 rounded-md font-semibold hover:bg-green-600 transition text-sm"
              >
                {editingLeave ? "Update Leave" : "Submit Leave Request"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {confirmDeleteId && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white w-full max-w-sm p-6 rounded-lg shadow-md relative">
            <p className="text-red-500 mb-6 text-center font-semibold text-base sm:text-lg">
              Are you sure you want to delete this department?
            </p>

            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-full hover:bg-gray-400 transition w-full sm:w-auto"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDeleteId)}
                className="bg-red-500 text-white px-6 py-2 rounded-full hover:bg-red-600 transition w-full sm:w-auto"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}


      {selectedLeave && leaves && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50 p-4 sm:p-6">
          <div
            id="print-salary-table"
            className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-4 sm:p-8 relative overflow-y-auto max-h-[90vh]"
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedLeave(null)}
              className="absolute top-3 right-4 text-gray-400 hover:text-red-500 text-2xl font-bold"
            >
              &times;
            </button>

            {/* Header */}
            <h2 className="text-xl sm:text-2xl font-bold text-center text-gray-800 mb-4 sm:mb-6">
              {selectedLeave.userId?.name?.toUpperCase() || "N/A"}
            </h2>

            {/* Profile Image */}
            <div className="flex justify-center mb-4">
              <img
                src={selectedLeave.userId?.profileImage}
                alt="Profile"
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border"
              />
            </div>

            {/* Email & Department */}
            <div className="flex flex-col sm:flex-row justify-center sm:gap-8 mb-6 text-center sm:text-left">
              <p className="text-sm text-gray-800">
                <span className="text-base font-semibold text-green-800">Email: </span>
                {selectedLeave.userId?.email || "N/A"}
              </p>
              <p className="text-sm text-gray-800">
                <span className="text-base font-semibold text-green-800">Department: </span>
                {selectedLeave.userId?.department?.name || "N/A"}
              </p>
            </div>

            {/* Table-like Info */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-700 border border-gray-200 rounded-md">
                <tbody>
                  {[
                    { label: "Leave Type", value: selectedLeave?.leave },
                    { label: "Reason", value: selectedLeave?.reason },
                    {
                      label: "From",
                      value: selectedLeave?.from
                        ? new Date(selectedLeave?.from).toISOString().split("T")[0]
                        : "N/A",
                    },
                    {
                      label: "To",
                      value: selectedLeave?.to
                        ? new Date(selectedLeave?.to).toISOString().split("T")[0]
                        : "N/A",
                    },
                    {
                      label: "Applied On",
                      value: selectedLeave?.appliedAt
                        ? new Date(selectedLeave?.appliedAt).toISOString().split("T")[0]
                        : "N/A",
                    },
                    { label: "Relieving Staff", value: selectedLeave.relievingEId?.name || "N/A" },
                  ].map((row, i) => (
                    <tr key={i} className="border-b">
                      <th className="px-4 py-2 font-medium bg-gray-50 w-40">{row.label}</th>
                      <td className="px-4 py-2">{row.value || "N/A"}</td>
                    </tr>
                  ))}

                  {/* HOD Approval */}
                  <tr className="border-b">
                    <th className="px-4 py-2 font-medium bg-gray-50">HOD Approval</th>
                    <td className="px-4 py-2">
                      <span
                        className={`font-semibold px-2 py-1 rounded 
                    ${selectedLeave.hodStatus === 'Approved'
                            ? 'text-green-600 bg-green-100'
                            : selectedLeave.hodStatus === 'Rejected'
                              ? 'text-red-600 bg-red-100'
                              : 'text-yellow-600 bg-yellow-100'
                          }`}
                      >
                        {selectedLeave.hodStatus}
                      </span>
                    </td>
                  </tr>

                  {/* Admin Approval */}
                  <tr className="border-b">
                    <th className="px-4 py-2 font-medium bg-gray-50">HR Approval</th>
                    <td className="px-4 py-2">

                      <span className={`font-semibold ${(selectedLeave.hodStatus === "Rejected" || selectedLeave.status === "Rejected")
                        ? "text-red-500"
                        : selectedLeave.status === "Approved"
                          ? "text-green-600"
                          : "text-yellow-600"
                        }`}>
                        {selectedLeave.hodStatus === "Rejected" ? selectedLeave.hodStatus : selectedLeave.status}
                      </span>

                    </td>
                  </tr>

                  {/* Resume Status */}
                  <tr>
                    <th className="px-4 py-2 font-medium bg-gray-50">Status</th>
                    <td className="px-4 py-2">
                      {selectedLeave.resumeStatus ? (
                        <span className="text-green-700 text-sm font-semibold bg-green-100 px-3 py-1 rounded-full">
                          Resumed on {new Date(selectedLeave.resumeDate).toLocaleDateString()} (
                          {Math.max(
                            0,
                            Math.ceil(
                              (new Date(selectedLeave.resumeDate).setHours(0, 0, 0, 0) -
                                new Date(selectedLeave.to).setHours(0, 0, 0, 0)) /
                              (1000 * 60 * 60 * 24)
                            )
                          )}{" "}
                          day(s) added)
                        </span>
                      ) : selectedLeave.status === "Approved" ? (() => {
                        const today = new Date();
                        const from = new Date(selectedLeave.from);
                        const to = new Date(selectedLeave.to);
                        from.setHours(0, 0, 0, 0);
                        to.setHours(0, 0, 0, 0);
                        today.setHours(0, 0, 0, 0);

                        if (today < from) {
                          const diffToStart = Math.ceil((from - today) / (1000 * 60 * 60 * 24));
                          return <span className="text-yellow-700 font-bold">{diffToStart} day(s) to Go</span>;
                        } else if (today >= from && today < to) {
                          const daysLeft = Math.ceil((to - today) / (1000 * 60 * 60 * 24));
                          return <span className="text-green-700 font-bold">{daysLeft} day(s) remaining</span>;
                        } else if (today.getTime() === to.getTime()) {
                          return <span className="text-blue-700 font-bold">Returning today</span>;
                        } else {
                          const extraDays = Math.ceil((today - to) / (1000 * 60 * 60 * 24));
                          return <span className="text-red-700 font-bold">Leave ended — You added {extraDays} day(s)</span>;
                        }
                      })() : "0 Days"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Print Button */}
            <div className="flex justify-center mt-6">
              <button
                onClick={() => {
                  const content = document.getElementById("print-salary-table").innerHTML;
                  const printWindow = window.open("", "", "height=800,width=1000");
                  printWindow.document.write("<html><head><title>Leave Details History</title>");
                  printWindow.document.write('<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tailwindcss/dist/tailwind.min.css">');
                  printWindow.document.write("</head><body>");
                  printWindow.document.write(content);
                  printWindow.document.write("</body></html>");
                  printWindow.document.close();
                  printWindow.focus();
                  printWindow.print();
                }}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm"
              >
                Print
              </button>
            </div>
          </div>
        </div>
      )}
      {isLoading && <LoadingOverlay />}
    </div>
  );
};

export default employeeLeave

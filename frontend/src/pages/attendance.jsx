import { useState } from 'react';
import axios from 'axios';
import { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { useEffect } from 'react';
import { toast } from "react-toastify";

const attendance = () => {
  const { token, getAllDepartment, setDepartment, department, backendUrl } = useContext(AppContext);
  const [selectedEmployee, setSelectedEmployee] = useState(null); // For detail view
  const [employeeDetails, setEmployeeDetails] = useState([]);
  const [selectedRecords, setSelectedRecords] = useState([]);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [month, setMonth] = useState('');
  const [report, setReport] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredAttendance, setFilteredAttendance] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5

  const handleUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('file', file);

    /* try {*/
    const { data } = await axios.post(backendUrl + '/api/admin/add-attendance', formData,
      { headers: { Authorization: `Bearer ${token}` }, });

    if (data.success) {
      toast.success(data.message || "Attendance data uploaded successfully");
      setShowForm(false);
      setFile(null);
      fetchGrouped();


      console.log("Upload Response:", data);
    } else {

      toast.error(data.message || "Upload failed.");
    }
    /*} catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Something went wrong.");
    }*/
  };

  const handleAddNew = () => {
    setShowForm(true);

  };
  const handleView = () => {
    setShowDetailModal(true);

  };

  const handleClose = () => {
    setShowDetailModal(false)
    setMonth("");
    setReport([]);
    setSelectedEmployee(null);
    setEmployeeDetails([]);



  };
  const fetchReport = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/admin/report/${month}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setReport(data.report);
        console.log("Attendances:", data.report);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };


  useEffect(() => {
    const fetchGrouped = async () => {
      const { data } = await axios.get(`${backendUrl}/api/admin/get-Attendance`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setAttendance(data.groupedAttendance); // ✅ matches backend
        console.log("Grouped Attendance:", data.groupedAttendance);
      }
    };

    fetchGrouped();
  }, []);



  // Pagination logic
  const totalItems = attendance?.length;
  const totalPages = Math.ceil(filteredAttendance.length / itemsPerPage);
  const paginatedAttendance = filteredAttendance.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  return (
    <div className='w-full max-w-6xl m-5 text-center'>
      <p className="text-2xl font-bold text-gray-800">ATTENDANCE MANAGEMENT </p>

      <div className='flex justify-between items-center mt-4'>
        <input
          type='text'
          placeholder='Search by month Name...'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className='mb-6 px-4 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 w-1/4'
        />

        <button
          onClick={handleAddNew}
          className="bg-green-500 text-white py-2 px-4 rounded-md text-sm hover:bg-green-600 transition mb-6"
        >
          Add Attendance
        </button>
      </div>

      <div className='bg-white border-rounded text-sm max-h-[80vh] min-h-[60vh] overflow-scroll'>
        <div className='bg-gray-200 hidden sm:grid grid-cols-[0.5fr_1fr_1fr_0.5fr_0.5fr_0.5fr_0.5fr_0.5fr_1fr] py-3 px-6 rounded-xl border-b-4 border-green-500'>
          <p>#</p>
          <p>Month</p>
          <p>Year</p>
          <p>present</p>
          <p>Absent</p>
          <p>on Leave</p>
          <p>Over Time</p>
          <p>on Shift</p>
          <p>Actions</p>
        </div>
        {attendance.length > 0 ? (
          attendance
            .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
            .map((monthGroup, index) => {
              const presentCount = monthGroup.records.filter(r => r.status === 'Present').length;
              const absentCount = monthGroup.records.filter(r => r.status === 'Absent').length;
              const leaveCount = monthGroup.records.filter(r => r.status === 'Leave').length;
              const overTimeCount = monthGroup.records.filter(r => r.status === 'overTime').length;
              const shiftCount = monthGroup.records.filter(r => r.status === 'Shift').length;

              const [year, month] = monthGroup._id.split("-");

              return (
                <div
                  key={index}
                  className="flex flex-wrap justify-between sm:grid sm:grid-cols-[0.5fr_1fr_1fr_0.5fr_0.5fr_0.5fr_0.5fr_0.5fr_1fr] items-center text-gray-500 py-3 px-6 border-b hover:bg-blue-50"
                >
                  <p>{(currentPage - 1) * itemsPerPage + index + 1}</p>
                  <p>{month}</p>
                  <p>{year}</p>

                  <p className="text-green-700">{presentCount}</p>
                  <p className="text-red-700">{absentCount}</p>
                  <p className="text-yellow-700">{leaveCount}</p>
                  <p className="text-blue-700">{overTimeCount}</p>
                  <p className="text-gray-700">{shiftCount}</p>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleView()}
                      className="bg-yellow-500 text-white text-sm px-3 py-1 rounded-full"
                    >
                      View Detail
                    </button>
                  </div>
                </div>
              );
            })
        ) : (
          <p className="text-center py-5 text-gray-500">No attendance data found.</p>
        )}

        {totalPages > 1 && (
          <>
            {/* Pagination controls */}
            <div className="flex justify-center items-center mt-2 gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
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
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
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





      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <h2 className="text-xl font-bold mb-2">Upload Monthly Attendance</h2>
          <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md relative">
            <button onClick={() => setShowForm(false)} className="font-bold text-3xl absolute top-2 right-4 text-red-700 hover:text-red-800">✕</button>
            <h2 className="text-2xl font-bold text-center mb-6 text-gray-700">
              Upload Attendance
            </h2>
            <form onSubmit={handleUpload} className="p-4 bg-white rounded shadow">
              <input type="file" accept=".xlsx, .xls" onChange={(e) => setFile(e.target.files[0])} className="mb-2" />
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Upload Excel</button>
            </form>
          </div>
        </div>
      )}


      {showDetailModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={() => setShowDetailModal(false)}
        >
          <div
            className="w-full max-w-6xl bg-white rounded-lg shadow-lg overflow-auto max-h-[90vh] relative p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-2 right-4 text-red-600 text-2xl font-bold hover:text-red-800"
            >
              ✕
            </button>

            {!selectedEmployee && (
              <>
                <div className="flex items-center gap-2 mb-4">
                  <input
                    type="month"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className="border px-3 py-1 rounded"
                  />
                  <button
                    onClick={fetchReport}
                    className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700"
                  >
                    View
                  </button>
                </div>


              </>
            )}


            {/* Attendance Table */}
            <div id="print-salary-table">

              <h2 className="text-xl font-bold mb-4">
                {selectedEmployee
                  ? `Details for ${selectedEmployee.name} (${selectedEmployee.staffId})`
                  : 'Monthly Attendance Report'} for {month && (
                    <span className="text-green-700">
                      {new Date(month + "-01").toLocaleString("default", {
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  )}
              </h2>
              {!selectedEmployee ? (
                report.length > 0 ? (
                  <table className="w-full border mt-2 text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border p-2">#</th>
                        <th className="border p-2">Staff ID</th>
                        <th className="border p-2">Name</th>
                        <th className="border p-2">Present</th>
                        <th className="border p-2">Absent</th>
                        <th className="border p-2">On Leave</th>
                        <th className="border p-2">Over Time</th>
                        <th className="border p-2">On Shift</th>
                        <th className="border p-2">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.values(
                        report.reduce((acc, rec) => {
                          const id = rec.employeeId._id;
                          if (!acc[id]) {
                            acc[id] = {
                              employeeId: rec.employeeId,
                              present: 0,
                              absent: 0,
                              leave: 0,
                              overTime: 0,
                              shift: 0,
                              records: [],
                            };
                          }
                          acc[id].records.push(rec);
                          if (rec.status === 'Present') acc[id].present++;
                          if (rec.status === 'Absent') acc[id].absent++;
                          if (rec.status === 'Leave') acc[id].leave++;
                          if (rec.status === 'overTime') acc[id].overTime++;
                          if (rec.status === 'Shift') acc[id].shift++;
                          return acc;
                        }, {})
                      ).map((emp, idx) => (
                        <tr key={idx}>
                          <td className="border p-2">{idx + 1}</td>
                          <td className="border p-2">{emp.employeeId.staffId}</td>
                          <td className="border p-2">{emp.employeeId.name}</td>
                          <td className="border p-2 text-green-700">{emp.present}</td>
                          <td className="border p-2 text-red-700">{emp.absent}</td>
                          <td className="border p-2 text-yellow-700">{emp.leave}</td>
                          <td className="border p-2 text-blue-700">{emp.overTime}</td>
                          <td className="border p-2 text-gray-700">{emp.shift}</td>
                          <td className="border p-2">
                            <button
                              onClick={() => {
                                setSelectedEmployee(emp.employeeId);
                                setEmployeeDetails(emp.records);
                              }}
                              className="text-blue-600 hover:underline"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-center text-gray-500 py-4">
                    No attendance found for this month.
                  </p>
                )
              ) : (
                <>
                  <table className="w-full border mt-2 text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border p-2">Date</th>
                        <th className="border p-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employeeDetails.map((rec, i) => (
                        <tr key={i}>
                          <td className="border p-2">
                            {new Date(rec.date).toLocaleDateString()}
                          </td>
                          <td
                            className={`border p-2 font-bold text-center ${rec.status === "Present"
                                ? "text-green-600"
                                : rec.status === "Absent"
                                  ? "text-red-600"
                                  : rec.status === "Leave"
                                    ? "text-yellow-600"
                                    : rec.status === "overTime"
                                      ? "text-blue-600"
                                      : rec.status === "Shift"
                                        ? "text-gray-700"
                                        : "text-black-600"
                              }`}
                          >
                            {rec.status}
                          </td>

                        </tr>
                      ))}
                    </tbody>
                  </table>


                  <div className="flex justify-end mt-4">
                    <button
                      onClick={() => setSelectedEmployee(null)}
                      className="bg-gray-300 text-gray-800 px-4 py-1 rounded hover:bg-gray-400"
                    >
                      ← Back
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Print Button */}
            <div className="flex justify-center mt-6">
              <button
                onClick={() => {
                  const content = document.getElementById('print-salary-table').innerHTML;
                  const printWindow = window.open('', '', 'height=800,width=1000');
                  printWindow.document.write(
                    "<html><head><title>Attendance Report</title>"
                  );
                  printWindow.document.write(
                    '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tailwindcss/dist/tailwind.min.css">'
                  );
                  printWindow.document.write('</head><body>');
                  printWindow.document.write(content);
                  printWindow.document.write('</body></html>');
                  printWindow.document.close();
                  printWindow.focus();
                  printWindow.print();
                }}
                className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 text-sm"
              >
                Print
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
};

export default attendance;

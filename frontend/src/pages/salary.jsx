import React, { useState, useContext, useEffect } from 'react';
import { toast } from "react-toastify";
import { AppContext } from '../context/AppContext';
import axios from 'axios';

const salary = () => {
  const { token, backendUrl, getAllSalary, } = useContext(AppContext);
  const [selectedSalaryRecords, setSelectedSalaryRecords] = useState([]);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [file, setFile] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [salaryGroups, setSalaryGroups] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;


  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return toast.warning("Please select a file.");

    const formData = new FormData();
    formData.append('file', file);

    try {
      const { data } = await axios.post(
        `${backendUrl}/api/admin/add-salary`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success(data.message || "Salary data uploaded successfully");
        setShowForm(false);
        setFile(null);
        fetchSalaries();

        console.log("Upload Response:", data);
      } else {

        toast.error(data.message || "Upload failed.");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Something went wrong.");
    }
  };

  const handleAddNew = () => {
    setShowForm(true);

  };

  const handleView = (group) => {
    setSelectedSalaryRecords({ month: group.month, year: group.year, records: group.records });
    setShowDetailModal(true);
  };

  const fetchSalaries = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/admin/get-salaries`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      setSalaryGroups(result.data);
    } catch (error) {
      console.error('Error loading salaries:', error);
    }
  };



  useEffect(() => {
    fetchSalaries();
  }, []);



  return (
   <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-5 text-center">
  {/* Page Title */}
  <p className="text-2xl font-bold text-gray-800 mb-4">MANAGE SALARIES</p>

  {/* Search & Button Row */}
  <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
    <input
      type="text"
      placeholder="Search by Month, Year, or Date..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="w-full sm:w-1/3 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
    />
    <button
      onClick={handleAddNew}
      className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-md text-sm transition"
    >
      Add Salary
    </button>
  </div>

  {/* Table Container */}
  <div className="bg-white border border-gray-200 rounded-lg overflow-y-auto max-h-[80vh] min-h-[60vh]">
    {/* Table Headers */}
    <div className="hidden sm:grid grid-cols-[0.5fr_1fr_1fr_1fr_1fr_2fr] bg-gray-100 py-3 px-6 border-b text-sm font-semibold text-gray-600">
      <p>#</p>
      <p>Month</p>
      <p>Year</p>
      <p>Paid Date</p>
      <p>Amount</p>
      <p className="text-right pr-4">Actions</p>
    </div>

    {/* Records */}
    {salaryGroups?.length > 0 ? (
      salaryGroups
        .filter((item) =>
          `${item.month} ${item.year} ${new Date(item.payDate).toLocaleDateString()}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
          const monthOrder = [
            'january', 'february', 'march', 'april', 'may', 'june',
            'july', 'august', 'september', 'october', 'november', 'december'
          ];
          const monthA = monthOrder.indexOf(a.month.toLowerCase());
          const monthB = monthOrder.indexOf(b.month.toLowerCase());
          return b.year !== a.year ? b.year - a.year : monthB - monthA;
        })
        .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
        .map((item, index) => (
          <div
            key={index}
            className="flex flex-col sm:grid sm:grid-cols-[0.5fr_1fr_1fr_1fr_1fr_2fr] items-center text-sm text-gray-700 px-6 py-3 border-b hover:bg-blue-50"
          >
            <p className="hidden sm:block">{(currentPage - 1) * itemsPerPage + index + 1}</p>
            <p>{item.month}</p>
            <p>{item.year}</p>
            <p>{new Date(item.payDate).toLocaleDateString()}</p>
            <p>₦{item.totalAmount.toLocaleString()}</p>
            <div className="flex justify-end gap-2 w-full sm:w-auto mt-2 sm:mt-0">
              <button
                onClick={() => handleView(item)}
                className="bg-yellow-500 hover:bg-yellow-600 text-white text-xs px-4 py-1 rounded-full"
              >
                View Detail
              </button>
            </div>
          </div>
        ))
    ) : (
      <p className="text-center text-gray-500 py-8">No salary records found.</p>
    )}
 
        {/* Pagination Controls */}
        <div className="flex justify-center items-center mt-4 gap-4">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
            className={`px-4 py-1 rounded ${currentPage === 1 ? 'bg-gray-300 cursor-not-allowed' : 'bg-green-500 text-white hover:bg-green-600'}`}
          >
            Previous
          </button>
          <span className="text-gray-700 font-medium">Page {currentPage}</span>
          <button
            disabled={currentPage * itemsPerPage >= salaryGroups.filter((item) =>
              `${item.month} ${item.year} ${new Date(item.payDate).toLocaleDateString()}`
                .toLowerCase()
                .includes(searchTerm.toLowerCase())
            ).length}
            onClick={() => setCurrentPage((prev) => prev + 1)}
            className={`px-4 py-1 rounded ${currentPage * itemsPerPage >= salaryGroups.length ? 'bg-gray-300 cursor-not-allowed' : 'bg-green-500 text-white hover:bg-green-600'}`}
          >
            Next
          </button>
        </div>

      </div>

{/* Form Modal */}
{showForm && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4 py-8 overflow-y-auto">
    <div className="w-full max-w-md bg-white p-6 sm:p-8 rounded-lg shadow-lg relative">
      
      {/* Close Button */}
      <button
        onClick={() => setShowForm(false)}
        className="absolute top-2 right-4 text-red-700 hover:text-red-800 text-2xl font-bold"
      >
        ✕
      </button>

      {/* Modal Title */}
      <h2 className="text-xl sm:text-2xl font-bold text-center mb-6 text-gray-700">
        Add New Salary
      </h2>

      {/* Form */}
      <form onSubmit={handleUpload} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium text-gray-600">Upload Excel File</label>
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileChange}
            required
            className="w-full border px-4 py-2 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-semibold transition"
          >
            Upload
          </button>
        </div>
      </form>
    </div>
  </div>
)}


{showDetailModal && selectedSalaryRecords && (
  <div
    className="fixed inset-0 z-50 flex items-start justify-center bg-black bg-opacity-50 px-4 py-8 overflow-y-auto"
    onClick={() => setShowDetailModal(false)}
  >
    <div
      className="w-full max-w-6xl bg-white rounded-lg shadow-lg relative p-4 sm:p-6 overflow-x-auto"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Close Button */}
      <button
        onClick={() => setShowDetailModal(false)}
        className="absolute top-2 right-4 text-red-600 text-2xl font-bold hover:text-red-800"
      >
        ✕
      </button>

      <div id="print-salary-table" className="mt-4">
        {/* Header */}
        <h2 className="text-lg sm:text-xl font-bold text-gray-800 text-center mb-4">
          Detailed Salaries for: {selectedSalaryRecords.month} {selectedSalaryRecords.year}
        </h2>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border border-gray-300 mb-6">
            <thead className="bg-gray-100 text-center">
              <tr className="border-b">
                <th className="py-2 px-2">#</th>
                <th className="py-2 px-2">Staff ID</th>
                <th className="py-2 px-2">Full Name</th>
                <th className="py-2 px-2">Department</th>
                <th className="py-2 px-2 text-green-500">Basic</th>
                <th className="py-2 px-2 text-green-500">Allowances</th>
                <th className="py-2 px-2 text-yellow-500">Growth Salary</th>
                <th className="py-2 px-2 text-red-500">Deductions</th>
                <th className="py-2 px-2 text-green-500">Net Pay</th>
              </tr>
            </thead>
            <tbody>
              {selectedSalaryRecords.records.map((salary, idx) => (
                <tr key={salary._id} className="border-b hover:bg-gray-50 text-center">
                  <td className="py-2 px-2">{idx + 1}</td>
                  <td className="py-2 px-2">{salary?.employeeId?.staffId || 'N/A'}</td>
                  <td className="py-2 px-2">{salary?.employeeId?.userId?.name || 'N/A'}</td>
                  <td className="py-2 px-2">{salary?.employeeId?.department?.name || 'N/A'}</td>
                  <td className="py-2 px-2 text-green-500">₦{salary.basicSalary.toLocaleString()}</td>
                  <td className="py-2 px-2 text-green-500">
                    ₦{((salary.transportAllowance || 0) + (salary.mealAllowance || 0) + (salary.overTime || 0)).toLocaleString()}
                  </td>
                  <td className="py-2 px-2 text-yellow-500">₦{salary.growthSalary.toLocaleString()}</td>
                  <td className="py-2 px-2 text-red-500">
                    ₦{((salary.pension || 0) + (salary.paye || 0) + (salary.loan || 0)).toLocaleString()}
                  </td>
                  <td className="py-2 px-2 text-green-500">₦{salary.netSalary.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Print Button */}
        <div className="flex justify-center mt-4">
          <button
            onClick={() => {
              const content = document.getElementById("print-salary-table").innerHTML;
              const printWindow = window.open("", "", "height=800,width=1000");
              printWindow.document.write("<html><head><title>Salary Details</title>");
              printWindow.document.write('<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tailwindcss/dist/tailwind.min.css">');
              printWindow.document.write("</head><body>");
              printWindow.document.write(content);
              printWindow.document.write("</body></html>");
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
  </div>
)}

    </div>
  )
}

export default salary

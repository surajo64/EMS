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
    <div className='w-full max-w-6xl m-5 text-center'>
      <p className="text-2xl font-bold text-gray-800">MANAGE SALARIES</p>

      <div className='flex justify-between items-center mt-4'>
        <input
          type='text'
          placeholder='Search by Employee Name or ID...'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className='mb-6 px-4 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 w-1/4'
        />

        <button
          onClick={handleAddNew}
          className="bg-green-500 text-white py-2 px-4 rounded-md text-sm hover:bg-green-600 transition mb-6"
        >
          Add Salary
        </button>
      </div>
      <div className='bg-white border-rounded text-sm max-h-[80vh] min-h-[60vh] overflow-scroll'>
        <div className='bg-gray-200 hidden sm:grid grid-cols-[0.5fr_1fr_1fr_1fr_1fr_2fr] py-3 px-6 rounded-xl border-b-4 border-green-500'>
          <p>#</p>
          <p>Salary Month</p>
          <p>Salary Year</p>
          <p>Paid Date</p>
          <p>Amount Paid</p>
          <p>Actions</p>
        </div>

        {salaryGroups?.length > 0 ? (
          <>
            {salaryGroups
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

                if (a.year !== b.year) {
                  return b.year - a.year; // descending by year
                }

                return monthB - monthA; // descending by month
              })
              .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
              .map((item, index) => (
                <div
                  key={index}
                  className="flex flex-wrap justify-between sm:grid sm:grid-cols-[0.5fr_1fr_1fr_1fr_1fr_2fr] items-center text-gray-500 py-3 px-6 border-b hover:bg-blue-50"
                >
                  <p>{(currentPage - 1) * itemsPerPage + index + 1}</p>
                  <p>{item.month}</p>
                  <p>{item.year}</p>
                  <p>{new Date(item.payDate).toLocaleDateString()}</p>
                  <p>₦{item.totalAmount.toLocaleString()}</p>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleView(item)}
                      className="bg-yellow-500 text-white text-sm px-3 py-1 rounded-full"
                    >
                      View Detail
                    </button>
                  </div>
                </div>
              ))}
          </>
        ) : (
          <p className="text-center text-gray-500">No salary records found.</p>
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
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md relative">
            <button onClick={() => setShowForm(false)} className="font-bold text-3xl absolute top-2 right-4 text-red-700 hover:text-red-800">✕</button>
            <h2 className="text-2xl font-bold text-center mb-6 text-gray-700">
              Add New Salary
            </h2>
            <form onSubmit={handleUpload} className="p-4 bg-white rounded shadow">
              <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} required className="block mb-2" />
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Upload Excel</button>
            </form>
          </div>
        </div>
      )}


      {showDetailModal && selectedSalaryRecords && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={() => setShowDetailModal(false)}
        >
          <div
            className="w-full max-w-6xl bg-white rounded-lg shadow-lg overflow-auto max-h-[90vh] relative p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowDetailModal(false)}
              className="absolute top-2 right-4 text-red-600 text-2xl font-bold hover:text-red-800"
            >
              ✕
            </button>

            <h2 className="text-xl font-bold text-gray-800 text-center mb-4">
              Detailed Salaries for: {selectedSalaryRecords.month} {selectedSalaryRecords.year}
            </h2>

            <div id="print-salary-table">
              <table className="w-full text-sm border border-gray-300 mb-6">
                <thead className="bg-gray-100">
                  <tr className="text-center border-b">
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
                    <tr key={salary._id} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-2">{idx + 1}</td>
                      <td className="py-2 px-2">{salary?.employeeId?.staffId || 'N/A'}</td>
                      <td className="py-2 px-2">{salary?.employeeId?.userId?.name || 'N/A'}</td>
                      <td className="py-2 px-2">{salary?.employeeId?.department?.name || 'N/A'}</td>
                      <td className="py-2 px-2 text-green-500">₦{salary.basicSalary.toLocaleString()}</td>
                      <td className="py-2 px-2 text-green-500">₦{((salary.transportAllowance || 0) + (salary.mealAllowance || 0)+ (salary.overTime || 0)).toLocaleString()}</td>
                      <td className="py-2 px-2 text-yellow-500">₦{salary.growthSalary.toLocaleString()}</td>
                      <td className="py-2 px-2 text-red-500">₦{((salary.pension || 0) + (salary.paye || 0) + (salary.loan || 0)).toLocaleString()}</td>
                      <td className="py-2 px-2 text-green-500">₦{salary.netSalary.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Print Button at Bottom Center */}
            <div className="flex justify-center">
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
      )}


    </div>
  )
}

export default salary

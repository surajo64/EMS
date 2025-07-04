
import React, { useState, useContext, useEffect } from 'react';
import { toast } from "react-toastify";
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const employeeSalary = () => {
  const { token, backendUrl, getAllSalary, } = useContext(AppContext);
  const [selectedSalaryRecords, setSelectedSalaryRecords] = useState([]);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [file, setFile] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [salaryGroups, setSalaryGroups] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;


  const handleView = (group) => {
    setSelectedSalaryRecords({ month: group.month, year: group.year, records: group.records });
    setShowDetailModal(true);
  };


  useEffect(() => {
    const fetchSalaries = async () => {
      try {
        const res = await fetch(`${backendUrl}/api/admin/get-employee-salaries`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await res.json();
        setSalaryGroups(result.data);
        console.error('Group of salaries:',result.data );
      } catch (error) {
        console.error('Error loading salaries:', error);
      }
    };

    fetchSalaries();
  }, []);
  


const handlePrintSlip = (group) => {
  const currentUserId = JSON.parse(localStorage.getItem('user'))?.id;
  const salaryRecord = group.records.find(
    rec => rec?.employeeId?.userId?._id === currentUserId
  );

  if (!salaryRecord) return toast.warning("No salary record found for current user.");

  
  const content = `
 
  <!DOCTYPE html>
<html>
<head>
  <title>Pay Slip</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css">
  <style>
    @media print {
      .no-print { display: none; }
    }
  </style>
</head>
<body class="p-6 text-sm font-sans text-gray-700 bg-gray-100">
<div class="flex justify-end gap-2 mb-4 no-print">
      <button onclick="window.print()" class="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600">
        Print
      </button>
      
    </div>

        <div id="pay-slip" class="max-w-2xl mx-auto bg-white border border-gray-300 p-6 rounded shadow">
          <div class="text-center mb-6">
        <img src="/public/logo.svg" class="w-12 mx-auto mb-4" />
        <h2 class="text-2xl font-bold text-gray-800 mb-10">KIRCT Employee Pay Slip</h2>
        <p class="text-xl font-bold text-green-800 uppercase">
          ${salaryRecord.employeeId.userId.name}
        </p>
      </div>

     
    <div class="grid grid-cols-2 gap-4 mb-6">
      <div>
        <p><strong>Staff ID:</strong> ${salaryRecord.employeeId.staffId}</p>
        <p><strong>Department:</strong> ${salaryRecord.employeeId.department.name}</p>
        <p><strong>Designation:</strong> ${salaryRecord.employeeId.designation || 'N/A'}</p>
      </div>
      <div>
        <p><strong>Month:</strong> ${group.month}</p>
        <p><strong>Year:</strong> ${group.year}</p>
        <p><strong>Pay Date:</strong> ${new Date(salaryRecord.payDate).toLocaleDateString()}</p>
      </div>
    </div>
    <hr class="my-4" />
    <div class="grid grid-cols-2 gap-4 mb-6">
      <div>
        <h3 class="font-semibold text-gray-800 mb-2">Earnings</h3>
        <p><strong>Basic Salary:</strong> ₦${salaryRecord.basicSalary.toLocaleString()}</p>
        <p><strong>Meal Allowance:</strong> ₦${(salaryRecord.mealAllowance || 0).toLocaleString()}</p>
        <p><strong>Transport Allowance:</strong> ₦${(salaryRecord.transportAllowance || 0).toLocaleString()}</p>
        <p><strong>Over Time:</strong> ₦${(salaryRecord.overTime || 0).toLocaleString()}</p>
        
      </div>
      <div>
        <h3 class="font-semibold text-gray-800 mb-2">Deductions</h3>
        <p><strong>Pension:</strong> ₦${(salaryRecord.pension || 0).toLocaleString()}</p>
        <p><strong>PAYE:</strong> ₦${(salaryRecord.paye || 0).toLocaleString()}</p>
        <p><strong>Loan:</strong> ₦${(salaryRecord.loan || 0).toLocaleString()}</p>
        <p class="text-red-600"><strong>Total Deductions:</strong> ₦${((salaryRecord.pension || 0) + (salaryRecord.paye || 0)+ (salaryRecord.loan || 0)).toLocaleString()}</p>
      </div>
      
      </div>
      <div class="text-center">
      <p class=" text-green-600"><strong>Gross Salary:</strong> ₦${salaryRecord.growthSalary.toLocaleString()}</p>
       </div>
       
    <hr class="my-4" />
    <p class="text-green-700 font-bold text-lg text-center">
      <strong>Net Pay:</strong> ₦${salaryRecord.netSalary.toLocaleString()}
    </p>
    <hr class="my-6" />
    <p class="text-center text-xs text-gray-500">
      © ${new Date().getFullYear()} Kano Independent Research Centre Trust. All rights reserved.
    </p>
  </div>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
  <script>
    async function downloadPDF() {
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF();
      const element = document.getElementById("pay-slip");
      await pdf.html(element, {
        callback: function (doc) {
          doc.save("PaySlip.pdf");
        },
        x: 10,
        y: 10,
        width: 180,
        windowWidth: 800
      });
    }
  </script>
</body>
</html>

`;

  const printWindow = window.open("", "_blank", "height=800,width=600");
  printWindow.document.write(content);
  printWindow.document.close();
};





  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6">
  <p className="text-xl sm:text-2xl font-bold text-gray-800 text-center">MANAGE SALARIES</p>

  {/* Search Bar */}
  <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-4">
    <input
      type="text"
      placeholder="Search by Employee Name or ID..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="w-full sm:w-1/2 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
    />
  </div>

  {/* Salary Table */}
  <div className="bg-white rounded-md shadow-sm mt-6 text-sm max-h-[80vh] min-h-[60vh] overflow-y-auto">
    {/* Table Header (only visible on sm and up) */}
    <div className="bg-gray-200 hidden sm:grid grid-cols-[0.5fr_1fr_1fr_1fr_1fr_2fr] py-3 px-4 rounded-t-md border-b-4 border-green-500 font-semibold">
      <p>#</p>
      <p>Salary Month</p>
      <p>Salary Year</p>
      <p>Paid Date</p>
      <p>Amount Paid</p>
      <p>Actions</p>
    </div>

    {/* Table Rows */}
    {salaryGroups?.length > 0 ? (
      salaryGroups
        .filter((item) =>
          `${item.month} ${item.year} ${new Date(item.payDate).toLocaleDateString()}`.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
          const monthOrder = [
            'january', 'february', 'march', 'april', 'may', 'june',
            'july', 'august', 'september', 'october', 'november', 'december'
          ];
          const monthA = monthOrder.indexOf(a.month.toLowerCase());
          const monthB = monthOrder.indexOf(b.month.toLowerCase());

          return a.year !== b.year ? b.year - a.year : monthB - monthA;
        })
        .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
        .map((item, index) => (
          <div
            key={index}
            className="flex flex-wrap sm:grid sm:grid-cols-[0.5fr_1fr_1fr_1fr_1fr_2fr] items-center gap-4 sm:gap-0 py-3 px-4 border-b hover:bg-blue-50 text-gray-600"
          >
            <p>{(currentPage - 1) * itemsPerPage + index + 1}</p>
            <p>{item.month}</p>
            <p>{item.year}</p>
            <p>{new Date(item.payDate).toLocaleDateString()}</p>
            <p>₦{item.netPay.toLocaleString()}</p>
            <div className="flex gap-2 justify-start sm:justify-end flex-wrap">
              <button
                onClick={() => handleView(item)}
                className="bg-yellow-500 text-white text-sm px-3 py-1 rounded-full"
              >
                View Detail
              </button>
              <button
                onClick={() => handlePrintSlip(item)}
                className="bg-blue-600 text-white text-sm px-3 py-1 rounded-full"
              >
                Pay Slip
              </button>
            </div>
          </div>
        ))
    ) : (
      <p className="text-center text-gray-500 py-6">No salary records found.</p>
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



      {showDetailModal && selectedSalaryRecords && (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
    onClick={() => setShowDetailModal(false)}
  >
    <div
      className="w-full max-w-6xl bg-white rounded-lg shadow-lg overflow-auto max-h-[90vh] relative p-4 sm:p-6"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Close Button */}
      <button
        onClick={() => setShowDetailModal(false)}
        className="absolute top-2 right-4 text-red-600 text-2xl font-bold hover:text-red-800"
      >
        ✕
      </button>

      {/* Title */}
      <h2 className="text-lg sm:text-xl font-bold text-gray-800 text-center mb-4">
        Detailed Salaries for: {selectedSalaryRecords.month} {selectedSalaryRecords.year}
      </h2>

      {/* Scrollable Table */}
      <div id="print-salary-table" className="overflow-x-auto">
        <table className="w-full text-sm border border-gray-300 mb-6 min-w-[800px]">
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
    </div>
  </div>
)}



    </div>
  )
}

export default employeeSalary

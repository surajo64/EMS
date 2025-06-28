import React, { useState } from 'react'
import { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { useEffect } from 'react';
import axios from 'axios';
import { toast } from "react-toastify";

const employee = () => {
  const { token, backendUrl, getAllDepartment, department,
    employees, setEmployees, getAllEmployees } = useContext(AppContext)
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [designationOptions, setDesignationOptions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5
  const [showForm, setShowForm] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredEmployess, setFilteredEmployess] = useState([]);
  const [selectedCVFile, setSelectedCVFile] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [staffId, setStaffId] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [maritalStatus, setMaritalStatus] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [designation, setDesignation] = useState('');
  const [salary, setSalary] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [joinDate, setJoinDate] = useState('');
  const [qualification, setQualification] = useState('');
  const [experience, setExperience] = useState('');
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [state, setState] = useState("");
  const states = [
    "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
    "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "Gombe", "Imo", "Jigawa",
    "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger",
    "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe"
  ];


  const handleDepartmentChange = (e) => {
    const deptId = e.target.value;
    setSelectedDepartment(deptId);

    const selectedDept = department.find(dep => dep._id === deptId);
    setDesignationOptions(selectedDept?.designations || []);
    setDesignation(''); // Reset designation when department changes
  };


  const handleView = (employee) => {
    setSelectedEmployee(employee);
  };

  const handleClose = () => {
    setShowForm(false)
    getAllEmployees();
    // Reset form
    setName(""); setEmail(""); setStaffId(""); setDob(""); setGender("");
    setMaritalStatus(""); setSelectedDepartment(""); setDesignation("");
    setSalary(""); setPassword(""); setRole(""); setAddress(""); setPhone("");
    setSelectedImageFile(null); setState(""); setQualification(""); setExperience("");
    setSelectedCVFile(""); setSelectedImageFile(""); setJoinDate("");
    setShowForm(false);
    getAllEmployees();
  }

  const handleAddNew = () => {
    setEditingAdmin(null);
    setShowForm(true);
  };
  const handleUpdate = (item) => {
    setEditingAdmin(item);
    setEditingAdmin(item);
    setName(item.userId.name);
    setEmail(item.userId.email);
    setStaffId(item.staffId);
    setRole(item.userId.role)
    const formattedjoinDate = new Date(item.joinDate).toISOString().split('T')[0];
    setJoinDate(formattedjoinDate)
    const formattedDob = new Date(item.dob).toISOString().split('T')[0];
    setDob(formattedDob);
    setGender(item.gender);
    setMaritalStatus(item.maritalStatus);
    setSelectedDepartment(item.department?._id || item.department?.name);
    if (item.department?._id) {
      setSelectedDepartment(item.department._id);
      handleDepartmentChange({ target: { value: item.department._id } });
    }
    setDesignation(item.designation || '');
    setSelectedCVFile(item.cv || null);
    setSelectedImageFile(item.userId?.profileImage || null);
    setAddress(item.address);
    setPhone(item.phone);
    setQualification(item.qualification)
    setExperience(item.experience)
    setState(item.state);
    setShowForm(true);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate CV file

    


    // Validate profile image file
    if (
      selectedImageFile &&
      selectedImageFile.type &&
      !['image/jpeg', 'image/png', 'image/jpg'].includes(selectedImageFile.type)
    ) {
      toast.error("Profile image must be JPG, JPEG, or PNG format.");
      return;
    }


    const normalizedId = staffId.trim().toUpperCase();
    setStaffId(normalizedId);

    const staffIdPattern = /^KIRCT\d{3}$/;
    if (!staffIdPattern.test(normalizedId)) {
      toast.error("Staff ID must be in the format KIRCT followed by 3 digits (e.g., KIRCT001)");
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('staffId', staffId);
    formData.append('dob', dob);
    formData.append('joinDate', joinDate);
    formData.append('gender', gender);
    formData.append('maritalStatus', maritalStatus);
    formData.append('department', selectedDepartment);
    formData.append('designation', designation);
    formData.append('salary', salary);
    formData.append('password', password);
    formData.append('role', role);
    formData.append('address', address);
    formData.append('phone', phone);
    formData.append('state', state);
    formData.append('qualification', qualification);
    formData.append('experience', experience);
    formData.append("cv", selectedCVFile);
    formData.append("image", selectedImageFile);


    try {
      if (editingAdmin && editingAdmin._id) {
        formData.append("employeeId", editingAdmin._id);

        const { data } = await axios.post(
          backendUrl + '/api/admin/update-employee',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (data.success) {
          toast.success("Employee updated successfully!");
          // Reset form
          setName(""); setEmail(""); setStaffId(""); setDob(""); setGender("");
          setMaritalStatus(""); setSelectedDepartment(""); setDesignation("");
          setSalary(""); setPassword(""); setRole(""); setAddress(""); setPhone("");
          setSelectedImageFile(null); setState(""); setQualification(""); setExperience("");
          setSelectedCVFile(""); setSelectedImageFile(""); setJoinDate("");
          setShowForm(false);
          getAllEmployees();
        }
      } else {
        const { data } = await axios.post(
          backendUrl + "/api/admin/add-employee",
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (data.success) {
          toast.success("Employee added successfully!");
          // Reset form
          setName(""); setEmail(""); setStaffId(""); setDob(""); setGender("");
          setMaritalStatus(""); setSelectedDepartment(""); setDesignation("");
          setSalary(""); setPassword(""); setRole(""); setAddress(""); setPhone("");
          setSelectedImageFile(null); setState(""); setJoinDate("");
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      console.error('Employee Add/Update failed', error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const handleDelete = async (id) => {

    console.log("Delete route hit with staffId:", id);

    const { data } = await axios.delete(
      backendUrl + `/api/admin/delete-employee/${id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log("Reponse", data)
    if (data.success) {
      toast.success(data.message);
      setConfirmDeleteId(null);
      getAllEmployees();
    } else {
      toast.error("Failed to delete Employee");
    }
  };

  // Step 1: Filter

  // Filter departments based on search
  useEffect(() => {
    const filtered = (employees || []).filter((emp) =>

      emp.staffId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.userId.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.department.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredEmployess(filtered);
    setCurrentPage(1);
  }, [searchTerm, employees]);


  // Use filteredEmployees directly:
  const totalItems = employees?.length;
  const totalPages = Math.ceil(filteredEmployess.length / itemsPerPage);
  const paginatedEmployees = filteredEmployess.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    if (token) {
      getAllDepartment();
      getAllEmployees();

    }
  }, [token, searchTerm]);

  return (
    <div className='w-full max-w-6xl m-5 text-center'>
      <p className="text-2xl font-bold text-gray-800">MANAGE EMPLOYEE</p>

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
          Add Employee
        </button>
      </div>

      <div className='bg-white border-rounded text-sm max-h-[80vh] min-h-[60vh] overflow-scroll'>
        <div className='bg-gray-200 hidden sm:grid grid-cols-[0.5fr_3fr_2fr_2fr_1fr_5fr] grid-flow-col py-3 px-6 rounded-xl border-b-4 border-green-500'>
          <p>#</p>
          <p>Full Name</p>
          <p>Email</p>
          <p>Department</p>
          <p>BOB</p>
          <p>Actions</p>
        </div>

        {paginatedEmployees.length > 0 ? (
          paginatedEmployees.map((item, index) => (
            <div key={index} className="flex flex-wrap justify-between sm:grid sm:grid-cols-[0.5fr_3fr_2fr_2fr_1fr_5fr] items-center text-gray-500 py-3 px-6 border-b hover:bg-blue-50">
              <p>{index + 1}</p>

              <div className="flex items-center gap-2">
                <img className="w-12 h-12 rounded-full object-cover"
                  src={backendUrl + `/upload/${item.userId?.profileImage}`}
                  alt="profile" />
                <p>{item.userId?.name}</p>
              </div>

              <p>{item.userId?.email}</p>
              <p>{item.department?.name}</p>
              <p>{new Date(item.dob).toLocaleDateString()}</p>

              <div className="flex justify-end gap-2">

                <button onClick={() => handleView(item)} className="bg-blue-500 text-white text-sm px-3 py-1 rounded-full">View</button>
                <button onClick={() => handleUpdate(item)} className="bg-green-500 text-white text-sm px-3 py-1 rounded-full">Update</button>
                <button onClick={() => setConfirmDeleteId(item._id)} className="bg-red-500 text-white text-sm px-3 py-1 rounded-full">Delete</button>
              </div>

            </div>
          ))
        ) : (
          <p className="text-center py-5 text-gray-500">No employees found.</p>
        )}
        {/* Pagination codes */}


        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-4 gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="text-white px-3 py-1 bg-blue-500 hover:bg-blue-800 rounded disabled:opacity-50"
            >
              Prev
            </button>

            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 rounded ${currentPage === i + 1 ? 'bg-green-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="text-white px-3 py-1 bg-blue-500 hover:bg-blue-800 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>

        )}
      </div>
      <div className="flex justify-end mt-2 text-sm  text-gray-800">
        Showing {(currentPage - 1) * itemsPerPage + 1}–
        {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}
      </div>

      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="w-full max-w-5xl bg-white p-6 rounded-lg shadow-md relative max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={handleClose}
              className=" font-bold text-3xl absolute top-2 right-4  text-red-700 hover:text-red-800"
            >
              ✕
            </button>

            <h2 className="text-2xl font-bold text-center mb-6 text-gray-700">
              {editingAdmin ? "Update Employee" : "Add New Employee"}
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    placeholder="Full Name"
                    className="w-full p-2 border border-green-300 rounded"
                  />

                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder="Email"
                    className="w-full p-2 border border-green-300 rounded"
                  />

                  <input
                    type="text"
                    value={staffId}
                    onChange={e => setStaffId(e.target.value)}
                    required
                    placeholder="Staff ID"
                    className="w-full p-2 border border-green-300 rounded"
                  />
                  <label className="block font-medium mt-4">Date of Birth </label>
                  <input
                    type="date"
                    value={dob}
                    onChange={e => setDob(e.target.value)}
                    required
                    className="w-full p-2 border border-green-300 rounded"
                  />

                  <select
                    value={gender}
                    onChange={e => setGender(e.target.value)}
                    className="w-full p-2 border border-green-300 rounded"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>

                  <select
                    value={maritalStatus}
                    onChange={e => setMaritalStatus(e.target.value)}
                    className="w-full p-2 border border-green-300 rounded"
                  >
                    <option value="">Marital Status</option>
                    <option value="single">Single</option>
                    <option value="married">Married</option>
                  </select>

                  <select
                    onChange={(e) => setState(e.target.value)}
                    value={state}
                    className="w-full p-2 border border-green-300 rounded"
                    required
                  >
                    <option value="" disabled>State of Residence</option>
                    {states.map((state, index) => (
                      <option key={index} value={state}>{state}</option>
                    ))}
                  </select>

                  <input
                    type="text"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    required placeholder='Phone Number'
                    className="w-full p-2 border border-green-300 rounded"
                  />
                  {!editingAdmin && (
                    <input
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      placeholder="Password"
                      className="w-full p-2 border border-green-300 rounded"
                    />
                  )}
                  <select
                    value={qualification}
                    onChange={e => setQualification(e.target.value)}
                    className="w-full p-2 border border-green-300 rounded"
                  >
                    <option value="">Highest Qualification</option>
                    <option value="SSCE">SSCE</option>
                    <option value="ND">National Diploma </option>
                    <option value="NCE">Nigerian Certificate in Education </option>
                    <option value="HND">Higher National Diploma </option>
                    <option value="B.sc"> Bachelor’s Degree  </option>
                    <option value="M.Sc ">Master’s Degrees</option>
                    <option value="Ph.D">Doctorate Degrees</option>
                  </select>

                </div>

                {/* Right Column */}
                <div className="space-y-4">

                  <select
                    value={experience}
                    onChange={e => setExperience(e.target.value)}
                    className="w-full p-2 border border-green-300 rounded"
                  >
                    <option value="">Working Experience</option>
                    <option value="1-5">1-5 Yeasrs</option>
                    <option value="6-10">6-10 Yeasrs</option>
                    <option value="11-15">11-15 Yeasrs</option>
                    <option value="16-20">16-20 Yeasrs</option>
                    <option value="21-25">21-25 Yeasrs</option>
                    <option value="26-30">26-30 Yeasrs</option>
                  </select>


                  <select
                    value={selectedDepartment}
                    onChange={handleDepartmentChange}
                    className="w-full p-2 border border-green-300 rounded"
                  >
                    <option value="">Select Department</option>
                    {department?.map(dep => (
                      <option key={dep._id} value={dep._id}>{dep.name}</option>
                    ))}
                  </select>

                  {/* Designation Dropdown (populated based on department) */}
                  <select
                    value={designation}
                    onChange={e => setDesignation(e.target.value)}
                    required
                    className="w-full p-2 border border-green-300 rounded"
                    disabled={!selectedDepartment}
                  >
                    <option value="">Select Designation</option>
                    {designationOptions.map((desig, idx) => (
                      <option key={idx} value={desig}>{desig}</option>
                    ))}
                  </select>

                  <label className="block font-medium mt-4">Join Date</label>
                  <input
                    type="date"
                    value={joinDate}
                    onChange={e => setJoinDate(e.target.value)}
                    required
                    className="w-full p-2 border border-green-300 rounded"
                  />

                  {/* CV Upload */}
                  <label className="block font-medium mt-4">Upload CV (PDF)</label>
                  {editingAdmin && typeof selectedCVFile === 'string' && (
                    <a
                      href={`${backendUrl}/upload/${selectedCVFile}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline block mb-2"
                    >
                      View Uploaded CV
                    </a>
                  )}

                  <input
                    type="file"
                    name="cv"
                    onChange={e => setSelectedCVFile(e.target.files[0])}
                    accept=".pdf"
                    className="w-full p-2 border border-green-300 rounded"
                  />


                  <select
                    value={role}
                    onChange={e => setRole(e.target.value)}
                    className="w-full p-2 border border-green-300 rounded"
                  >
                    <option value="">Select Role</option>
                    <option value="admin">Admin</option>
                    <option value="employee">Employee</option>
                    <option value="HOD">HOD</option>
                  </select>

                  <textarea
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="Address"
                    rows={3}
                    className="w-full p-2 border border-green-300 rounded"
                  ></textarea>

                  {/* Profile Image Upload */}
                  <label className="block font-medium">Profile Image</label>
                  {editingAdmin && typeof selectedImageFile === 'string' && (
                    <img
                      src={`${backendUrl}/upload/${selectedImageFile}`}
                      alt="Profile Preview"
                      className="w-24 h-24 object-cover rounded-full mb-2"
                    />
                  )}

                  <input
                    type="file"
                    name="image"
                    onChange={e => setSelectedImageFile(e.target.files[0])}
                    accept="image/*"
                    className="w-full p-2 border border-green-300 rounded"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="mt-6">
                <button
                  type="submit"
                  className="w-full bg-green-500 text-white py-2 rounded-md font-semibold hover:bg-green-600 transition duration-300"
                >
                  {editingAdmin ? "Update Employee" : "Add Employee"}
                </button>
              </div>
            </form>
          </div>
        </div >
      )}


      {selectedEmployee && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full shadow-xl relative">
            <button
              onClick={() => setSelectedEmployee(null)}
              className="absolute top-2 right-4 text-red-600 text-2xl font-bold"
            >
              ✕
            </button>

            <h2 className="text-xl font-bold mb-6 text-center text-gray-700">
              {selectedEmployee.userId?.name.toUpperCase()}
            </h2>
            <div className="mt-6 text-center">
              <img
                src={backendUrl + `/upload/${selectedEmployee.userId?.profileImage}`}
                alt="Profile"
                className="w-44 h-44 rounded-full object-cover inline-block border border-gray-300 mb-10"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm text-gray-700 text-start">
              {[
                { label: "Name", value: selectedEmployee.userId?.name },
                { label: "Email", value: selectedEmployee.userId?.email },
                { label: "Staff ID", value: selectedEmployee.staffId },
                { label: "Department", value: selectedEmployee.department?.name },
                { label: "Designation", value: selectedEmployee.designation },
                { label: "DOB", value: new Date(selectedEmployee.dob).toLocaleDateString() },
                { label: "Phone", value: selectedEmployee.phone },
                { label: "Gender", value: selectedEmployee.gender },
                { label: "Marital Status", value: selectedEmployee.maritalStatus },
                { label: "State", value: selectedEmployee.state },
                { label: "Address", value: selectedEmployee.address },
                { label: "Join Date", value: new Date(selectedEmployee.joinDate).toLocaleDateString() },
                { label: "Experience", value: selectedEmployee.experience },
                { label: "Qualification", value: selectedEmployee.qualification },
                { label: "Role", value: selectedEmployee.userId?.role },
                {
                  label: "CV", value: selectedEmployee.cv ? (
                    <a href={`${backendUrl}/upload/${selectedEmployee.cv}`}
                      target="_blank" rel="noopener noreferrer"
                      className="text-blue-600 underline block mb-2">
                      View Uploaded CV</a>
                  ) : (
                    <span className="text-red-500">No CV uploaded</span>
                  )
                },


              ].map((item, index) => (
                <div key={index} className="flex border-b py-2">
                  <div className="font-semibold w-40">{item.label}:</div>
                  <div className="text-gray-800">{item.value}</div>
                </div>
              ))}
            </div>


          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {confirmDeleteId && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow-md w-80">
            <p className="text-red-500 mb-4 text-center font-semibold">
              Are you sure you want to delete this Employee?
            </p>
            <div className="flex justify-between">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="bg-gray-300 px-8 py-2 rounded-full hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDeleteId)}
                className="bg-red-500 text-white px-8 py-2 rounded-full hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div >
  );
};
export default employee

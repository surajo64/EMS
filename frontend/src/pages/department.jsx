import React, { useState, useEffect, useContext } from 'react';
import { toast } from "react-toastify";
import axios from 'axios';
import { AppContext } from '../context/AppContext';

const Department = () => {
  const { token, getAllDepartment, setDepartment, department, backendUrl } = useContext(AppContext);
  const [selectedAdminId, setSelectedAdminId] = useState(null);
  const [designations, setDesignations] = useState(['']);

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredDepartments, setFilteredDepartments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5




  const onSubmitHandler = async (event) => {
    event.preventDefault();

   const formData = { name, description, designations };

    if (editingAdmin && editingAdmin._id) {
      const { data } = await axios.post(
        backendUrl + '/api/admin/update-department',
        { departmentId: editingAdmin._id, ...formData },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success("Department updated successfully!");
        setShowForm(false);
        setName("");
        setDescription("");
        setDesignations("")
        getAllDepartment();
      }
    } else {
      const { data } = await axios.post(
        backendUrl + "/api/admin/add-department",
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success("Department added successfully!");
        setName("");
        setDescription("");
        setShowForm(false);
        setDesignations("")
        getAllDepartment();
      } else {
        toast.error(data.message);
      }
    }
  };

  const handleDelete = async (id) => {
    const { data } = await axios.delete(
      backendUrl + `/api/admin/delete-department/${id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (data.success) {
      toast.success(data.message);
      setConfirmDeleteId(null);
      getAllDepartment();
    } else {
      toast.error("Failed to delete department");
    }
  };

  const handleAddNew = () => {
    setEditingAdmin(null);
    setName("");
    setDescription("");
    setShowForm(true);
  };


  const handleUpdate = (item) => {
    setEditingAdmin(item);
    setName(item.name);
    setDescription(item.description);
    setDesignations(item.designations)
    setShowForm(true);
  };


  const handleDesignationChange = (index, value) => {
    const newDesignations = [...designations];
    newDesignations[index] = value;
    setDesignations(newDesignations);
  };

  const handleAddDesignation = () => {
    setDesignations([...designations, '']);
  };

  const handleRemoveDesignation = (index) => {
    const newDesignations = [...designations];
    newDesignations.splice(index, 1);
    setDesignations(newDesignations.length > 0 ? newDesignations : ['']);
  };




  useEffect(() => {
    if (token) getAllDepartment();
  }, [token]);

  // Filter departments based on search
  useEffect(() => {
    const filtered = (department || []).filter((d) =>
      d.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredDepartments(filtered);
    setCurrentPage(1); // Reset to first page on new search
  }, [searchTerm, department]);

  // Pagination logic
  const totalItems = department?.length;
  const totalPages = Math.ceil(filteredDepartments.length / itemsPerPage);
  const paginatedDepartments = filteredDepartments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );


  return (
    <div className='w-full max-w-6xl m-5 text-center'>
      <p className="text-2xl font-bold text-gray-800">MANAGE DEPARTMENT</p>

      <div className='flex justify-between items-center mt-4'>
        <input
          type='text'
          placeholder='Search by Department Name...'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className='mb-6 px-4 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 w-1/4'
        />

        <button
          onClick={handleAddNew}
          className="bg-green-500 text-white py-2 px-4 rounded-md text-sm hover:bg-green-600 transition mb-6"
        >
          Add Department
        </button>
      </div>

      <div className='bg-white border-rounded text-sm max-h-[80vh] min-h-[60vh] overflow-scroll'>
        <div className='bg-gray-200 hidden sm:grid grid-cols-[0.5fr_3fr_2fr] py-3 px-6 rounded-xl border-b-4 border-green-500'>
          <p>#</p>
          <p>Department</p>
          <p>Actions</p>
        </div>

        {paginatedDepartments.length > 0 ? (
          paginatedDepartments.map((item, index) => (
            <div key={index} className="flex flex-wrap justify-between sm:grid sm:grid-cols-[0.5fr_3fr_2fr] items-center text-gray-500 py-3 px-6 border-b hover:bg-blue-50">
              <p>{(currentPage - 1) * itemsPerPage + index + 1}</p>
              <p>{item.name}</p>
              <div className="flex justify-end gap-2">
                <button onClick={() => handleUpdate(item)} className="bg-green-500 text-white text-sm px-3 py-1 rounded-full">Update</button>
                <button onClick={() => setConfirmDeleteId(item._id)} className="bg-red-500 text-white text-sm px-3 py-1 rounded-full">Delete</button>
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
          <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md relative">
            <button onClick={() => setShowForm(false)} className="font-bold text-3xl absolute top-2 right-4 text-red-700 hover:text-red-800">✕</button>
            <h2 className="text-2xl font-bold text-center mb-6 text-gray-700">
              {editingAdmin ? "Update Department" : "Add New Department"}
            </h2>

            <form onSubmit={onSubmitHandler} className="space-y-4">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Name Department"
              />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Department Description"
              />
              <div>
                <label className="block font-semibold text-gray-700 mb-2">Designations</label>
                {designations.map((designation, index) => (
                  <div key={index} className="flex mb-2">
                    <input
                      type="text"
                      value={designation}
                      onChange={(e) => handleDesignationChange(index, e.target.value)}
                      required
                      placeholder={`Designation ${index + 1}`}
                      className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    {designations.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveDesignation(index)}
                        className="ml-2 text-red-600 font-bold"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddDesignation}
                  className="text-green-600 font-medium mt-1"
                >
                  + Add Designation
                </button>
              </div>
              <button
                type="submit"
                className="w-full bg-green-500 text-white py-2 rounded-md font-semibold hover:bg-green-600 transition"
              >
                {editingAdmin ? "Update Department" : "Add Department"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {confirmDeleteId && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow-md w-80">
            <p className="text-red-500 mb-4 text-center font-semibold">
              Are you sure you want to delete this department?
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
    </div>
  );
};

export default Department;

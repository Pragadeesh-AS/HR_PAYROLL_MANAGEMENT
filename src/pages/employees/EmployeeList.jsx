import React, { useState, useEffect } from "react";
import { employeeService } from "../../services/api";
import Table from "../../components/common/Table";
import Modal from "../../components/common/Modal";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import EmployeeForm from "./EmployeeForm";
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from "react-icons/fi";
import { AuthContext } from "../../context/AuthContextDefinition";
import "./EmployeeList.css";

const EmployeeList = () => {
  const { user } = React.useContext(AuthContext);
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    // Filter logic
    if (searchTerm.trim() === "") {
      setFilteredEmployees(employees);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = employees.filter(
        (emp) =>
          emp.name.toLowerCase().includes(term) ||
          emp.empId.toLowerCase().includes(term) ||
          emp.department.toLowerCase().includes(term)
      );
      setFilteredEmployees(filtered);
    }
  }, [searchTerm, employees]);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await employeeService.getAll();
      setEmployees(response.data);
    } catch (error) {
      console.error("Error fetching employees:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (employee = null) => {
    setEditingEmployee(employee);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEmployee(null);
  };

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      if (editingEmployee) {
        // Update existing
        await employeeService.update(editingEmployee.id, formData);
      } else {
        // Create new
        await employeeService.create(formData);
      }
      await fetchEmployees();
      handleCloseModal();
    } catch (error) {
      console.error("Error saving employee:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      try {
        await employeeService.delete(id);
        await fetchEmployees();
      } catch (error) {
        console.error("Error deleting employee:", error);
      }
    }
  };

  const columns = [
    { header: "Emp ID", accessor: "empId" },
    {
      header: "Name",
      accessor: "name",
      render: (row) => (
        <div>
          <div style={{ fontWeight: 500 }}>{row.name}</div>
          <div style={{ fontSize: "12px", color: "#6b7280" }}>{row.email}</div>
        </div>
      ),
    },
    { header: "Department", accessor: "department" },
    { header: "Position", accessor: "position" },
    {
      header: "Status",
      accessor: "status",
      render: (row) => (
        <span className={`status-badge status-${row.status}`}>
          {row.status.replace("_", " ")}
        </span>
      ),
    },
    {
      header: "Actions",
      render: (row) => (
        <div className="action-buttons">
          <button
            className="btn-icon-only"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenModal(row);
            }}
            title="Edit"
          >
            <FiEdit2 size={16} />
          </button>
          <button
            className="btn-icon-only btn-icon-delete"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(row.id);
            }}
            title="Delete"
          >
            <FiTrash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="employee-list-container">
      <div className="employee-list-header">
        <div>
          <h1>Employee Directory</h1>
          <p>Manage your company's workforce</p>
        </div>
        <Button icon={<FiPlus />} onClick={() => handleOpenModal()}>
          Add Employee
        </Button>
      </div>

      <div className="employee-controls">
        <div className="search-bar">
          <Input
            placeholder="Search by name, ID, or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<FiSearch />}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <div className="spinner"></div>
        </div>
      ) : (
        <Table columns={columns} data={filteredEmployees} />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingEmployee ? "Edit Employee" : "Add New Employee"}
        size="lg"
      >
        <EmployeeForm
          initialData={editingEmployee}
          onSubmit={handleSubmit}
          onCancel={handleCloseModal}
          isLoading={isSubmitting}
          userRole={user?.role}
          hrUsers={employees.filter(emp => emp.role === 'hr')}
        />
      </Modal>
    </div>
  );
};

export default EmployeeList;

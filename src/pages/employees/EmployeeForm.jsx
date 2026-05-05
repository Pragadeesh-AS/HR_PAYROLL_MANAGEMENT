import React, { useState, useEffect } from "react";
import Input, { Select } from "../../components/common/Input";
import Button from "../../components/common/Button";

const EmployeeForm = ({ initialData, onSubmit, onCancel, isLoading, userRole, hrUsers = [] }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    position: "",
    joinDate: new Date().toISOString().split("T")[0],
    basicSalary: "",
    status: "active",
    role: "employee",
    assignedHrId: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        email: initialData.email || "",
        phone: initialData.phone || "",
        department: initialData.department || "",
        position: initialData.position || "",
        joinDate: initialData.joinDate || new Date().toISOString().split("T")[0],
        basicSalary: initialData.salary?.basic || "",
        status: initialData.status || "active",
        role: initialData.role || "employee",
        assignedHrId: initialData.created_by || "",
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Construct the payload matching the API structure
    const payload = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      department: formData.department,
      position: formData.position,
      joinDate: formData.joinDate,
      status: formData.status,
      salary: {
        basic: Number(formData.basicSalary),
        // Simplistic calculation for mock data
        allowances: Number(formData.basicSalary) * 0.2, 
        deductions: Number(formData.basicSalary) * 0.1,
      },
      role: formData.role,
      assignedHrId: formData.assignedHrId
    };

    onSubmit(payload);
  };

  const departmentOptions = [
    { value: "IT", label: "Information Technology" },
    { value: "HR", label: "Human Resources" },
    { value: "Finance", label: "Finance" },
    { value: "Marketing", label: "Marketing" },
    { value: "Operations", label: "Operations" },
  ];

  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "on_leave", label: "On Leave" },
  ];

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        <Input
          label="Full Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter full name"
          required
        />
        <Input
          label="Email Address"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter email"
          required
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        <Input
          label="Phone Number"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="Enter phone number"
          required
        />
        <Input
          label="Join Date"
          type="date"
          name="joinDate"
          value={formData.joinDate}
          onChange={handleChange}
          required
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        <Select
          label="Department"
          name="department"
          value={formData.department}
          onChange={handleChange}
          options={departmentOptions}
          required
        />
        <Input
          label="Position"
          name="position"
          value={formData.position}
          onChange={handleChange}
          placeholder="e.g., Software Engineer"
          required
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        <Input
          label="Basic Salary (Monthly)"
          type="number"
          name="basicSalary"
          value={formData.basicSalary}
          onChange={handleChange}
          placeholder="Enter amount"
          required
        />
        {initialData && (
          <Select
            label="Status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            options={statusOptions}
            required
          />
        )}
        {userRole === 'admin' && !initialData && (
          <Select
            label="Role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            options={[
              { value: "employee", label: "Employee" },
              { value: "hr", label: "HR Manager" },
            ]}
            required
          />
        )}
      </div>

      {userRole === 'admin' && formData.role === 'employee' && !initialData && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <Select
            label="Assign to HR Manager (Optional)"
            name="assignedHrId"
            value={formData.assignedHrId}
            onChange={handleChange}
            options={[
              { value: "", label: "-- None (Admin Managed) --" },
              ...hrUsers.map(hr => ({ value: hr.id, label: `${hr.name} (${hr.empId})` }))
            ]}
          />
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "16px" }}>
        <Button variant="outline" onClick={onCancel} type="button" disabled={isLoading}>
          Cancel
        </Button>
        <Button variant="primary" type="submit" loading={isLoading}>
          {initialData ? "Update Employee" : "Add Employee"}
        </Button>
      </div>
    </form>
  );
};

export default EmployeeForm;

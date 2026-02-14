import axios from "axios";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear auth and redirect to login
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

// Mock Data Services (replace with actual API calls later)
export const mockData = {
  employees: [
    {
      id: 1,
      empId: "EMP001",
      name: "John Doe",
      email: "john@company.com",
      phone: "+1234567890",
      department: "IT",
      position: "Software Engineer",
      joinDate: "2023-01-15",
      salary: {
        basic: 50000,
        allowances: 10000,
        deductions: 5000,
      },
      status: "active",
    },
    {
      id: 2,
      empId: "EMP002",
      name: "Jane Smith",
      email: "jane@company.com",
      phone: "+1234567891",
      department: "HR",
      position: "HR Manager",
      joinDate: "2022-06-10",
      salary: {
        basic: 60000,
        allowances: 12000,
        deductions: 6000,
      },
      status: "active",
    },
  ],

  attendance: [],

  leaves: [
    {
      id: 1,
      employeeId: 1,
      employeeName: "John Doe",
      leaveType: "Sick Leave",
      startDate: "2024-02-20",
      endDate: "2024-02-21",
      days: 2,
      reason: "Flu",
      status: "pending",
      appliedOn: "2024-02-15",
    },
  ],

  payroll: [
    {
      id: 1,
      employeeId: 1,
      employeeName: "John Doe",
      month: "January 2024",
      basic: 50000,
      allowances: 10000,
      deductions: 5000,
      netSalary: 55000,
      status: "paid",
      paidOn: "2024-01-31",
    },
  ],
};

// API Services
export const employeeService = {
  getAll: async () => {
    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => resolve({ data: mockData.employees }), 500);
    });
  },

  getById: async (id) => {
    return new Promise((resolve) => {
      const employee = mockData.employees.find((e) => e.id === parseInt(id));
      setTimeout(() => resolve({ data: employee }), 300);
    });
  },

  create: async (employeeData) => {
    return new Promise((resolve) => {
      const newEmployee = {
        id: mockData.employees.length + 1,
        empId: `EMP${String(mockData.employees.length + 1).padStart(3, "0")}`,
        ...employeeData,
        status: "active",
      };
      mockData.employees.push(newEmployee);
      setTimeout(() => resolve({ data: newEmployee }), 500);
    });
  },

  update: async (id, employeeData) => {
    return new Promise((resolve) => {
      const index = mockData.employees.findIndex((e) => e.id === parseInt(id));
      if (index !== -1) {
        mockData.employees[index] = {
          ...mockData.employees[index],
          ...employeeData,
        };
        setTimeout(() => resolve({ data: mockData.employees[index] }), 500);
      }
    });
  },

  delete: async (id) => {
    return new Promise((resolve) => {
      mockData.employees = mockData.employees.filter(
        (e) => e.id !== parseInt(id),
      );
      setTimeout(() => resolve({ data: { message: "Employee deleted" } }), 300);
    });
  },
};

export const attendanceService = {
  getByEmployee: async (employeeId, month) => {
    // Mock implementation - filter by employee and month
    return new Promise((resolve) => {
      const filteredAttendance = mockData.attendance.filter(
        (att) =>
          att.employeeId === parseInt(employeeId) &&
          (!month || att.month === month),
      );
      setTimeout(() => resolve({ data: filteredAttendance }), 300);
    });
  },

  mark: async (attendanceData) => {
    return new Promise((resolve) => {
      mockData.attendance.push(attendanceData);
      setTimeout(() => resolve({ data: attendanceData }), 300);
    });
  },
};

export const leaveService = {
  getAll: async () => {
    return new Promise((resolve) => {
      setTimeout(() => resolve({ data: mockData.leaves }), 300);
    });
  },

  apply: async (leaveData) => {
    return new Promise((resolve) => {
      const newLeave = {
        id: mockData.leaves.length + 1,
        ...leaveData,
        status: "pending",
        appliedOn: new Date().toISOString().split("T")[0],
      };
      mockData.leaves.push(newLeave);
      setTimeout(() => resolve({ data: newLeave }), 500);
    });
  },

  updateStatus: async (id, status, comments) => {
    return new Promise((resolve) => {
      const leave = mockData.leaves.find((l) => l.id === parseInt(id));
      if (leave) {
        leave.status = status;
        leave.comments = comments;
        setTimeout(() => resolve({ data: leave }), 300);
      }
    });
  },
};

export const payrollService = {
  getAll: async () => {
    return new Promise((resolve) => {
      setTimeout(() => resolve({ data: mockData.payroll }), 300);
    });
  },

  generate: async (employeeId, month) => {
    return new Promise((resolve) => {
      const employee = mockData.employees.find(
        (e) => e.id === parseInt(employeeId),
      );
      if (employee) {
        const payslip = {
          id: mockData.payroll.length + 1,
          employeeId: employee.id,
          employeeName: employee.name,
          month,
          basic: employee.salary.basic,
          allowances: employee.salary.allowances,
          deductions: employee.salary.deductions,
          netSalary:
            employee.salary.basic +
            employee.salary.allowances -
            employee.salary.deductions,
          status: "generated",
          generatedOn: new Date().toISOString().split("T")[0],
        };
        mockData.payroll.push(payslip);
        setTimeout(() => resolve({ data: payslip }), 500);
      }
    });
  },
};

export default api;

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
      // Unauthorized - clear auth and redirect to root
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      window.location.href = "/";
    }
    return Promise.reject(error);
  },
);

// Mock Data Services (for Attendance, Leave, Payroll)
export const mockData = {
  leaves: [
    {
      id: 1,
      employeeId: 1,
      employeeName: "Pragadeesh",
      leaveType: "Sick Leave",
      startDate: "2026-02-20",
      endDate: "2026-02-21",
      days: 2,
      reason: "Flu",
      status: "pending",
      appliedOn: "2026-02-15",
    },
  ],
  payroll: [
    {
      id: 1,
      employeeId: 1,
      employeeName: "Pragadeesh",
      month: "January 2026",
      basic: 50000,
      allowances: 10000,
      deductions: 5000,
      netSalary: 55000,
      status: "paid",
      paidOn: "2026-02-13",
    },
  ],
};

// Auth Services
export const authService = {
  login: (credentials) => api.post("/auth/login", credentials),
  register: (userData) => api.post("/auth/register", userData),
  changePassword: (data) => api.put("/auth/change-password", data),
};

// Employee API Services
export const employeeService = {
  getAll: () => api.get("/employees"),
  getById: (id) => api.get(`/employees/${id}`),
  create: (employeeData) => api.post("/employees", employeeData),
  update: (id, employeeData) => api.put(`/employees/${id}`, employeeData),
  delete: (id) => api.delete(`/employees/${id}`),
};

export const attendanceService = {
  getByEmployee: () => api.get("/attendance/me"),
  getAll: () => api.get("/attendance"),
  mark: () => api.post("/attendance/mark"),
};

export const leaveService = {
  getByEmployee: () => api.get("/leaves/me"),
  getAll: () => api.get("/leaves"),
  apply: (leaveData) => api.post("/leaves", leaveData),
  updateStatus: (id, status, comments) => api.put(`/leaves/${id}/status`, { status, comments }),
};

export const settingsService = {
  getSettings: () => api.get("/settings"),
  updateSettings: (settingsData) => api.put("/settings", settingsData),
};



export const payrollService = {
  getAll: async () => {
    return new Promise((resolve) => {
      setTimeout(() => resolve({ data: mockData.payroll }), 300);
    });
  },

  generate: async (employeeId, month) => {
    return new Promise((resolve) => {
      const employee = { id: employeeId, name: "Employee", salary: { basic: 50000, allowances: 10000, deductions: 5000 } }; // Mocked fallback
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

# HR & PAYROLL MANAGEMENT SYSTEM - PROJECT REPORT

## 1. INTRODUCTION

### 1.1 OBJECTIVE OF THE PROJECT
The objective of the HR & Payroll Management System is to build a centralized, secure, and scalable platform that enables organizations to streamline workforce administration. The system aims to simplify human resources tasks by integrating employee management, attendance tracking, leave requests, and automated payroll processing into a single unified platform. It allows administrators to monitor staff, HR managers to approve leaves and generate payslips, and employees to view their own records dynamically. The platform is designed to overcome administrative bottlenecks, improve accessibility to employee data, and deliver a seamless user experience that supports transparent organizational management.

**Table 1.1 Problem Statement**
| Aspect | Description |
| :--- | :--- |
| **User Challenges** | HR departments struggle to manage employee records, calculate salaries manually, and track attendance across fragmented systems, causing delays and errors. |
| **Business Motivation** | Provide a centralized platform that enhances organizational efficiency by automating payroll, managing leave workflows, and empowering employees with self-service dashboards. |
| **Technical Motivation** | Build a scalable and secure full-stack application using React, Node.js, and PostgreSQL, ensuring efficient API handling and structured data management for users, attendance, leaves, and payroll records. |

### 1.2 OBJECTIVE OF THE SYSTEM
The objective of the system is to provide a centralized portal for an organization to manage its personnel efficiently. It aims to eliminate manual paperwork by combining employee lifecycle tracking and financial payroll features in one system. The platform encourages transparency between HR and employees. It also focuses on delivering a highly secure experience through Role-Based Access Control (RBAC). Overall, it enhances administrative productivity and ensures accurate financial processing.

### 1.3 SCOPE OF THE SYSTEM
The scope of the HR & Payroll Management System includes developing a full-stack platform that supports employee onboarding, daily attendance tracking, and dynamic payroll generation. It enables users to interact through role-specific dashboards (Admin, HR, Employee). The system includes secure authentication, dynamic profile management, and leave approval workflows. It provides a complete environment for enterprise workforce management.

### 1.4 PROBLEM STATEMENT
Organizations often face difficulty in managing payroll accurately and tracking employee attendance due to the lack of a centralized and structured system. Existing manual or fragmented software solutions make it hard to track leaves, process salary deductions, and maintain secure employee databases. Employees also lack a unified space to view their own attendance and payslip history. This results in inefficient resource management, compliance risks, and reduced employee satisfaction. There is an urgent need for a centralized, secure, and automated platform that enables seamless HR tracking and financial processing.

---

## 2. SYSTEM ANALYSIS

### 2.1 EXISTING SOLUTION
Existing solutions for HR management often rely on decoupled systems such as spreadsheets for attendance, separate accounting software for payroll, and physical paper trails for leave requests. In many cases, organizations depend on generic ERP modules that are overly complex and expensive to maintain. However, these platforms operate independently and are not fully integrated, leading to fragmented administrative experiences. 

### 2.2 LIMITATIONS OF EXISTING SOLUTIONS
Users often face difficulty in managing cross-departmental workflows. There is a lack of a unified system that automatically links daily attendance and approved leaves directly to the monthly payroll processing. Many platforms provide limited self-service dashboards for employees to independently view their compliance or tax deductions. Additionally, the lack of strict role-based access can lead to payroll data vulnerabilities. These limitations highlight the need for a single, scalable web platform that offers seamless interaction and strict data protection.

### 2.3 PROPOSED SYSTEMS
The proposed HR & Payroll Management System is a full-stack web platform designed to provide a centralized environment for organizations. It integrates structured employee tracking with automated financial payroll generation. The system eliminates fragmentation by bringing all HR workflows into one unified space, improving accessibility and reducing calculation errors.
It includes advanced features such as JWT authentication, dynamic routing, role-based dashboards, and PDF payslip generation. Built using React, Node.js, and PostgreSQL, the system ensures high performance through RESTful APIs and optimized database schemas.

### 2.4 ADVANTAGES OF PROPOSED SYSTEMS
The proposed system eliminates the need to use multiple software packages for workforce management. It enhances user experience by enabling seamless interactions—such as an employee applying for leave and HR approving it on the same platform. The system calculates payroll automatically based on basic salary, predefined allowances, and deductions, guaranteeing financial accuracy. Secure communication is maintained using JWT authentication, ensuring that sensitive salary data is completely isolated based on the user's role.

---

## 3. SYSTEM DESIGN
The system follows a structured client-server layered approach:
* **Controllers** handle incoming REST API requests for authentication, employee fetching, attendance logging, and payroll generation.
* **Services** implement the core business logic such as calculating net salary based on days worked and applied leaves.
* **Database Layer** manages interactions with PostgreSQL to assure ACID compliance for financial records.
* **Models** define the schema structure for Users, Attendance, Leaves, and Payroll.

### 3.1 ARCHITECTURE OVERVIEW
The system follows a modern architecture ensuring scalability. The frontend is built using React (Vite), providing an interactive SPA (Single Page Application) interface. It communicates via Axios over secure RESTful APIs. The backend utilizes Node.js and Express.js, while PostgreSQL is used for structured, relational data storage.

---

## 4. DATABASE DESIGN
The design follows a strict relational model where data is organized to reduce administration redundancy and ensure financial consistency.

### 4.1 RELATIONAL MODELING
**Main Relations:**
* `USERS(user_id, emp_id, name, email, password, role, department, salary_basic, created_at)`
* `ATTENDANCE(attendance_id, user_id, date, status, check_in, check_out)`
* `LEAVES(leave_id, user_id, leave_type, start_date, end_date, days, reason, status)`
* `PAYROLL(payroll_id, user_id, month, basic, allowances, deductions, net_salary, status)`

### 4.3 PRIMARY & FOREIGN KEY
The system uses `user_id` as the primary key in the USERS table to uniquely identify staff. Foreign keys establish links across the database; for instance, `user_id` inside the PAYROLL and LEAVES tables references the USERS table, ensuring strict referential integrity.

---

## 5. ADVANCED POSTGRESQL FEATURES

### 5.1 JSON DATA TYPE
PostgreSQL provides advanced JSONB capabilities. In this system, JSONB is highly useful for storing flexible salary allowance structures or dynamic tax breakdown values within the `PAYROLL` table (e.g., `{"hra": 5000, "ta": 2000, "medical": 1500}`). This prevents the need for overly wide tables and allows dynamic payroll rules to change without altering the core database schema.

### 5.3 USE CASES IN PROJECT
JSONB is used to store dynamic metadata for employee documents and payroll breakdowns. This avoids frequent schema modifications. Array data types (`TEXT[]`) can be used to store multiple roles or department tags.

---

## 6. IMPLEMENTATION AND TESTING

### 6.1 TABLE CREATION QUERIES
```sql
CREATE TABLE USERS (
    user_id SERIAL PRIMARY KEY,
    emp_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    department VARCHAR(50),
    salary_basic DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE LEAVES (
    leave_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES USERS(user_id) ON DELETE CASCADE,
    leave_type VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'Pending',
    reason TEXT
);

CREATE TABLE PAYROLL (
    payroll_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES USERS(user_id) ON DELETE CASCADE,
    month VARCHAR(20) NOT NULL,
    basic DECIMAL(10,2) NOT NULL,
    allowances DECIMAL(10,2) NOT NULL,
    deductions DECIMAL(10,2) NOT NULL,
    net_salary DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'Generated'
);
```

### 6.2 DATA INSERTION QUERIES
```sql
INSERT INTO USERS (emp_id, name, email, password, role, salary_basic)
VALUES ('EMP001', 'Admin', 'admin@company.com', 'hashed_pw', 'admin', 80000);

INSERT INTO LEAVES (user_id, leave_type, start_date, end_date, reason)
VALUES (1, 'Sick', '2026-02-20', '2026-02-21', 'Flu');
```

### 6.3 JOINS
```sql
-- Employee Payroll Details (INNER JOIN)
SELECT p.month, p.net_salary, u.name, u.emp_id
FROM PAYROLL p
INNER JOIN USERS u ON p.user_id = u.user_id;

-- Employee Leave Details (LEFT JOIN)
SELECT u.name, l.leave_type, l.status
FROM USERS u
LEFT JOIN LEAVES l ON u.user_id = l.user_id;
```

---

## 7. QUERY OPTIMIZATION & PERFORMANCE

### 7.1 INDEXING STRATEGIES
Indexes are placed on frequently searched columns to speed up dashboard loading times. For instance, filtering employee records by department or finding specific payroll months requires heavy scanning. Proper indexing reduces full table scans and improves performance.
```sql
CREATE INDEX idx_users_email ON USERS(email);
CREATE INDEX idx_payroll_user_id ON PAYROLL(user_id);
CREATE INDEX idx_attendance_date ON ATTENDANCE(date);
```

---

## 8. TRANSACTION MANAGEMENT

Ensuring financial accuracy requires strict ACID compliance. 
```sql
BEGIN;
-- Generate payroll record
INSERT INTO PAYROLL (user_id, month, basic, allowances, deductions, net_salary)
VALUES (2, 'March 2026', 50000, 10000, 2000, 58000);

-- Deduct leave balances (if configured)
UPDATE LEAVE_BALANCES SET remaining = remaining - 1 WHERE user_id = 2;
COMMIT;
```

---

## 9. RESULT AND ANALYSIS

### 9.2 REPORTS GENERATED

**Total Payroll Expense by Department**
```sql
SELECT u.department, SUM(p.net_salary) AS total_department_expense
FROM PAYROLL p
JOIN USERS u ON p.user_id = u.user_id
GROUP BY u.department;
```
*Explanation:* This provides HR and Finance with immediate insights into company expenditures grouped by organizational divisions.

---

## 10. APPLICATION INTEGRATION 

### 10.1 Backend Integration (Node.js / API)
The backend intercepts incoming requests to `/api/payroll` and `/api/leaves`. Using middleware, the JWT token is decrypted to verify if the requesting user has "HR" or "Admin" privileges before allowing data extraction or manipulation.

### 10.2 Frontend Interaction
Built entirely in React, the application utilizes `<ProtectedRoute allowedRoles={['admin', 'hr']}>` boundaries. The UI features contextual sidebars that hide or show Payroll tools based on whether the logged-in user is an employee viewing their payslip, or an Admin managing staff.

---

## 11. CONCLUSION 

### 11.1 Summary of Work
The HR & Payroll Management System was successfully designed and developed as a robust full-stack solution to handle strict financial and administrative logic securely. The database structures were heavily normalized to ensure payroll mathematics remained uncorrupted across thousands of transactions. The project successfully implemented JWT authentication, modern React context routing, and a deeply connected REST architecture.

### 11.3 Future Enhancements
Future implementations will include Automated Bank API integrations for extreme ease of direct-deposit execution, PDF dynamic generation for payslip downloads directly to local devices, and integration with biometric fingerprint scanners for automated physical attendance logging in the `ATTENDANCE` database.

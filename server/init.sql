-- hr_payroll_db schema initialization

CREATE TABLE IF NOT EXISTS USERS (
    user_id SERIAL PRIMARY KEY,
    emp_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    department VARCHAR(50),
    position VARCHAR(100),
    phone VARCHAR(20),
    salary_basic DECIMAL(10,2) DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'active',
    join_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT REFERENCES USERS(user_id)
);

CREATE TABLE IF NOT EXISTS ATTENDANCE (
    attendance_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES USERS(user_id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status VARCHAR(20) NOT NULL,
    check_in TIME,
    check_out TIME
);

CREATE TABLE IF NOT EXISTS LEAVES (
    leave_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES USERS(user_id) ON DELETE CASCADE,
    leave_type VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days INT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    reason TEXT,
    applied_on DATE DEFAULT CURRENT_DATE
);

CREATE TABLE IF NOT EXISTS PAYROLL (
    payroll_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES USERS(user_id) ON DELETE CASCADE,
    month VARCHAR(20) NOT NULL,
    basic DECIMAL(10,2) NOT NULL,
    allowances DECIMAL(10,2) NOT NULL,
    deductions DECIMAL(10,2) NOT NULL,
    net_salary DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'generated',
    paid_on DATE
);

CREATE TABLE IF NOT EXISTS SETTINGS (
    id SERIAL PRIMARY KEY,
    shift_start_time TIME NOT NULL DEFAULT '09:00:00',
    shift_end_time TIME NOT NULL DEFAULT '17:00:00'
);

-- Note: Ensure to run this script in pgAdmin or psql before starting the server.

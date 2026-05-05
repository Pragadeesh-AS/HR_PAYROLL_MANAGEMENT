import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContextDefinition";
import { employeeService } from "../../services/api";
import api from "../../services/api";
import Table from "../../components/common/Table";
import Modal from "../../components/common/Modal";
import Button from "../../components/common/Button";
import {
  FiDollarSign, FiPlusCircle, FiCheckCircle, FiTrash2,
  FiTrendingUp, FiUsers, FiCalendar, FiEdit2, FiRefreshCw
} from "react-icons/fi";
import "./Payroll.css";

const payrollService = {
  getAll: () => api.get("/payroll"),
  getMyPayslips: () => api.get("/payroll/me"),
  preview: (userId, month) => api.get(`/payroll/preview?userId=${userId}&month=${month}`),
  generate: (data) => api.post("/payroll/generate", data),
  markAsPaid: (id) => api.put(`/payroll/${id}/pay`),
  edit: (id, data) => api.put(`/payroll/${id}/edit`, data),
  delete: (id) => api.delete(`/payroll/${id}`),
};

const EMPTY_FORM = { userId: "", month: "" };
const EMPTY_COMPONENTS = { basic: "", hra: "", transport: "", pf: "", professionalTax: "", absenceDeduction: "" };

const PayrollDashboard = () => {
  const { user } = useContext(AuthContext);
  const isAdminOrHR = user?.role === "admin" || user?.role === "hr";

  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Generate modal state
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [components, setComponents] = useState(EMPTY_COMPONENTS);
  const [previewing, setPreviewing] = useState(false);
  const [previewInfo, setPreviewInfo] = useState(null);

  // Edit modal state
  const [editRecord, setEditRecord] = useState(null);
  const [editComponents, setEditComponents] = useState(EMPTY_COMPONENTS);
  const [saving, setSaving] = useState(false);

  // View payslip modal
  const [payslipDetail, setPayslipDetail] = useState(null);

  useEffect(() => {
    fetchPayroll();
    if (isAdminOrHR) fetchEmployees();
  }, []);

  const fetchPayroll = async () => {
    setLoading(true);
    try {
      const res = isAdminOrHR ? await payrollService.getAll() : await payrollService.getMyPayslips();
      setRecords(res.data);
    } catch (err) {
      console.error("Error fetching payroll:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await employeeService.getAll();
      setEmployees(res.data.filter((e) => e.role !== "admin"));
    } catch (err) {
      console.error("Error fetching employees:", err);
    }
  };

  // Auto-load preview when both employee and month are selected
  const handleFormChange = async (field, value) => {
    const updated = { ...form, [field]: value };
    setForm(updated);

    if (updated.userId && updated.month) {
      setPreviewing(true);
      try {
        const res = await payrollService.preview(updated.userId, updated.month);
        const d = res.data.defaults;
        setPreviewInfo(res.data);
        setComponents({
          basic: d.basic,
          hra: d.hra,
          transport: d.transport,
          pf: d.pf,
          professionalTax: d.professionalTax,
          absenceDeduction: d.absenceDeduction,
        });
      } catch (err) {
        console.error("Preview failed:", err);
      } finally {
        setPreviewing(false);
      }
    }
  };

  const calcNet = (c) => {
    const b = parseFloat(c.basic) || 0;
    const allow = (parseFloat(c.hra) || 0) + (parseFloat(c.transport) || 0);
    const ded = (parseFloat(c.pf) || 0) + (parseFloat(c.professionalTax) || 0) + (parseFloat(c.absenceDeduction) || 0);
    return (b + allow - ded).toFixed(2);
  };

  const handleGenerate = async () => {
    if (!form.userId || !form.month) return alert("Please select an employee and month.");
    setGenerating(true);
    try {
      await payrollService.generate({ userId: form.userId, month: form.month, overrides: components });
      setIsGenerateOpen(false);
      setForm(EMPTY_FORM);
      setComponents(EMPTY_COMPONENTS);
      setPreviewInfo(null);
      fetchPayroll();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to generate payroll");
    } finally {
      setGenerating(false);
    }
  };

  const openEdit = (record) => {
    setEditRecord(record);
    // We only store basic, allowances, deductions in DB.
    // For editing, split allowances into hra + transport, and deductions into pf + professionalTax + absence
    // Since we don't store individual breakdown, pre-fill with stored totals split proportionally
    const basic = parseFloat(record.basic);
    const hra = parseFloat((basic * 0.20).toFixed(2));
    const transport = 1600;
    const pf = parseFloat((basic * 0.12).toFixed(2));
    const professionalTax = 200;
    const absenceDeduction = parseFloat((parseFloat(record.deductions) - pf - professionalTax).toFixed(2));
    setEditComponents({
      basic,
      hra,
      transport,
      pf,
      professionalTax,
      absenceDeduction: Math.max(0, absenceDeduction),
    });
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      await payrollService.edit(editRecord.id, editComponents);
      setEditRecord(null);
      fetchPayroll();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const handleMarkPaid = async (id) => {
    if (!window.confirm("Mark this payroll as Paid?")) return;
    try {
      await payrollService.markAsPaid(id);
      fetchPayroll();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this payroll record? This cannot be undone.")) return;
    try {
      await payrollService.delete(id);
      fetchPayroll();
    } catch (err) {
      alert("Failed to delete payroll record");
    }
  };

  const fmtCurrency = (val) =>
    `₹${parseFloat(val || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

  const totalNetSalary = records.reduce((sum, r) => sum + parseFloat(r.netSalary || 0), 0);
  const paidCount = records.filter((r) => r.status === "paid").length;
  const pendingCount = records.filter((r) => r.status === "generated").length;

  const StatusBadge = ({ status }) => (
    <span className={`payroll-badge payroll-badge-${status}`}>
      {status === "paid" ? "✓ Paid" : "⏳ Pending"}
    </span>
  );

  const ComponentInput = ({ label, field, stateObj, setter, highlight }) => (
    <div className={`comp-input-group ${highlight ? "comp-highlight" : ""}`}>
      <label className="comp-label">{label}</label>
      <div className="comp-input-wrap">
        <span className="comp-rupee">₹</span>
        <input
          type="number"
          className="comp-input"
          value={stateObj[field]}
          onChange={(e) => setter({ ...stateObj, [field]: e.target.value })}
          min="0"
          step="0.01"
        />
      </div>
    </div>
  );

  const adminColumns = [
    {
      header: "Employee",
      accessor: "employeeName",
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600 }}>{row.employeeName}</div>
          <div style={{ fontSize: "12px", color: "#6b7280" }}>{row.empId} • {row.department}</div>
        </div>
      ),
    },
    { header: "Month", accessor: "month" },
    { header: "Basic", accessor: "basic", render: (row) => fmtCurrency(row.basic) },
    { header: "Allowances", accessor: "allowances", render: (row) => fmtCurrency(row.allowances) },
    { header: "Deductions", accessor: "deductions", render: (row) => <span style={{ color: "#ef4444" }}>{fmtCurrency(row.deductions)}</span> },
    { header: "Net Salary", accessor: "netSalary", render: (row) => <strong style={{ color: "#10b981" }}>{fmtCurrency(row.netSalary)}</strong> },
    { header: "Status", accessor: "status", render: (row) => <StatusBadge status={row.status} /> },
    {
      header: "Actions",
      accessor: "id",
      render: (row) => (
        <div className="payroll-actions">
          <button className="payroll-btn-view" onClick={() => setPayslipDetail(row)}>View</button>
          <button className="payroll-btn-edit" onClick={() => openEdit(row)} title="Edit manually">
            <FiEdit2 size={13} />
          </button>
          {row.status !== "paid" && (
            <button className="payroll-btn-pay" onClick={() => handleMarkPaid(row.id)}>
              <FiCheckCircle size={14} /> Pay
            </button>
          )}
          {user?.role === "admin" && (
            <button className="payroll-btn-del" onClick={() => handleDelete(row.id)}>
              <FiTrash2 size={14} />
            </button>
          )}
        </div>
      ),
    },
  ];

  const employeeColumns = [
    { header: "Month", accessor: "month" },
    { header: "Basic Pay", accessor: "basic", render: (row) => fmtCurrency(row.basic) },
    { header: "Allowances", accessor: "allowances", render: (row) => fmtCurrency(row.allowances) },
    { header: "Deductions", accessor: "deductions", render: (row) => <span style={{ color: "#ef4444" }}>{fmtCurrency(row.deductions)}</span> },
    { header: "Net Salary", accessor: "netSalary", render: (row) => <strong style={{ color: "#10b981" }}>{fmtCurrency(row.netSalary)}</strong> },
    { header: "Status", accessor: "status", render: (row) => <StatusBadge status={row.status} /> },
    { header: "Paid On", accessor: "paidOn", render: (row) => row.paidOn ? new Date(row.paidOn).toLocaleDateString() : "—" },
    { header: "Slip", render: (row) => <button className="payroll-btn-view" onClick={() => setPayslipDetail(row)}>View Slip</button> },
  ];

  return (
    <div className="payroll-container">
      {/* Header */}
      <div className="payroll-header">
        <div>
          <h1>Payroll Management</h1>
          <p>{isAdminOrHR ? "Generate and manage employee salaries" : "View your monthly payslips"}</p>
        </div>
        {isAdminOrHR && (
          <Button icon={<FiPlusCircle />} onClick={() => setIsGenerateOpen(true)}>
            Generate Payroll
          </Button>
        )}
      </div>

      {/* Stats */}
      {isAdminOrHR && (
        <div className="payroll-stats-grid">
          <div className="payroll-stat-card stat-blue">
            <div className="stat-icon"><FiDollarSign /></div>
            <div><div className="stat-label">Total Payroll</div><div className="stat-value">{fmtCurrency(totalNetSalary)}</div></div>
          </div>
          <div className="payroll-stat-card stat-green">
            <div className="stat-icon"><FiCheckCircle /></div>
            <div><div className="stat-label">Paid</div><div className="stat-value">{paidCount} records</div></div>
          </div>
          <div className="payroll-stat-card stat-orange">
            <div className="stat-icon"><FiCalendar /></div>
            <div><div className="stat-label">Pending</div><div className="stat-value">{pendingCount} records</div></div>
          </div>
          <div className="payroll-stat-card stat-purple">
            <div className="stat-icon"><FiUsers /></div>
            <div><div className="stat-label">Employees</div><div className="stat-value">{employees.length} active</div></div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="payroll-table-card">
        <h2>{isAdminOrHR ? "All Payroll Records" : "My Payslips"}</h2>
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px" }}><div className="spinner"></div></div>
        ) : records.length === 0 ? (
          <div className="payroll-empty">
            <FiTrendingUp size={48} style={{ color: "#d1d5db" }} />
            <p>No payroll records found.</p>
            {isAdminOrHR && <p style={{ fontSize: "14px", color: "#9ca3af" }}>Click "Generate Payroll" to create the first one.</p>}
          </div>
        ) : (
          <Table columns={isAdminOrHR ? adminColumns : employeeColumns} data={records} />
        )}
      </div>

      {/* ── GENERATE MODAL ── */}
      <Modal isOpen={isGenerateOpen} onClose={() => { setIsGenerateOpen(false); setPreviewInfo(null); setForm(EMPTY_FORM); setComponents(EMPTY_COMPONENTS); }} title="Generate Payroll" size="lg">
        <div className="gen-modal-body">
          <div className="gen-selectors">
            <div>
              <label className="payroll-label">Employee</label>
              <select className="payroll-select" value={form.userId} onChange={(e) => handleFormChange("userId", e.target.value)}>
                <option value="">— Select Employee —</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>{emp.name} ({emp.empId}) — {emp.department || "General"}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="payroll-label">Payroll Month</label>
              <input type="month" className="payroll-select" value={form.month} onChange={(e) => handleFormChange("month", e.target.value)} />
            </div>
          </div>

          {previewing && <div style={{ textAlign: "center", padding: "16px" }}><div className="spinner" style={{ margin: "0 auto" }}></div><p style={{ color: "#6b7280", marginTop: "8px", fontSize: "13px" }}>Loading auto-calculated values…</p></div>}

          {previewInfo && !previewing && (
            <>
              <div className="gen-preview-banner">
                <span>Auto-calculated for <strong>{previewInfo.employeeName}</strong> ({previewInfo.department})</span>
                <span style={{ fontSize: "12px" }}>Working days: {previewInfo.totalWorkingDays} | Absent: {previewInfo.absentDays} | Approved leaves: {previewInfo.approvedLeaveDays}</span>
              </div>

              <div className="comp-section">
                <div className="comp-section-title earnings-title">📈 Earnings</div>
                <div className="comp-grid">
                  <ComponentInput label="Basic Salary" field="basic" stateObj={components} setter={setComponents} />
                  <ComponentInput label="HRA" field="hra" stateObj={components} setter={setComponents} />
                  <ComponentInput label="Transport Allowance" field="transport" stateObj={components} setter={setComponents} />
                </div>

                <div className="comp-section-title deductions-title" style={{ marginTop: "16px" }}>📉 Deductions</div>
                <div className="comp-grid">
                  <ComponentInput label="Provident Fund (PF)" field="pf" stateObj={components} setter={setComponents} />
                  <ComponentInput label="Professional Tax" field="professionalTax" stateObj={components} setter={setComponents} />
                  <ComponentInput label="Absence Deduction" field="absenceDeduction" stateObj={components} setter={setComponents} highlight />
                </div>

                <div className="net-preview-bar">
                  <span>Net Salary</span>
                  <span className="net-preview-val">₹{parseFloat(calcNet(components)).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </>
          )}

          {!previewInfo && !previewing && (
            <div className="payroll-info-box">Select an employee and month to auto-load salary components. You can then edit each value before generating.</div>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "20px" }}>
            <Button variant="outline" onClick={() => { setIsGenerateOpen(false); setPreviewInfo(null); }}>Cancel</Button>
            <Button onClick={handleGenerate} loading={generating} icon={<FiDollarSign />} disabled={!previewInfo}>
              Generate
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── EDIT MODAL ── */}
      {editRecord && (
        <Modal isOpen={!!editRecord} onClose={() => setEditRecord(null)} title={`Edit Payroll — ${editRecord.employeeName} (${editRecord.month})`} size="lg">
          <div className="gen-modal-body">
            <div className="gen-preview-banner">
              Editing existing payroll for <strong>{editRecord.employeeName}</strong> • {editRecord.month}
            </div>

            <div className="comp-section">
              <div className="comp-section-title earnings-title">📈 Earnings</div>
              <div className="comp-grid">
                <ComponentInput label="Basic Salary" field="basic" stateObj={editComponents} setter={setEditComponents} />
                <ComponentInput label="HRA" field="hra" stateObj={editComponents} setter={setEditComponents} />
                <ComponentInput label="Transport Allowance" field="transport" stateObj={editComponents} setter={setEditComponents} />
              </div>

              <div className="comp-section-title deductions-title" style={{ marginTop: "16px" }}>📉 Deductions</div>
              <div className="comp-grid">
                <ComponentInput label="Provident Fund (PF)" field="pf" stateObj={editComponents} setter={setEditComponents} />
                <ComponentInput label="Professional Tax" field="professionalTax" stateObj={editComponents} setter={setEditComponents} />
                <ComponentInput label="Absence Deduction" field="absenceDeduction" stateObj={editComponents} setter={setEditComponents} highlight />
              </div>

              <div className="net-preview-bar">
                <span>Net Salary (Preview)</span>
                <span className="net-preview-val">₹{parseFloat(calcNet(editComponents)).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "20px" }}>
              <Button variant="outline" onClick={() => setEditRecord(null)}>Cancel</Button>
              <Button onClick={handleSaveEdit} loading={saving} icon={<FiEdit2 />}>Save Changes</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── VIEW PAYSLIP MODAL ── */}
      {payslipDetail && (
        <Modal isOpen={!!payslipDetail} onClose={() => setPayslipDetail(null)} title="Payslip Detail" size="md">
          <div className="payslip-modal">
            <div className="payslip-header-info">
              <div>
                <div className="payslip-name">{payslipDetail.employeeName}</div>
                <div className="payslip-meta">{payslipDetail.empId} • {payslipDetail.department}</div>
              </div>
              <div className="payslip-month-badge">{payslipDetail.month}</div>
            </div>
            <div className="payslip-rows">
              <div className="payslip-section-title">Earnings</div>
              <div className="payslip-row"><span>Basic Pay</span><span>{fmtCurrency(payslipDetail.basic)}</span></div>
              <div className="payslip-row"><span>Allowances (HRA + Transport)</span><span>{fmtCurrency(payslipDetail.allowances)}</span></div>
              <div className="payslip-row total-row"><span>Gross Pay</span><span>{fmtCurrency(parseFloat(payslipDetail.basic) + parseFloat(payslipDetail.allowances))}</span></div>
              <div className="payslip-section-title" style={{ marginTop: "16px" }}>Deductions</div>
              <div className="payslip-row deduction-row"><span>Total Deductions</span><span>- {fmtCurrency(payslipDetail.deductions)}</span></div>
              <div className="payslip-divider"></div>
              <div className="payslip-row net-row"><span>Net Salary</span><span>{fmtCurrency(payslipDetail.netSalary)}</span></div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "20px" }}>
              <StatusBadge status={payslipDetail.status} />
              {payslipDetail.paidOn && <span style={{ fontSize: "13px", color: "#6b7280" }}>Paid on {new Date(payslipDetail.paidOn).toLocaleDateString()}</span>}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default PayrollDashboard;

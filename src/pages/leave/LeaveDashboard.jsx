import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContextDefinition";
import { leaveService } from "../../services/api";
import Table from "../../components/common/Table";
import Modal from "../../components/common/Modal";
import Input, { Select } from "../../components/common/Input";
import Button from "../../components/common/Button";
import "./Leave.css";

const LeaveDashboard = () => {
  const { user } = useContext(AuthContext);
  const isAdminOrHR = user?.role === "admin" || user?.role === "hr";

  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Apply Leave Modal State
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [leaveData, setLeaveData] = useState({
    leaveType: "Sick Leave",
    startDate: "",
    endDate: "",
    reason: ""
  });
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      let response;
      if (isAdminOrHR) {
        response = await leaveService.getAll();
      } else {
        response = await leaveService.getByEmployee();
      }
      setLeaves(response.data);
    } catch (error) {
      console.error("Error fetching leaves:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyLeave = async () => {
    if (!leaveData.startDate || !leaveData.endDate || !leaveData.reason) {
      return alert("Please fill all fields");
    }
    setApplying(true);
    try {
      await leaveService.apply(leaveData);
      setIsApplyModalOpen(false);
      setLeaveData({ leaveType: "Sick Leave", startDate: "", endDate: "", reason: "" });
      fetchLeaves();
    } catch (error) {
      alert("Failed to apply for leave");
    } finally {
      setApplying(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await leaveService.updateStatus(id, status, "");
      fetchLeaves();
    } catch (error) {
      alert("Failed to update status");
    }
  };

  const formatStatus = (status) => {
    if (!status) return 'Pending';
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };

  const getStatusBadge = (status) => {
    const formatted = formatStatus(status);
    return <span className={`status-badge status-${formatted}`}>{formatted}</span>;
  };

  const leaveTypes = [
    { value: "Sick Leave", label: "Sick Leave" },
    { value: "Casual Leave", label: "Casual Leave" },
    { value: "Earned Leave", label: "Earned Leave" },
    { value: "Maternity/Paternity", label: "Maternity/Paternity Leave" },
  ];

  const employeeColumns = [
    { header: "Type", accessor: "leaveType", render: (row) => row.leaveType || row.leave_type },
    { header: "Start", accessor: "startDate", render: (row) => new Date(row.start_date || row.startDate).toLocaleDateString() },
    { header: "End", accessor: "endDate", render: (row) => new Date(row.end_date || row.endDate).toLocaleDateString() },
    { header: "Reason", accessor: "reason" },
    { header: "Status", accessor: "status", render: (row) => getStatusBadge(row.status) },
    { header: "Applied On", accessor: "appliedOn", render: (row) => new Date(row.applied_on || row.appliedOn).toLocaleDateString() },
  ];

  const adminColumns = [
    { 
      header: "Employee", 
      accessor: "employeeName",
      render: (row) => (
        <div>
          <div style={{ fontWeight: 500 }}>{row.employeeName}</div>
          <div style={{ fontSize: "12px", color: "#6b7280" }}>{row.empId}</div>
        </div>
      )
    },
    ...employeeColumns.slice(0, 5), // Include Type, Start, End, Reason, Status
    { 
      header: "Action", 
      accessor: "id", 
      render: (row) => {
        const currentStatus = formatStatus(row.status);
        if (currentStatus === 'Pending') {
          return (
            <div className="action-btns">
              <button className="btn-approve" onClick={() => handleStatusUpdate(row.id || row.leave_id, 'Approved')}>Approve</button>
              <button className="btn-reject" onClick={() => handleStatusUpdate(row.id || row.leave_id, 'Rejected')}>Reject</button>
            </div>
          );
        }
        return <span style={{color: '#9ca3af', fontSize: '12px'}}>{currentStatus}</span>;
      }
    },
  ];

  return (
    <div className="leave-container">
      <div className="leave-header">
        <div>
          <h1>Leave Management</h1>
          <p>{isAdminOrHR ? "Review and approve leave requests" : "View and apply for time off"}</p>
        </div>
        {!isAdminOrHR && (
          <Button onClick={() => setIsApplyModalOpen(true)}>Apply for Leave</Button>
        )}
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px" }}><div className="spinner"></div></div>
        ) : (
          <Table 
            columns={isAdminOrHR ? adminColumns : employeeColumns} 
            data={leaves} 
          />
        )}
      </div>

      {/* Apply Leave Modal */}
      <Modal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        title="Apply for Leave"
        size="md"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Select
            label="Leave Type"
            value={leaveData.leaveType}
            onChange={(e) => setLeaveData({...leaveData, leaveType: e.target.value})}
            options={leaveTypes}
          />
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <Input
                label="Start Date"
                type="date"
                value={leaveData.startDate}
                onChange={(e) => setLeaveData({...leaveData, startDate: e.target.value})}
              />
            </div>
            <div style={{ flex: 1 }}>
              <Input
                label="End Date"
                type="date"
                value={leaveData.endDate}
                onChange={(e) => setLeaveData({...leaveData, endDate: e.target.value})}
              />
            </div>
          </div>
          <Input
            label="Reason"
            as="textarea"
            rows={3}
            value={leaveData.reason}
            onChange={(e) => setLeaveData({...leaveData, reason: e.target.value})}
            placeholder="Briefly describe the reason for your leave"
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
            <Button variant="outline" onClick={() => setIsApplyModalOpen(false)}>Cancel</Button>
            <Button onClick={handleApplyLeave} loading={applying}>Submit Request</Button>
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default LeaveDashboard;

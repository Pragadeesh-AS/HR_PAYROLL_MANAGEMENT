import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContextDefinition";
import { attendanceService, settingsService } from "../../services/api";
import Table from "../../components/common/Table";
import Modal from "../../components/common/Modal";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { FiClock, FiSettings } from "react-icons/fi";
import "./Attendance.css";

const AttendanceDashboard = () => {
  const { user } = useContext(AuthContext);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clockLoading, setClockLoading] = useState(false);
  const [todayRecord, setTodayRecord] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Settings State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [shiftSettings, setShiftSettings] = useState({ shift_start_time: "09:00", shift_end_time: "17:00" });
  const [savingSettings, setSavingSettings] = useState(false);

  const isAdminOrHR = user?.role === "admin" || user?.role === "hr";

  useEffect(() => {
    fetchAttendance();
    
    // Update live clock
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      let response;
      if (isAdminOrHR) {
        response = await attendanceService.getAll();
      } else {
        response = await attendanceService.getByEmployee();
      }
      
      const records = response.data;
      setAttendanceRecords(records);

      // Check if user has clocked in today (for employee view)
      if (!isAdminOrHR) {
        const today = new Date().toISOString().split('T')[0];
        const record = records.find(r => r.date.split('T')[0] === today);
        setTodayRecord(record || null);
      }
    } catch (error) {
      console.error("Error fetching attendance:", error);
    } finally {
      setLoading(false);
    }
  };

  const openSettings = async () => {
    try {
      const res = await settingsService.getSettings();
      // the DB returns times as HH:MM:SS, let's strip the seconds for the time input
      setShiftSettings({
        shift_start_time: res.data.shift_start_time.substring(0, 5),
        shift_end_time: res.data.shift_end_time.substring(0, 5)
      });
      setIsSettingsOpen(true);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      // API expects times, the input provides HH:MM, postgres needs HH:MM:SS
      await settingsService.updateSettings({
        shift_start_time: `${shiftSettings.shift_start_time}:00`,
        shift_end_time: `${shiftSettings.shift_end_time}:00`
      });
      setIsSettingsOpen(false);
      alert("Shift timings updated successfully!");
    } catch (error) {
      alert("Failed to save settings");
    } finally {
      setSavingSettings(false);
    }
  };

  const handleClockInOut = async () => {
    setClockLoading(true);
    try {
      await attendanceService.mark();
      await fetchAttendance();
    } catch (error) {
      alert(error.response?.data?.error || "Failed to mark attendance");
    } finally {
      setClockLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    return <span className={`status-badge status-${status}`}>{status}</span>;
  };

  const formatTime = (timeString) => {
    if (!timeString) return "-";
    // Convert 24h to 12h format
    const [h, m, s] = timeString.split(':');
    const date = new Date();
    date.setHours(h, m, s);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const employeeColumns = [
    { header: "Date", accessor: "date", render: (row) => new Date(row.date).toLocaleDateString() },
    { header: "Status", accessor: "status", render: (row) => getStatusBadge(row.status) },
    { header: "Check In", accessor: "check_in", render: (row) => formatTime(row.check_in) },
    { header: "Check Out", accessor: "check_out", render: (row) => formatTime(row.check_out) },
  ];

  const adminColumns = [
    { header: "Date", accessor: "date", render: (row) => new Date(row.date).toLocaleDateString() },
    { 
      header: "Employee", 
      accessor: "employeeName",
      render: (row) => (
        <div>
          <div style={{ fontWeight: 500 }}>{row.employeeName}</div>
          <div style={{ fontSize: "12px", color: "#6b7280" }}>{row.empId} • {row.department}</div>
        </div>
      )
    },
    { header: "Status", accessor: "status", render: (row) => getStatusBadge(row.status) },
    { header: "Check In", accessor: "check_in", render: (row) => formatTime(row.check_in) },
    { header: "Check Out", accessor: "check_out", render: (row) => formatTime(row.check_out) },
  ];

  return (
    <div className="attendance-container">
      <div className="attendance-header">
        <div>
          <h1>Attendance Tracking</h1>
          <p>{isAdminOrHR ? "Monitor company-wide attendance" : "Manage your daily attendance"}</p>
        </div>
        {isAdminOrHR && (
          <Button icon={<FiSettings />} variant="outline" onClick={openSettings}>
            Shift Settings
          </Button>
        )}
      </div>

      {!isAdminOrHR && (
        <div className="clock-card">
          <div className="clock-time">{currentTime.toLocaleTimeString('en-US')}</div>
          <div className="clock-date">
            {currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          
          <div className="clock-btn-container">
            <button 
              className={`clock-btn ${!todayRecord ? 'btn-clock-in' : (todayRecord.check_out ? 'btn-clock-in' : 'btn-clock-out')}`}
              onClick={handleClockInOut}
              disabled={clockLoading || (todayRecord && todayRecord.check_out)}
            >
              <FiClock style={{ marginRight: '8px', marginBottom: '-2px' }} />
              {!todayRecord ? "Clock In" : (todayRecord.check_out ? "Clocked Out" : "Clock Out")}
            </button>
          </div>
          {todayRecord && todayRecord.check_in && !todayRecord.check_out && (
            <div className="clock-status">You clocked in today at {formatTime(todayRecord.check_in)}</div>
          )}
          {todayRecord && todayRecord.check_out && (
            <div className="clock-status">You have completed your shift for today.</div>
          )}
        </div>
      )}

      <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '16px', color: '#374151' }}>
          {isAdminOrHR ? "All Attendance Records" : "Your Recent History"}
        </h2>
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px" }}><div className="spinner"></div></div>
        ) : (
          <Table 
            columns={isAdminOrHR ? adminColumns : employeeColumns} 
            data={attendanceRecords} 
          />
        )}
      </div>

      <Modal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        title="Company Shift Timings"
        size="md"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '8px' }}>
            Set the standard incoming and outgoing times. Employees checking in after the start time will be marked as "Late". Employees checking out before the end time will be marked as "Left Early".
          </p>
          <Input
            label="Shift Start Time"
            type="time"
            value={shiftSettings.shift_start_time}
            onChange={(e) => setShiftSettings({...shiftSettings, shift_start_time: e.target.value})}
          />
          <Input
            label="Shift End Time"
            type="time"
            value={shiftSettings.shift_end_time}
            onChange={(e) => setShiftSettings({...shiftSettings, shift_end_time: e.target.value})}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
            <Button variant="outline" onClick={() => setIsSettingsOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveSettings} loading={savingSettings}>Save Settings</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AttendanceDashboard;

import React, { createContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

export const AppContext = createContext();
// It has been changed
const API_BASE = process.env.REACT_APP_API_URL || '/api';
console.log('DEBUG API_BASE is:', API_BASE, '<<<<<');

export const AppProvider = ({ children }) => {
  const [employees, setEmployees] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [weekendSettings, setWeekendSettings] = useState({ blockSaturday: true, blockSunday: true }); // Default to blocking

  // Get user from AuthContext to react to login/logout
  const { user, logout } = useAuth();

  // Fetch all data when user/token changes
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const token = sessionStorage.getItem('token');
        // If no token, we can't fetch protected data.
        if (!token) {
          setEmployees([]);
          setHolidays([]);
          setLeaves([]);
          setLoading(false);
          return;
        }

        const headers = { 'Authorization': `Bearer ${token}` };

        const [empRes, holRes, leaveRes, configRes] = await Promise.all([
          fetch(`${API_BASE}/employees`, { headers }),
          fetch(`${API_BASE}/holidays`, { headers }),
          fetch(`${API_BASE}/leaves`, { headers }),
          fetch(`${API_BASE}/config/weekendSettings`, { headers })
        ]);

        // Helper to safely handle response
        const handleResponse = async (res) => {
          if (!res) return null;
          if (res.status === 401) {
            console.warn("Session expired (401). Logging out...");
            logout();
            return null;
          }
          if (res.ok) {
            const data = await res.json();
            return data;
          }
          console.error(`Fetch failed: ${res.statusText}`);
          return null;
        };

        const empData = await handleResponse(empRes);
        if (empData && Array.isArray(empData)) setEmployees(empData);

        const holData = await handleResponse(holRes);
        if (holData && Array.isArray(holData)) setHolidays(holData);

        const leaveData = await handleResponse(leaveRes);
        if (leaveData && Array.isArray(leaveData)) setLeaves(leaveData);

        const configData = await handleResponse(configRes);
        if (configData && configData.value) {
          setWeekendSettings(configData.value);
        } else {
          // Default if nothing found (or error)
          setWeekendSettings({ blockSaturday: true, blockSunday: true });
        }


      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [user]); // Re-run when user auth state changes

  // --- Employees CRUD ---
  const addEmployee = async (employee) => {
    const token = sessionStorage.getItem('token');
    const res = await fetch(`${API_BASE}/employees`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify(employee)
    });
    if (res.ok) {
      const newEmp = await res.json();
      setEmployees((prev) => [...prev, newEmp]);
    }
  };

  const editEmployee = async (oldName, updated, oldAssociateId) => {
    const payload = { ...updated, oldAssociateId };
    const token = sessionStorage.getItem('token');
    const res = await fetch(`${API_BASE}/employees/${encodeURIComponent(oldName)}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      const updatedEmp = await res.json();
      setEmployees((prev) => prev.map(emp => emp.name === oldName ? updatedEmp : emp));
    }
  };

  const deleteEmployee = async (associateId) => {
    const token = sessionStorage.getItem('token');
    const res = await fetch(`${API_BASE}/employees/${encodeURIComponent(associateId)}`, {
      method: "DELETE",
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
    if (res.ok || res.status === 204) {
      setEmployees((prev) => prev.filter(emp => String(emp.associateId) !== String(associateId)));
    }
  };

  // --- Leaves CRUD ---
  const deleteLeave = async (id) => {
    const token = sessionStorage.getItem('token');
    const res = await fetch(`${API_BASE}/leaves/${id}`, {
      method: 'DELETE',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
    if (res.ok) await fetchLeaves();
  };
  const fetchLeaves = async () => {
    const token = sessionStorage.getItem('token');
    const res = await fetch(`${API_BASE}/leaves`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
    if (res.ok) setLeaves(await res.json());
  };

  const addLeave = async (leave) => {
    const token = sessionStorage.getItem('token');
    const res = await fetch(`${API_BASE}/leaves`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify(leave)
    });
    if (res.ok) {
      await fetchLeaves();
    }
  };

  const editLeave = async (id, updated) => {
    const token = sessionStorage.getItem('token');
    const res = await fetch(`${API_BASE}/leaves/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify(updated)
    });
    if (res.ok) {
      await fetchLeaves();
    }
  };

  const revokeLeave = async (id, revocationReason = "", revokedBy = "") => {
    const token = sessionStorage.getItem('token');
    const res = await fetch(`${API_BASE}/leaves/${id}/revoke`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ revocationReason, revokedBy }),
    });
    if (res.ok) {
      await fetchLeaves();
      return await res.json();
    }
  };

  const approveRevocation = async (id) => {
    const token = sessionStorage.getItem('token');
    const res = await fetch(`${API_BASE}/leaves/${id}/approve-revocation`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    });
    if (res.ok) {
      await fetchLeaves();
    }
  };

  const declineRevocation = async (id, reason = "") => {
    const token = sessionStorage.getItem('token');
    const res = await fetch(`${API_BASE}/leaves/${id}/decline-revocation`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ reason })
    });
    if (res.ok) {
      await fetchLeaves();
    }
  };

  const fetchPendingRevocations = async () => {
    const token = sessionStorage.getItem('token');
    const res = await fetch(`${API_BASE}/leaves/pending-revocation`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
    return res.ok ? await res.json() : [];
  };

  const clearNotifications = async () => {
    const token = sessionStorage.getItem('token');
    const res = await fetch(`${API_BASE}/leaves/clear-notifications`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    });
    return res.ok;
  };

  // --- Configuration ---
  const updateWeekendSettings = async (newSettings) => {
    const token = sessionStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE}/config/weekendSettings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ value: newSettings })
      });
      if (res.ok) {
        setWeekendSettings(newSettings);
      }
    } catch (err) {
      console.error("Failed to update config:", err);
    }
  };

  // Holidays are read-only for now; if you want to add CRUD, let me know

  return (
    <AppContext.Provider value={{
      employees, setEmployees, addEmployee, editEmployee, deleteEmployee,
      leaves, setLeaves, addLeave, editLeave, revokeLeave, deleteLeave,
      approveRevocation, declineRevocation, fetchPendingRevocations, clearNotifications,
      holidays, setHolidays,
      loading,
      activeLeaves: Array.isArray(leaves) ? leaves.filter(l => l.status !== "Revoked") : [],
      weekendSettings, updateWeekendSettings
    }}>
      {children}
    </AppContext.Provider>
  );
};

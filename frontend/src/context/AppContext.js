import React, { createContext, useState, useEffect } from "react";

export const AppContext = createContext();
// It has been changed
const API_BASE =
  process.env.NODE_ENV === 'production'
    ? 'https://cts-vibeappso3801-5.azurewebsites.net/api'
    : (process.env.REACT_APP_API_URL || '/api');
console.log('DEBUG API_BASE is:', API_BASE, '<<<<<');

export const AppProvider = ({ children }) => {
  const [employees, setEmployees] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all data on mount
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      const [empRes, holRes, leaveRes] = await Promise.all([
        fetch(`${API_BASE}/employees`),
        fetch(`${API_BASE}/holidays`),
        fetch(`${API_BASE}/leaves`)
      ]);
      setEmployees(await empRes.json());
      setHolidays(await holRes.json());
      setLeaves(await leaveRes.json());
      setLoading(false);
    };
    fetchAll();
  }, []);

  // --- Employees CRUD ---
  const addEmployee = async (employee) => {
    const res = await fetch(`${API_BASE}/employees`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(employee)
    });
    if (res.ok) {
      const newEmp = await res.json();
      setEmployees((prev) => [...prev, newEmp]);
    }
  };

  const editEmployee = async (oldName, updated, oldAssociateId) => {
    const payload = { ...updated, oldAssociateId };
    const res = await fetch(`${API_BASE}/employees/${encodeURIComponent(oldName)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      const updatedEmp = await res.json();
      setEmployees((prev) => prev.map(emp => emp.name === oldName ? updatedEmp : emp));
    }
  };

  const deleteEmployee = async (associateId) => {
    const res = await fetch(`${API_BASE}/employees/${encodeURIComponent(associateId)}`, {
      method: "DELETE" });
    if (res.ok || res.status === 204) {
      setEmployees((prev) => prev.filter(emp => String(emp.associateId) !== String(associateId)));
    }
  };

  // --- Leaves CRUD ---
  const addLeave = async (leave) => {
    const res = await fetch(`${API_BASE}/leaves`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(leave)
    });
    if (res.ok) {
      const newLeave = await res.json();
      setLeaves((prev) => [...prev, newLeave]);
    }
  };

  const editLeave = async (id, updated) => {
    const res = await fetch(`${API_BASE}/leaves/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated)
    });
    if (res.ok) {
      const updatedLeave = await res.json();
      setLeaves((prev) => prev.map(l => l._id === id ? updatedLeave : l));
    }
  };

  const revokeLeave = async (id) => {
    const res = await fetch(`${API_BASE}/leaves/${id}`, {
      method: "DELETE" });
    if (res.ok || res.status === 204) {
      setLeaves((prev) => prev.filter(l => l._id !== id));
    }
  };

  // Holidays are read-only for now; if you want to add CRUD, let me know

  return (
    <AppContext.Provider value={{
      employees, setEmployees, addEmployee, editEmployee, deleteEmployee,
      leaves, setLeaves, addLeave, editLeave, revokeLeave,
      holidays, setHolidays,
      loading
    }}>
      {children}
    </AppContext.Provider>
  );
};

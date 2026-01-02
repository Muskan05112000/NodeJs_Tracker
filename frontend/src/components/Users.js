// NOTE: All user objects must include a unique associateId (Number).
// All user operations (add, edit, delete) should use associateId as the unique key.
import React, { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import UserModal from "./UserModal";
import { Box, Button, Table, TableContainer, TableHead, TableRow, TableCell, TableBody, Paper, CircularProgress, Dialog, DialogTitle, DialogActions, Snackbar, Alert, Typography } from "@mui/material";

const Users = () => {
  const { employees, addEmployee, editEmployee, deleteEmployee, loading } = useContext(AppContext);

  // Modified add handler to always add a new user, even if details match an existing one
  const handleAddUser = async (user) => {
    // Validate associateId
    if (!user.associateId || isNaN(Number(user.associateId))) {
      setSnackbar({ open: true, message: 'Associate ID must be a unique number.', severity: 'error' });
      return;
    }
    // Check for duplicate associateId in current employees
    if (employees.some(emp => String(emp.associateId) === String(user.associateId))) {
      setSnackbar({ open: true, message: 'Associate ID already exists.', severity: 'error' });
      return;
    }
    const newUser = {
      ...user,
      associateId: Number(user.associateId),
      role: user.role || 'Employee',
      password: 'Welcome@123',
    };
    try {
      const result = await addEmployee(newUser);
      // If backend returns error, show it
      if (result && result.error) {
        setSnackbar({ open: true, message: result.error, severity: 'error' });
        return;
      }
      setModalOpen(false);
      setSnackbar({ open: true, message: 'User added successfully!', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: (err && err.message) || 'Failed to add user. Please check input and try again.', severity: 'error' });
    }
  }

  // Fix: Define handleEditUser
  const handleEditUser = async (user) => {
    // Pass old associateId for backend sync
    await editEmployee(editUser.name, user, editUser.associateId);
    setSnackbar({ open: true, message: 'User updated successfully!', severity: 'success' });
    setModalOpen(false);
    setEditUser(null);
  }

  const [modalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  if (loading) return <Box ml={30} mt={10}><CircularProgress /></Box>;

  return (
    <div style={{ padding: '20px', margin: 0, width: '100%', boxSizing: 'border-box' }}>
      {/* Header Section */}
      <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="center" mb={4} gap={2}>
        <Box>
          <span style={{
            display: 'block',
            fontWeight: 900,
            fontSize: 'clamp(2rem, 5vw, 2.5rem)',
            letterSpacing: 1,
            color: '#fff',
            textShadow: '0 2px 12px rgba(0,0,0,0.1)',
            fontFamily: 'Poppins, Inter, Segoe UI, Arial, sans-serif',
            lineHeight: 1.1,
            textAlign: 'left',
          }}>
            User Information
          </span>
        </Box>
        <Box display="flex" gap={2} flexWrap="wrap" justifyContent={{ xs: 'center', md: 'flex-end' }}>
          <Button
            variant="contained"
            startIcon={<span style={{ fontWeight: 900, fontSize: 22 }}>+</span>}
            sx={{
              bgcolor: '#7c4dff', color: '#fff', fontWeight: 700, fontSize: 16, px: 3, py: 1.2, borderRadius: 4, boxShadow: 2, textTransform: 'none', letterSpacing: 0.3,
              '&:hover': { bgcolor: '#651fff' }
            }}
            onClick={() => { setEditUser(null); setModalOpen(false); setTimeout(() => setModalOpen(true), 0); }}
          >
            Add User
          </Button>
          <Button
            variant="contained"
            startIcon={<span style={{ fontWeight: 900, fontSize: 18 }}>✎</span>}
            sx={{
              bgcolor: '#00c853', color: '#fff', fontWeight: 700, fontSize: 16, px: 3, py: 1.2, borderRadius: 4, boxShadow: 2, textTransform: 'none', letterSpacing: 0.3,
              '&:hover': { bgcolor: '#00b248' },
              '&.Mui-disabled': { bgcolor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.7)' }
            }}
            disabled={!editUser}
            onClick={() => setModalOpen(true)}
          >
            Edit User
          </Button>
          <Button
            variant="contained"
            startIcon={<span style={{ fontWeight: 900, fontSize: 18 }}>🗑️</span>}
            sx={{
              bgcolor: '#ff1744', color: '#fff', fontWeight: 700, fontSize: 16, px: 3, py: 1.2, borderRadius: 4, boxShadow: 2, textTransform: 'none', letterSpacing: 0.3,
              '&:hover': { bgcolor: '#d50000' },
              '&.Mui-disabled': { bgcolor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.7)' }
            }}
            disabled={!editUser}
            onClick={() => setDeleteUser(editUser)}
          >
            Delete User
          </Button>
        </Box>
      </Box>

      {/* Main Content Card */}
      <Paper elevation={3} sx={{ p: 0, borderRadius: 4, bgcolor: '#fff', overflow: 'hidden', minHeight: '70vh', position: 'relative' }}>
        {/* Top Gradient Bar */}
        <Box sx={{ height: 6, background: 'linear-gradient(90deg, #7c4dff 0%, #b388ff 100%)' }} />

        <TableContainer sx={{ maxHeight: '70vh' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ background: '#fff', borderBottom: '2px solid #f0f0f0', fontWeight: 800, fontSize: 16, color: '#7c4dff', py: 2.5 }}>Associate ID</TableCell>
                <TableCell sx={{ background: '#fff', borderBottom: '2px solid #f0f0f0', fontWeight: 800, fontSize: 16, color: '#7c4dff', py: 2.5 }}>Name</TableCell>
                <TableCell sx={{ background: '#fff', borderBottom: '2px solid #f0f0f0', fontWeight: 800, fontSize: 16, color: '#7c4dff', py: 2.5 }}>Location</TableCell>
                <TableCell sx={{ background: '#fff', borderBottom: '2px solid #f0f0f0', fontWeight: 800, fontSize: 16, color: '#7c4dff', py: 2.5 }}>Team</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[...employees].sort((a, b) => a.name.localeCompare(b.name)).map((emp) => (
                <TableRow
                  key={emp._id || emp.name}
                  onClick={() => setEditUser(editUser?.name === emp.name ? null : emp)}
                  hover
                  selected={editUser?.name === emp.name}
                  sx={{
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&.Mui-selected': {
                      bgcolor: 'rgba(124, 77, 255, 0.08) !important',
                      borderLeft: '4px solid #7c4dff'
                    },
                    '&.Mui-selected:hover': { bgcolor: 'rgba(124, 77, 255, 0.12) !important' },
                    '&:hover': {
                      bgcolor: 'rgba(124, 77, 255, 0.02)',
                      transform: 'translateX(4px)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                    }
                  }}
                >
                  <TableCell sx={{ fontWeight: 600, fontSize: 15, color: '#424242', borderBottom: '1px solid #f5f5f5' }}>
                    {emp.associateId && typeof emp.associateId === 'object' && emp.associateId.$numberLong ? emp.associateId.$numberLong : emp.associateId || '-'}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: 15, color: '#424242', borderBottom: '1px solid #f5f5f5' }}>{emp.name}</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: 15, color: '#424242', borderBottom: '1px solid #f5f5f5' }}>{emp.location}</TableCell>
                  <TableCell sx={{ fontWeight: 500, fontSize: 15, color: '#616161', borderBottom: '1px solid #f5f5f5' }}>
                    <Box component="span" sx={{
                      px: 1.5, py: 0.5, borderRadius: 2, fontSize: 13, fontWeight: 700,
                      bgcolor: emp.team === 'Engineering' ? '#e3f2fd' : emp.team === 'HR' ? '#fce4ec' : '#f3e5f5',
                      color: emp.team === 'Engineering' ? '#1565c0' : emp.team === 'HR' ? '#c2185b' : '#7b1fa2'
                    }}>
                      {emp.team}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Modals */}
      <UserModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={editUser ? handleEditUser : handleAddUser}
        initial={editUser || undefined}
      />
      <Dialog open={!!deleteUser} onClose={() => setDeleteUser(null)} PaperProps={{
        style: {
          borderRadius: 20,
          padding: 0,
          minWidth: 400,
          backdropFilter: 'blur(10px)'
        }
      }}>
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 800, color: '#d32f2f', fontSize: 24, pt: 3 }}>
          Delete User?
        </DialogTitle>
        <Box px={4} pb={2} textAlign="center">
          <Typography fontSize={16} color="#555" mb={3}>
            Are you sure you want to delete <b>{deleteUser?.name}</b>?
          </Typography>
        </Box>
        <DialogActions sx={{ justifyContent: 'center', pb: 4, gap: 2 }}>
          <Button onClick={() => setDeleteUser(null)} variant="outlined" sx={{ borderRadius: 8, fontWeight: 700, color: '#555', borderColor: '#bbb' }}>
            Cancel
          </Button>
          <Button onClick={async () => {
            await deleteEmployee(deleteUser.associateId);
            setDeleteUser(null);
            handleSnackbar('User deleted successfully!');
          }}
            variant="contained"
            sx={{ borderRadius: 8, fontWeight: 700, bgcolor: '#d32f2f', '&:hover': { bgcolor: '#b71c1c' } }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={2500}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%', fontWeight: 600 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Users;

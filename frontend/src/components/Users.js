// NOTE: All user objects must include a unique associateId (Number).
// All user operations (add, edit, delete) should use associateId as the unique key.
import React, { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import UserModal from "./UserModal";
import { Box, Button, Table, TableContainer, TableHead, TableRow, TableCell, TableBody, Paper, CircularProgress, Dialog, DialogTitle, DialogActions, Snackbar, Alert } from "@mui/material";

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
    <div style={{ marginLeft: 240, padding: 32, fontFamily: 'Inter, Segoe UI, Roboto, Arial, sans-serif', background: 'var(--primary-gradient)', minHeight: '100vh' }}>
      <h2 style={{
        margin: '40px auto 24px auto',
        fontWeight: 900,
        fontSize: 38,
        textAlign: 'center',
        letterSpacing: 1,
        fontFamily: 'Poppins, Inter, Segoe UI, Arial, sans-serif',
        background: 'none',
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        color: 'transparent',
        backgroundImage: 'linear-gradient(90deg, #7c4dff 0%, #b388ff 100%)',
        textShadow: '0 2px 12px #b388ff22, 0 1px 1px #fff',
        lineHeight: 1.1,
        maxWidth: 800
      }}>
        User Information
      </h2>
      <TableContainer component={Paper} sx={{
        maxWidth: 800,
        margin: '0 auto',
        boxShadow: 12,
        borderRadius: 14,
        overflow: 'hidden',
        background: 'rgba(255,255,255,0.97)',
        backdropFilter: 'blur(6px)',
        fontFamily: 'Poppins, Inter, Segoe UI, Arial, sans-serif'
      }}>
        <Table>
          <TableHead>
            <TableRow sx={{
              background: 'linear-gradient(90deg, #7c4dff 0%, #b388ff 100%)',
              height: 56
            }}>
              <TableCell sx={{ fontWeight: 900, fontSize: 20, letterSpacing: 0.5, color: '#fff', border: 0, fontFamily: 'Poppins, Inter, Segoe UI, Arial, sans-serif', textShadow: '0 2px 8px #7c4dff22' }}>Associate ID</TableCell>
              <TableCell sx={{ fontWeight: 900, fontSize: 20, letterSpacing: 0.5, color: '#fff', border: 0, fontFamily: 'Poppins, Inter, Segoe UI, Arial, sans-serif', textShadow: '0 2px 8px #7c4dff22' }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 900, fontSize: 20, letterSpacing: 0.5, color: '#fff', border: 0, fontFamily: 'Poppins, Inter, Segoe UI, Arial, sans-serif', textShadow: '0 2px 8px #7c4dff22' }}>Location</TableCell>
              <TableCell sx={{ fontWeight: 900, fontSize: 20, letterSpacing: 0.5, color: '#fff', border: 0, fontFamily: 'Poppins, Inter, Segoe UI, Arial, sans-serif', textShadow: '0 2px 8px #7c4dff22' }}>Team</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {employees.map((emp, idx) => (
              <TableRow
                key={emp._id || emp.name}
                onClick={() => setEditUser(editUser?.name === emp.name ? null : emp)}
                hover
                selected={editUser?.name === emp.name}
                sx={{
                  cursor: 'pointer',
                  background: editUser?.name === emp.name
                    ? 'linear-gradient(90deg, #ede7f6 0%, #fff 100%)'
                    : (idx % 2 === 0 ? 'rgba(124,77,255,0.03)' : 'rgba(179,136,255,0.03)'),
                  transition: 'background 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    background: 'linear-gradient(90deg, #ede7f6 0%, #fff 100%)',
                    boxShadow: 4,
                  },
                  borderRadius: 3,
                  fontFamily: 'Poppins, Inter, Segoe UI, Arial, sans-serif',
                  fontSize: 16
                }}
              >
                <TableCell sx={{ fontWeight: 700, fontSize: 18, color: '#4b2aad', border: 0, fontFamily: 'Poppins, Inter, Segoe UI, Arial, sans-serif' }}>{emp.associateId && typeof emp.associateId === 'object' && emp.associateId.$numberLong ? emp.associateId.$numberLong : emp.associateId || '-'}</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: 18, color: '#4b2aad', border: 0, fontFamily: 'Poppins, Inter, Segoe UI, Arial, sans-serif' }}>{emp.name}</TableCell>
                <TableCell sx={{ fontWeight: 500, fontSize: 17, color: '#6a479c', border: 0, fontFamily: 'Poppins, Inter, Segoe UI, Arial, sans-serif' }}>{emp.location}</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: 17, color: '#7c4dff', border: 0, fontFamily: 'Poppins, Inter, Segoe UI, Arial, sans-serif' }}>{emp.team}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box mt={3} display="flex" justifyContent="center" gap={2}>
        <Button
          variant="contained"
          startIcon={<span style={{fontWeight:900, fontSize:22}}>+</span>}
          sx={{
            fontFamily: 'Poppins, Inter, Segoe UI, Arial, sans-serif',
            fontWeight: 800,
            fontSize: 18,
            borderRadius: 7,
            px: 4,
            py: 1.5,
            boxShadow: 4,
            textTransform: 'none',
            letterSpacing: 0.3,
            background: 'linear-gradient(90deg, #7c4dff 0%, #b388ff 100%)',
            color: '#fff',
            transition: 'background 0.18s, box-shadow 0.18s',
            '&:hover': {
              background: 'linear-gradient(90deg, #9575cd 0%, #7c4dff 100%)',
              boxShadow: '0 2px 12px 0 rgba(124,77,255,0.18)'
            }
          }}
          onClick={() => { setEditUser(null); setModalOpen(false); setTimeout(() => setModalOpen(true), 0); }}
        >
          Add User
        </Button>
        <Button
          variant="contained"
          startIcon={<span style={{fontWeight:900, fontSize:18}}>✎</span>}
          sx={{
            fontFamily: 'Poppins, Inter, Segoe UI, Arial, sans-serif',
            fontWeight: 800,
            fontSize: 17,
            borderRadius: 7,
            px: 4,
            py: 1.5,
            boxShadow: 4,
            textTransform: 'none',
            letterSpacing: 0.3,
            background: 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)',
            color: '#222',
            border: 'none',
            transition: 'background 0.18s, box-shadow 0.18s',
            '&:hover': {
              background: 'linear-gradient(90deg, #38f9d7 0%, #43e97b 100%)',
              boxShadow: '0 2px 12px 0 rgba(67,233,123,0.18)'
            },
            '&.Mui-disabled': {
              background: '#e0e0e0',
              color: '#aaa',
              boxShadow: 'none'
            }
          }}
          disabled={!editUser}
          onClick={() => setModalOpen(true)}
        >
          Edit User
        </Button>
        <Button
          variant="contained"
          startIcon={<span style={{fontWeight:900, fontSize:18}}>🗑️</span>}
          sx={{
            fontFamily: 'Poppins, Inter, Segoe UI, Arial, sans-serif',
            fontWeight: 800,
            fontSize: 17,
            borderRadius: 7,
            px: 4,
            py: 1.5,
            boxShadow: 4,
            textTransform: 'none',
            letterSpacing: 0.3,
            background: 'linear-gradient(90deg, #ff5858 0%, #f09819 100%)',
            color: '#fff',
            border: 'none',
            transition: 'background 0.18s, box-shadow 0.18s',
            '&:hover': {
              background: 'linear-gradient(90deg, #f09819 0%, #ff5858 100%)',
              boxShadow: '0 2px 12px 0 rgba(255,88,88,0.18)'
            },
            '&.Mui-disabled': {
              background: '#f5f5f5',
              color: '#bbb',
              boxShadow: 'none'
            }
          }}
          disabled={!editUser}
          onClick={() => setDeleteUser(editUser)}
        >
          Delete User
        </Button>
      </Box>
      {/* Floating Add User Button */}
      <Box position="fixed" bottom={40} right={60} zIndex={2000}>
        <Button
          variant="contained"
          sx={{
            borderRadius: '50%',
            minWidth: 56,
            minHeight: 56,
            boxShadow: 6,
            fontSize: 32,
            p: 0,
            background: 'linear-gradient(135deg, #7c4dff 0%, #b388ff 100%)',
            color: '#fff',
            fontWeight: 900,
            transition: 'background 0.18s, box-shadow 0.18s',
            '&:hover': {
              background: 'linear-gradient(135deg, #b388ff 0%, #7c4dff 100%)',
              boxShadow: '0 2px 16px 0 rgba(124,77,255,0.18)'
            }
          }}
          onClick={() => { setEditUser(null); setModalOpen(true); }}
        >
          +
        </Button>
      </Box>
      <UserModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={editUser ? handleEditUser : handleAddUser}
        initial={editUser || undefined}
      />
      <Dialog open={!!deleteUser} onClose={() => setDeleteUser(null)} PaperProps={{
        style: {
          background: 'rgba(255,255,255,0.92)',
          borderRadius: 20,
          boxShadow: '0 8px 40px 0 rgba(255,88,88,0.14), 0 1.5px 18px 0 rgba(124,77,255,0.10)',
          padding: 0,
          minWidth: 420,
          minHeight: 220,
          fontFamily: 'Poppins, Inter, Segoe UI, Arial, sans-serif',
          backdropFilter: 'blur(10px) saturate(180%)'
        }
      }}>
        <DialogTitle sx={{
          textAlign: 'center',
          fontWeight: 900,
          fontSize: 26,
          color: '#ff5858',
          letterSpacing: 0.5,
          fontFamily: 'Poppins, Inter, Segoe UI, Arial, sans-serif',
          background: 'linear-gradient(90deg, #ff5858 0%, #f09819 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textShadow: '0 2px 8px #ff585822',
          borderTopLeftRadius: 18,
          borderTopRightRadius: 18,
          py: 2
        }}>Delete User?</DialogTitle>
        <div style={{
          textAlign: 'center',
          fontWeight: 600,
          fontSize: 19,
          color: '#333',
          margin: '0 0 22px 0',
          fontFamily: 'Poppins, Inter, Segoe UI, Arial, sans-serif',
          letterSpacing: 0.1
        }}>
          Are you sure you want to delete this user?
        </div>
        <DialogActions style={{ justifyContent: 'center', gap: 24, padding: '0 28px 32px 28px', marginTop: 8 }}>
          <Button onClick={async () => {
            await deleteEmployee(deleteUser.associateId);
            setDeleteUser(null);
            handleSnackbar('User deleted successfully!');
          }}
            variant="contained"
            sx={{
              borderRadius: 8,
              fontWeight: 700,
              px: 4,
              py: 1.2,
              fontSize: 17,
              boxShadow: 2,
              background: 'linear-gradient(90deg, #ff5858 0%, #f09819 100%)',
              color: '#fff',
              fontFamily: 'Poppins, Inter, Segoe UI, Arial, sans-serif',
              transition: 'background 0.18s, box-shadow 0.18s, transform 0.16s',
              '&:hover': { background: 'linear-gradient(90deg, #f09819 0%, #ff5858 100%)', boxShadow: '0 4px 16px 0 #ff585866', transform: 'scale(1.06)' },
              '&:active': { boxShadow: '0 2px 8px 0 #ff585844', transform: 'scale(0.97)' }
            }}
          >
            DELETE
          </Button>
          <Button onClick={() => setDeleteUser(null)} variant="outlined" sx={{
            borderRadius: 8,
            fontWeight: 700,
            px: 4,
            py: 1.2,
            fontSize: 17,
            boxShadow: 2,
            background: 'linear-gradient(90deg, #fff 0%, #ede7f6 100%)',
            border: '2px solid #b39ddb',
            color: '#7c4dff',
            fontFamily: 'Poppins, Inter, Segoe UI, Arial, sans-serif',
            transition: 'background 0.18s, border-color 0.18s, color 0.18s',
            '&:hover': { background: '#ede7f6', borderColor: '#7c4dff', color: '#5e35b1' },
            '&:active': { background: '#d1c4e9', borderColor: '#7c4dff', color: '#5e35b1' }
          }}>
            CANCEL
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={2500}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Users;

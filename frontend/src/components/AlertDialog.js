import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';

export default function AlertDialog({ open, title, message, onClose, okText = 'OK' }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{
  style: {
    borderRadius: 18,
    boxShadow: '0 4px 32px 0 #7c4dff33',
    padding: 0,
    fontFamily: 'Poppins, Inter, Segoe UI, Arial, sans-serif',
  },
  elevation: 0
}}>
      {title && <DialogTitle sx={{
  background: 'linear-gradient(90deg, #7c4dff 0%, #b388ff 100%)',
  color: '#fff',
  fontWeight: 800,
  fontSize: 22,
  letterSpacing: 0.6,
  borderTopLeftRadius: 18,
  borderTopRightRadius: 18,
  padding: '18px 24px 12px 24px',
}}>{title}</DialogTitle>}
      <DialogContent sx={{ pb: 2, pt: 2, px: 3 }}>
        <div style={{ marginBottom: 16, fontWeight: 700, fontSize: 16, color: '#4e2a84' }}>{message}</div>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, pt: 0 }}>
        <Button onClick={onClose} color="primary" variant="contained" sx={{
          borderRadius: 8,
          fontWeight: 700,
          px: 4,
          fontSize: 16,
          background: 'linear-gradient(90deg, #7c4dff 0%, #b388ff 100%)',
          color: '#fff',
          letterSpacing: 0.4,
          boxShadow: 2
        }}>{okText}</Button>
      </DialogActions>
    </Dialog>
  );
}

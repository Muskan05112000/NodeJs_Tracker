import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

export default function PromptDialog({ open, title, message, value, onChange, onCancel, onOk, okText = 'OK', cancelText = 'Cancel' }) {
  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth PaperProps={{
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
        <div style={{ marginBottom: 20, fontWeight: 700, fontSize: 16, color: '#4e2a84' }}>{message}</div>
        <TextField
          autoFocus
          fullWidth
          value={value}
          onChange={e => onChange(e.target.value)}
          variant="outlined"
          sx={{
            mb: 1.5,
            fontFamily: 'Poppins, Inter, Segoe UI, Arial, sans-serif',
            borderRadius: 2,
            background: '#f5f5fa',
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              background: '#f5f5fa',
              fontWeight: 600,
            },
            '& .MuiInputLabel-root': { fontWeight: 700, color: '#7c4dff' }
          }}
          InputLabelProps={{ shrink: true }}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, pt: 0 }}>
        <Button onClick={onCancel} color="secondary" variant="outlined" sx={{
          borderRadius: 8,
          fontWeight: 700,
          px: 4,
          fontSize: 16,
          letterSpacing: 0.4
        }}>{cancelText}</Button>
        <Button onClick={onOk} color="primary" variant="contained" sx={{
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

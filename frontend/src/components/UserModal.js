import React, { useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box } from "@mui/material";

function UserModal({ open, onClose, onSubmit, initial }) {
  const [name, setName] = useState(initial?.name || "");
  const [location, setLocation] = useState(initial?.location || "");
  const [team, setTeam] = useState(initial?.team || "");
  const [associateId, setAssociateId] = useState(initial?.associateId || "");
  const [error, setError] = useState("");

  useEffect(() => {
    if (open && !initial) {
      setName("");
      setLocation("");
      setTeam("");
      setAssociateId("");
      setError("");
    } else if (initial) {
      setName(initial.name || "");
      setLocation(initial.location || "");
      setTeam(initial.team || "");
      setAssociateId(initial.associateId || "");
      setError("");
    }
  }, [open, initial]);

  const handleSubmit = () => {
    if (!name.trim() || !location.trim() || !team.trim() || !associateId) {
      setError("Please enter all details, including Associate ID");
      return;
    }
    if (isNaN(Number(associateId))) {
      setError("Associate ID must be a number");
      return;
    }
    setError("");
    // Debug log
    console.log("Submitting user:", { name, location, team, associateId: Number(associateId) });
    onSubmit({ name, location, team, associateId: Number(associateId) });
  };

  return (
    <Dialog open={open} onClose={onClose} PaperProps={{
      style: {
        background: 'rgba(255,255,255,0.85)',
        borderRadius: 22,
        boxShadow: '0 8px 40px 0 rgba(124,77,255,0.22), 0 1.5px 18px 0 rgba(124,77,255,0.10)',
        padding: 0,
        fontFamily: 'Poppins, Inter, Segoe UI, Arial, sans-serif',
        backdropFilter: 'blur(12px) saturate(180%)',
        animation: 'fadeInModal 0.45s cubic-bezier(0.4,0,0.2,1)'
      }
    }}
    sx={{
      '@keyframes fadeInModal': {
        from: { opacity: 0, transform: 'translateY(40px) scale(0.96)' },
        to: { opacity: 1, transform: 'translateY(0) scale(1)' }
      }
    }}
    >
      <DialogTitle style={{
        background: 'linear-gradient(90deg, #7c4dff 0%, #b388ff 100%)',
        color: '#fff',
        fontWeight: 900,
        fontSize: 26,
        letterSpacing: 0.5,
        textAlign: 'center',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        paddingBottom: 10,
        fontFamily: 'Poppins, Inter, Segoe UI, Arial, sans-serif',
        textShadow: '0 2px 8px #7c4dff22'
      }}>{initial ? "Edit User" : "Add User"}</DialogTitle>
      <DialogContent style={{ padding: 28, minWidth: 320, fontFamily: 'Poppins, Inter, Segoe UI, Arial, sans-serif' }}>
        {error && (
          <div style={{
            color: '#d32f2f',
            fontWeight: 700,
            fontFamily: 'Poppins, Inter, Segoe UI, Arial, sans-serif',
            fontSize: 15,
            marginBottom: 12,
            textAlign: 'center',
            letterSpacing: 0.2,
            transition: 'opacity 0.2s',
          }}>{error}</div>
        )}
        <Box sx={{ minWidth: 250, mt: 1 }}>
          
          <TextField label="Name" value={name} onChange={e => setName(e.target.value)} fullWidth variant="outlined" sx={{ mb: 3, fontFamily: 'Poppins, Inter, Segoe UI, Arial, sans-serif',
            '& .MuiOutlinedInput-root': {
              borderRadius: 16,
              background: 'rgba(255,255,255,0.42)',
              boxShadow: '0 2px 12px 0 rgba(124,77,255,0.09) inset',
              border: 'none',
              fontWeight: 700,
              fontSize: 17,
              transition: 'background 0.18s, box-shadow 0.18s',
              '&:hover': { background: 'rgba(255,255,255,0.60)' },
              '&.Mui-focused': { background: 'rgba(255,255,255,0.72)', boxShadow: '0 0 0 2px #b388ff44' }
            },
            '& .MuiInputLabel-root': { fontWeight: 700, color: '#7c4dff' }
          }} InputLabelProps={{ shrink: true }} />
          <TextField
            label="Associate ID"
            value={associateId}
            onChange={e => setAssociateId(e.target.value)}
            fullWidth
            required
            type="number"
            variant="outlined"
            sx={{ mb: 3, fontFamily: 'Poppins, Inter, Segoe UI, Arial, sans-serif',
              '& .MuiOutlinedInput-root': {
                borderRadius: 16,
                background: 'rgba(255,255,255,0.42)',
                boxShadow: '0 2px 12px 0 rgba(124,77,255,0.09) inset',
                border: 'none',
                fontWeight: 700,
                fontSize: 17,
                transition: 'box-shadow 0.2s'
              },
              '& .MuiInputLabel-root': { fontWeight: 700, color: '#7c4dff' }
            }}
            InputLabelProps={{ shrink: true }}
          />
          <TextField label="Location" value={location} onChange={e => setLocation(e.target.value)} fullWidth variant="outlined" sx={{ mb: 3, fontFamily: 'Poppins, Inter, Segoe UI, Arial, sans-serif',
            '& .MuiOutlinedInput-root': {
              borderRadius: 16,
              background: 'rgba(255,255,255,0.42)',
              boxShadow: '0 2px 12px 0 rgba(124,77,255,0.09) inset',
              border: 'none',
              fontWeight: 700,
              fontSize: 17,
              transition: 'box-shadow 0.2s'
            },
            '& .MuiInputLabel-root': { fontWeight: 700, color: '#7c4dff' }
          }} InputLabelProps={{ shrink: true }} />
          <TextField label="Team" value={team} onChange={e => setTeam(e.target.value)} fullWidth variant="outlined" sx={{ fontFamily: 'Poppins, Inter, Segoe UI, Arial, sans-serif',
            '& .MuiOutlinedInput-root': {
              borderRadius: 16,
              background: 'rgba(255,255,255,0.42)',
              boxShadow: '0 2px 12px 0 rgba(124,77,255,0.09) inset',
              border: 'none',
              fontWeight: 700,
              fontSize: 17,
              transition: 'background 0.18s, box-shadow 0.18s',
              '&:hover': { background: 'rgba(255,255,255,0.60)' },
              '&.Mui-focused': { background: 'rgba(255,255,255,0.72)', boxShadow: '0 0 0 2px #b388ff44' }
            },
            '& .MuiInputLabel-root': { fontWeight: 700, color: '#7c4dff' }
          }} InputLabelProps={{ shrink: true }} />
        </Box>
      </DialogContent>
      <DialogActions style={{ justifyContent: 'center', gap: 28, padding: '16px 28px 28px 28px', marginTop: 12 }}>
        <Button
          onClick={handleSubmit}
          variant="contained"
          sx={{
            borderRadius: 8,
            fontWeight: 700,
            px: 4,
            py: 1.2,
            fontSize: 17,
            boxShadow: 2,
            background: 'linear-gradient(90deg, #7c4dff 0%, #b388ff 100%)',
            color: '#fff',
            fontFamily: 'Poppins, Inter, Segoe UI, Arial, sans-serif',
            transition: 'background 0.18s, box-shadow 0.18s, transform 0.16s',
            '&:hover': { background: 'linear-gradient(90deg, #b388ff 0%, #7c4dff 100%)', boxShadow: '0 4px 16px 0 #b388ff66', transform: 'scale(1.06)' },
            '&:active': { boxShadow: '0 2px 8px 0 #7c4dff44', transform: 'scale(0.97)' }
          }}
        >
          SUBMIT
        </Button>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
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
          }}
        >
          CANCEL
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default UserModal;

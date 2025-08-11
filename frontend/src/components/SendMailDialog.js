import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from "@mui/material";

export default function SendMailDialog({ open, onClose, onSend, mailTo, setMailTo, mailAppPassword, setMailAppPassword, mailError, mailAppPasswordError }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        style: {
          background: 'rgba(255,255,255,0.98)',
          borderRadius: 32,
          boxShadow: '0 10px 40px 0 rgba(124,77,255,0.20)',
          padding: 0,

          fontFamily: 'Poppins, Inter, Segoe UI, Arial, sans-serif',
        },
        elevation: 0
      }}
      BackdropProps={{
        style: {
          background: 'rgba(124,77,255,0.03)'
        }
      }}
    >
      <DialogTitle sx={{
        textAlign: 'center',
        fontWeight: 900,
        fontSize: 30,
        color: '#7c4dff',
        letterSpacing: 1,
        fontFamily: 'Poppins, Inter, Segoe UI, Arial, sans-serif',
        background: 'linear-gradient(90deg, #7c4dff 0%, #b388ff 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        textShadow: '0 2px 12px #b388ff33',
        borderTopLeftRadius: 18,
        borderTopRightRadius: 18,
        py: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1.5
      }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', marginRight: 10 }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="none" viewBox="0 0 24 24"><path fill="#7c4dff" d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
        </span>
        Send Mail
      </DialogTitle>

      <DialogContent dividers sx={{ px: 4, py: 2 }}>
        <TextField
          label="Recipient Email"
          value={mailTo}
          onChange={e => setMailTo(e.target.value)}
          error={mailError}
          helperText={mailError ? "Enter a valid email address" : ""}
          fullWidth
          variant="outlined"
          sx={{ mb: 3, fontFamily: 'Poppins, Inter, Segoe UI, Arial, sans-serif',
            '& .MuiOutlinedInput-root': {
              borderRadius: 16,
              background: 'rgba(255,255,255,0.58)',
              boxShadow: '0 2px 16px 0 rgba(124,77,255,0.11) inset',
              border: 'none',
              fontWeight: 700,
              fontSize: 19,
              color: '#4b2aad',
              transition: 'background 0.18s, box-shadow 0.18s',
              '&:hover': { background: 'rgba(255,255,255,0.70)' },
              '&.Mui-focused': { background: 'rgba(255,255,255,0.90)', boxShadow: '0 0 0 2px #b388ff44' }
            },
            '& .MuiInputLabel-root': { fontWeight: 800, color: '#7c4dff', fontSize: 18 }
          }}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="App Password"
          value={mailAppPassword}
          onChange={e => setMailAppPassword(e.target.value)}
          error={mailAppPasswordError}
          helperText={mailAppPasswordError ? "Enter your mail app password" : "Use your app password, not your login password"}
          type="password"
          fullWidth
          variant="outlined"
          sx={{ mb: 2, fontFamily: 'Poppins, Inter, Segoe UI, Arial, sans-serif',
            '& .MuiOutlinedInput-root': {
              borderRadius: 16,
              background: 'rgba(255,255,255,0.58)',
              boxShadow: '0 2px 16px 0 rgba(124,77,255,0.11) inset',
              border: 'none',
              fontWeight: 700,
              fontSize: 19,
              color: '#4b2aad',
              transition: 'background 0.18s, box-shadow 0.18s',
              '&:hover': { background: 'rgba(255,255,255,0.70)' },
              '&.Mui-focused': { background: 'rgba(255,255,255,0.90)', boxShadow: '0 0 0 2px #b388ff44' }
            },
            '& .MuiInputLabel-root': { fontWeight: 800, color: '#7c4dff', fontSize: 18 }
          }}
          InputLabelProps={{ shrink: true }}
        />
        <div style={{ fontFamily: 'Poppins, Inter, Segoe UI, Arial, sans-serif', fontWeight: 600, fontSize: 15, color: '#7c4dff', marginBottom: 8, marginTop: 2, letterSpacing: 0.1, opacity: 0.85, textAlign: 'left' }}>
          Use your <b>App Password</b> (not your login password) for security.
        </div>
      </DialogContent>
      <DialogActions style={{ justifyContent: 'center', gap: 28, padding: '0 28px 32px 28px', marginTop: 8 }}>
        <Button onClick={onClose} variant="outlined" sx={{
          borderRadius: 10,
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
        <Button onClick={onSend} variant="contained" sx={{
          borderRadius: 10,
          fontWeight: 800,
          px: 4,
          py: 1.2,
          fontSize: 17,
          boxShadow: 2,
          background: 'linear-gradient(90deg, #7c4dff 0%, #b388ff 100%)',
          color: '#fff',
          fontFamily: 'Poppins, Inter, Segoe UI, Arial, sans-serif',
          transition: 'background 0.18s, box-shadow 0.18s, transform 0.16s',
          '&:hover': { background: 'linear-gradient(90deg, #b388ff 0%, #7c4dff 100%)', boxShadow: '0 4px 16px 0 #b388ff66', transform: 'scale(1.07)' },
          '&:active': { boxShadow: '0 2px 8px 0 #7c4dff44', transform: 'scale(0.97)' }
        }}>
          SEND
        </Button>
      </DialogActions>
    </Dialog>
  );
}

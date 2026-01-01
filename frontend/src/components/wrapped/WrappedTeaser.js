import React from 'react';
import { Dialog, Box, Typography } from '@mui/material';

const WrappedTeaser = ({ open, onClose, onOpenWrapped }) => {
    return (
        <Dialog
            open={open}
            maxWidth="xs"
            PaperProps={{
                style: {
                    backgroundColor: 'transparent',
                    boxShadow: 'none',
                    overflow: 'visible'
                }
            }}
        >
            <Box sx={{
                position: 'relative',
                bgcolor: '#fdfbf7', // Cream paper color
                p: 4,
                borderRadius: 2,
                boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
                textAlign: 'center',
                transform: 'rotate(-2deg)', // Slight tilt like a tossed letter
                border: '1px solid #e0e0e0',
                backgroundImage: 'linear-gradient(#fdfbf7 2px, transparent 2px), linear-gradient(90deg, #fdfbf7 2px, transparent 2px), linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)',
                backgroundSize: '20px 20px',
            }}>
                {/* Stamps/Postmarks decoration */}
                <Box sx={{ position: 'absolute', top: 10, right: 10, opacity: 0.7, transform: 'rotate(15deg)' }}>
                    <Box sx={{ width: 60, height: 60, border: '3px double #d32f2f', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d32f2f', fontWeight: 'bold', fontSize: '0.7rem' }}>
                        URGENT
                    </Box>
                </Box>
                <Box sx={{ position: 'absolute', top: 10, left: 10, opacity: 0.6, transform: 'rotate(-10deg)', border: '2px solid #1a237e', padding: '2px 8px', color: '#1a237e', fontWeight: 'bold', fontSize: '0.8rem', letterSpacing: 2 }}>
                    AIR MAIL
                </Box>

                {/* Icon */}
                <Box sx={{ fontSize: '4rem', mb: 2, filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.2))' }}>
                    ✉️
                </Box>

                {/* Letter Content */}
                <Typography variant="h5" sx={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, color: '#2c3e50', mb: 1 }}>
                    A Letter for You
                </Typography>
                <Typography variant="body1" sx={{ fontFamily: 'Merriweather, serif', color: '#546e7a', mb: 3, fontStyle: 'italic', lineHeight: 1.6 }}>
                    "We've collected some fond memories and stats from your journey in 2025. Attached herewith is your personalized summary."
                </Typography>

                {/* Attachment / Action */}
                <Box
                    onClick={() => { onClose(); onOpenWrapped(); }}
                    sx={{
                        cursor: 'pointer',
                        bgcolor: '#e0e0e0',
                        p: 2,
                        borderRadius: 1,
                        border: '1px dashed #9e9e9e',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        transition: 'all 0.3s ease',
                        '&:hover': { bgcolor: '#d7ccc8', transform: 'scale(1.02)' }
                    }}
                >
                    <Box sx={{ fontSize: '2rem' }}>📎</Box>
                    <Box sx={{ textAlign: 'left' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#3e2723' }}>
                            Leave_Wrapped_2025.pdf
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#5d4037' }}>
                            258 KB • Click to Open
                        </Typography>
                    </Box>
                </Box>

                {/* Wax Seal Button (Alternative or Decorative) */}
                <Box sx={{ mt: 3 }}>
                    <Box
                        onClick={() => { onClose(); onOpenWrapped(); }}
                        sx={{
                            display: 'inline-block',
                            cursor: 'pointer',
                            bgcolor: '#b71c1c',
                            color: 'white',
                            width: 50,
                            height: 50,
                            borderRadius: '50%',
                            lineHeight: '50px',
                            boxShadow: '0 4px 10px rgba(183, 28, 28, 0.5), inset 0 2px 5px rgba(255,255,255,0.3)',
                            fontWeight: 'bold',
                            fontSize: '0.8rem',
                            border: '4px solid #c62828'
                        }}
                    >
                        OPEN
                    </Box>
                </Box>
            </Box>
        </Dialog>
    );
};

export default WrappedTeaser;

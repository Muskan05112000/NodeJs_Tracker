import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';

const SecretReveal = ({ children }) => {
    const [revealed, setRevealed] = useState(false);
    return (
        <Box
            onMouseEnter={() => setRevealed(true)}
            onClick={() => setRevealed(true)}
            sx={{ position: 'relative', display: 'inline-block', cursor: 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'40\' height=\'48\' viewport=\'0 0 100 100\' style=\'fill:black;font-size:24px;\'><text y=\'50%\'>🔍</text></svg>") 16 0, auto' }}
        >
            <Box sx={{
                filter: revealed ? 'none' : 'blur(20px)',
                transition: 'filter 0.8s ease',
                opacity: revealed ? 1 : 0.8
            }}>
                {children}
            </Box>
            {!revealed && (
                <Box sx={{
                    position: 'absolute', top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%)',
                    pointerEvents: 'none',
                    zIndex: 10
                }}>
                    <Typography variant="h1" sx={{ fontSize: '4rem', opacity: 0.7 }}>🔍</Typography>
                    <Box sx={{
                        marginTop: 1,
                        background: 'linear-gradient(90deg, rgba(0,0,0,0.6) 0%, rgba(50,50,50,0.4) 100%)',
                        backdropFilter: 'blur(4px)',
                        padding: '6px 20px',
                        borderRadius: '6px', // Rectangular
                        border: '1px solid rgba(255,255,255,0.15)',
                        animation: 'pulse 2s infinite ease-in-out',
                        display: 'inline-block',
                        minWidth: 'max-content' // Ensure it fits text
                    }}>
                        <Typography variant="caption" sx={{
                            color: '#fff',
                            fontWeight: 700,
                            letterSpacing: 2,
                            fontSize: '0.7rem',
                            textTransform: 'uppercase',
                            whiteSpace: 'nowrap' // Force single line
                        }}>
                            HOVER TO DECLASSIFY
                        </Typography>
                    </Box>
                    <style>{`
                        @keyframes pulse {
                            from { opacity: 0.7; transform: scale(1); }
                            to { opacity: 1; transform: scale(1.05); }
                        }
                    `}</style>
                </Box>
            )}
        </Box>
    );
};

export default SecretReveal;

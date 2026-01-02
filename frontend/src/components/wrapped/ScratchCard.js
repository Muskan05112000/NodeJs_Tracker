import React, { useState, useEffect, useRef } from 'react';
import { Box } from '@mui/material';

const ScratchCard = ({ children, width = 600, height = 300, coverText = "SCRATCH TO REVEAL MISSION", onScratchStart, onScratchEnd }) => {
    const canvasRef = useRef(null);
    const [isScratching, setIsScratching] = useState(false);
    // const [cleared, setCleared] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        // Fill with "CLASSIFIED" styles
        ctx.fillStyle = '#C0C0C0'; // Silver
        ctx.fillRect(0, 0, width, height);

        // Add Texture
        for (let i = 0; i < 5000; i++) {
            ctx.fillStyle = Math.random() > 0.5 ? '#A9A9A9' : '#D3D3D3';
            ctx.fillRect(Math.random() * width, Math.random() * height, 2, 2);
        }

        // Add Text
        ctx.fillStyle = '#444';
        ctx.font = '900 30px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.save();
        ctx.translate(width / 2, height / 2);
        ctx.rotate(-0.1);
        ctx.fillText("/// CONFIDENTIAL ///", 0, -20);
        ctx.font = '700 20px "Courier New", monospace';
        ctx.fillText(coverText, 0, 20);
        ctx.restore();

    }, [width, height, coverText]);

    const scratch = (e) => {
        // if (cleared) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();

        let x, y;
        if (e.type.includes('touch')) {
            x = e.touches[0].clientX - rect.left;
            y = e.touches[0].clientY - rect.top;
        } else {
            x = e.clientX - rect.left;
            y = e.clientY - rect.top;
        }

        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(x, y, 60, 0, Math.PI * 2); // Brush size
        ctx.fill();
    };

    const handleStart = (e) => {
        e.stopPropagation();
        setIsScratching(true);
        if (onScratchStart) onScratchStart();
    };

    const handleEnd = (e) => {
        e.stopPropagation();
        setIsScratching(false);
        if (onScratchEnd) onScratchEnd();
    };

    return (
        <Box className="interactive" sx={{ position: 'relative', width: width, height: height, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {/* Content Underneath */}
            <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', zIndex: 1, userSelect: 'none' }}>
                {children}
            </Box>

            {/* Scratch Overlay */}
            <canvas
                ref={canvasRef}
                width={width}
                height={height}
                onMouseDown={handleStart}
                onMouseUp={handleEnd}
                onMouseMove={(e) => { e.stopPropagation(); if (isScratching || e.buttons === 1) scratch(e); }}
                onTouchStart={handleStart}
                onTouchEnd={handleEnd}
                onTouchMove={(e) => { e.stopPropagation(); if (isScratching) scratch(e); }}
                onClick={(e) => e.stopPropagation()}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    zIndex: 2,
                    cursor: 'crosshair',
                    borderRadius: '10px',
                    touchAction: 'none',
                    pointerEvents: 'auto'
                }}
            />
        </Box>
    );
};

export default ScratchCard;

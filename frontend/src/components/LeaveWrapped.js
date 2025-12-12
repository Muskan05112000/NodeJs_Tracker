import React, { useState, useEffect } from 'react';
import { Dialog, Box, Typography, Button, Slide, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useAuth } from '../context/AuthContext';
import { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import Confetti from 'react-confetti';
import CountUp from 'react-countup';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

// Helper Component for "Spy Reveal" effect
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

// Scratch Card Component for Title
// Scratch Card Component for Title
const ScratchCard = ({ children, width = 600, height = 300, coverText = "SCRATCH TO REVEAL MISSION", onScratchStart, onScratchEnd }) => {
    const canvasRef = React.useRef(null);
    const [isScratching, setIsScratching] = useState(false);
    const [cleared, setCleared] = useState(false);

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
        if (cleared) return;
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
                    pointerEvents: cleared ? 'none' : 'auto'
                }}
            />
        </Box>
    );
};

const LeaveWrapped = ({ open, onClose }) => {
    const { user } = useAuth();
    const { activeLeaves, employees } = useContext(AppContext);
    const [data, setData] = useState(null);
    const [step, setStep] = useState(0);
    const [showConfetti, setShowConfetti] = useState(false);
    const currentYear = new Date().getFullYear();
    const lastInteractTime = React.useRef(0);

    const handleScratchEnd = () => {
        lastInteractTime.current = Date.now();
    };


    // --- SFX & BACKGROUND MUSIC LOGIC ---
    const [audioContext, setAudioContext] = useState(null);

    useEffect(() => {
        if (!open) return;

        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        setAudioContext(ctx);

        // --- BACKGROUND MUSIC (Jingle Bells - Slow & Rich) ---
        // Tempo: ~80 BPM (Slowed down for majestic feel)
        // Harmony added: Bass roots (C, F, G)
        const E5 = 659.25, G5 = 783.99, C5 = 523.25, D5 = 587.33, F5 = 698.46;
        const C3 = 130.81, F3 = 174.61, G3 = 196.00, A3 = 220.00; // Bass Notes

        const TEMPO_SCALE = 1.3; // Slower

        const sequence = [
            // MELODY (Jingle Bells)
            { note: E5, time: 0.0, duration: 0.2 }, { note: E5, time: 0.25, duration: 0.2 }, { note: E5, time: 0.5, duration: 0.4 },
            { note: E5, time: 1.0, duration: 0.2 }, { note: E5, time: 1.25, duration: 0.2 }, { note: E5, time: 1.5, duration: 0.4 },
            { note: E5, time: 2.0, duration: 0.2 }, { note: G5, time: 2.25, duration: 0.2 }, { note: C5, time: 2.5, duration: 0.2 }, { note: D5, time: 2.75, duration: 0.1 }, { note: E5, time: 3.0, duration: 0.8 },

            { note: F5, time: 4.0, duration: 0.2 }, { note: F5, time: 4.25, duration: 0.2 }, { note: F5, time: 4.5, duration: 0.2 }, { note: F5, time: 4.75, duration: 0.2 },
            { note: F5, time: 5.0, duration: 0.2 }, { note: E5, time: 5.25, duration: 0.2 }, { note: E5, time: 5.5, duration: 0.2 }, { note: E5, time: 5.75, duration: 0.1 }, { note: E5, time: 6.0, duration: 0.1 },
            { note: E5, time: 6.25, duration: 0.2 }, { note: D5, time: 6.5, duration: 0.2 }, { note: D5, time: 6.75, duration: 0.2 }, { note: E5, time: 7.0, duration: 0.2 }, { note: D5, time: 7.25, duration: 0.4 }, { note: G5, time: 7.75, duration: 0.4 },

            // BASS HARMONY (Long sustained notes)
            { note: C3, time: 0.0, duration: 1.8, type: 'triangle', vol: 0.2 }, // C Major
            { note: C3, time: 2.0, duration: 1.8, type: 'triangle', vol: 0.2 },
            { note: F3, time: 4.0, duration: 1.8, type: 'triangle', vol: 0.2 }, // F Major
            { note: G3, time: 6.0, duration: 1.8, type: 'triangle', vol: 0.2 }, // G Major
        ];

        // Apply Tempo Scaling
        const scaledSequence = sequence.map(s => ({
            ...s,
            time: s.time * TEMPO_SCALE,
            duration: s.duration * TEMPO_SCALE
        }));

        const outputGain = ctx.createGain();
        outputGain.gain.setValueAtTime(0.1, ctx.currentTime); // Low global volume
        outputGain.connect(ctx.destination);

        const scheduleNote = (freq, startTime, duration, type = 'sine', vol = 0.2) => {
            const osc = ctx.createOscillator();
            const gainNode = ctx.createGain();

            osc.type = type; // Pure tone
            osc.frequency.setValueAtTime(freq, startTime);

            // Envelope
            gainNode.gain.setValueAtTime(0, startTime);
            gainNode.gain.linearRampToValueAtTime(vol, startTime + 0.05); // Attack
            gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration); // Decay based on note length

            osc.connect(gainNode);
            gainNode.connect(outputGain);

            osc.start(startTime);
            osc.stop(startTime + duration + 0.1);
        };

        const LOOP_DURATION = 8.0 * TEMPO_SCALE; // Seconds
        let nextLoopTime = ctx.currentTime + 0.5; // Start shortly after load

        const scheduleLoop = () => {
            if (ctx.state === 'closed') return;

            // Schedule the whole sequence for this loop iteration
            scaledSequence.forEach(event => {
                scheduleNote(event.note, nextLoopTime + event.time, event.duration, event.type, event.vol);
            });

            // Advance time
            nextLoopTime += LOOP_DURATION;
        };

        // Poll to schedule loops continuously (lookahead)
        const checkScheduler = () => {
            if (ctx.state === 'closed') return;
            // If next loop is within 1s, schedule it
            if (nextLoopTime < ctx.currentTime + 1.0) {
                scheduleLoop();
            }
        };

        const timerID = setInterval(checkScheduler, 500);
        // Initial schedule
        scheduleLoop();

        return () => {
            clearInterval(timerID);
            if (ctx.state !== 'closed') ctx.close();
        };
    }, [open]);

    // Play specific SFX on top of background music
    useEffect(() => {
        if (!audioContext || audioContext.state === 'closed') return;

        const playSfx = (type) => {
            if (audioContext.state === 'suspended') audioContext.resume();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            if (type === 'woosh') {
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.1);
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
                oscillator.start();
                oscillator.stop(audioContext.currentTime + 0.1);
            } else if (type === 'thud') {
                oscillator.type = 'triangle';
                oscillator.frequency.setValueAtTime(100, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(10, audioContext.currentTime + 0.3);
                gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                oscillator.start();
                oscillator.stop(audioContext.currentTime + 0.3);
            }
        };

        playSfx('woosh');
        if (step === 5) setTimeout(() => playSfx('thud'), 800);

    }, [step, audioContext]);

    useEffect(() => {
        if (open && user && activeLeaves && employees) {
            // Client-side calculation (Single Source of Truth)
            const userName = user.username || user.name;
            // const currentYear = new Date().getFullYear(); // Moved to component scope

            if (!userName) {
                setData({ error: true, message: "User identifier not found" });
                return;
            }

            // Filter for THIS user and THIS year
            const userLeaves = activeLeaves.filter(l => {
                const d = new Date(l.date);
                return l.employee === userName && d.getFullYear() === currentYear;
            });

            // Calculate Rank (Global Leaderboard)
            const leaderboard = employees.map(emp => {
                const count = activeLeaves.filter(l => {
                    const d = new Date(l.date);
                    return l.employee === emp.name && d.getFullYear() === currentYear;
                }).length;
                return { name: emp.name, count };
            });

            // Sort descending (Highest leaves = Rank 1)
            leaderboard.sort((a, b) => b.count - a.count);

            // Find my rank (1-based index)
            const myRankIndex = leaderboard.findIndex(item => item.name === userName);
            const rank = myRankIndex !== -1 ? myRankIndex + 1 : 'N/A';


            if (userLeaves.length === 0) {
                setData({
                    totalDays: 0,
                    topType: 'Undercover Agent',
                    longestStreak: 0,
                    message: "We missed to concentrate spying on you... more will come full fledged from the upcoming year for sure!",
                    punctuality: { title: "The Ghost 👻", reason: "No data found. You were invisible." },
                    peakMonth: "N/A",
                    peakMonthTitle: "Radio Silence",
                    utilization: 0,
                    utilizationTitle: "The Untouched Reserve",
                    rank: rank
                });
                setStep(0);
                return;
            }

            // Calculation Logic
            // 1. Total Days
            const totalDays = userLeaves.length;

            // 2. Top Type & Peak Month & Advance Booking
            const byType = {};
            const byMonth = {};
            let advanceBookingCount = 0;

            userLeaves.forEach(l => {
                // Type
                byType[l.type] = (byType[l.type] || 0) + 1;

                // Month
                const d = new Date(l.date);
                const m = d.toLocaleString('default', { month: 'long' });
                byMonth[m] = (byMonth[m] || 0) + 1;

                // Advance (Simplified: Planned = Advance)
                if (l.type === 'Planned') advanceBookingCount++;
            });

            // Top Type
            let topType = 'Planned';
            let maxCount = 0;
            for (const [type, count] of Object.entries(byType)) {
                if (count > maxCount) {
                    maxCount = count;
                    topType = type;
                }
            }

            // Peak Month
            let peakMonth = 'N/A';
            let peakMonthCount = 0;
            for (const [m, count] of Object.entries(byMonth)) {
                if (count > peakMonthCount) {
                    peakMonthCount = count;
                    peakMonth = m;
                }
            }

            // 3. Longest Streak
            const sortedDates = userLeaves
                .map(l => new Date(l.date).getTime())
                .sort((a, b) => a - b);

            let longestStreak = 1;
            let currentStreak = 1;
            for (let i = 1; i < sortedDates.length; i++) {
                const diffDays = Math.round((sortedDates[i] - sortedDates[i - 1]) / (1000 * 60 * 60 * 24));
                if (diffDays === 1) {
                    currentStreak++;
                } else {
                    if (currentStreak > longestStreak) longestStreak = currentStreak;
                    currentStreak = 1;
                }
            }
            if (currentStreak > longestStreak) longestStreak = currentStreak;

            // 4. Punctuality (Random Funny Titles with Reasons)

            // 5. Utilization
            const entitlement = 36;
            const utilization = Math.min(Math.round((totalDays / entitlement) * 100), 100);
            let utilizationTitle = "Saving for a Rainy Day";
            if (utilization > 90) utilizationTitle = "The Leave Master (Apex Tier)";
            else if (utilization > 75) utilizationTitle = "The Max Utilizer Award";



            // 6. Punctuality / Persona (Refined Logic)
            const percentPlanned = totalDays > 0 ? (advanceBookingCount / totalDays) * 100 : 0;
            let punctualityData = { title: "The Ghost 👻", reason: "No data found. You were invisible." };

            // --- TIME TRAVELER LOGIC ---
            const nextYear = currentYear + 1;
            const myNextJanLeaves = activeLeaves.filter(l => {
                const d = new Date(l.date);
                return l.employee === userName && d.getFullYear() === nextYear && d.getMonth() === 0;
            }).length;

            let maxNextJanLeaves = 0;
            employees.forEach(emp => {
                const count = activeLeaves.filter(l => {
                    const d = new Date(l.date);
                    return l.employee === emp.name && d.getFullYear() === nextYear && d.getMonth() === 0;
                }).length;
                if (count > maxNextJanLeaves) maxNextJanLeaves = count;
            });

            const isTimeTraveler = myNextJanLeaves > 0 && myNextJanLeaves === maxNextJanLeaves;

            // --- UNIQUE PERSONA GENERATOR (20+ Static Titles) ---
            if (totalDays > 0) {
                let baseTitle = "The Shadow Operative 🕶️";
                let baseReason = "No distinct pattern found. You kept your movements completely unpredictable.";

                // --- PRE-CALCULATE STATS ---
                const byDay = {};
                const byMonth = {};
                userLeaves.forEach(l => {
                    const d = new Date(l.date);
                    const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
                    const monthIdx = d.getMonth();
                    byDay[dayName] = (byDay[dayName] || 0) + 1;
                    byMonth[monthIdx] = (byMonth[monthIdx] || 0) + 1;
                });

                const mondayCount = byDay['Monday'] || 0;
                const fridayCount = byDay['Friday'] || 0;
                const wednesdayCount = byDay['Wednesday'] || 0;
                const tueThuCount = (byDay['Tuesday'] || 0) + (byDay['Thursday'] || 0);

                // Quarter Stats
                const q1Count = (byMonth[0] || 0) + (byMonth[1] || 0) + (byMonth[2] || 0); // Jan-Mar
                const q4Count = (byMonth[9] || 0) + (byMonth[10] || 0) + (byMonth[11] || 0); // Oct-Dec
                const summerCount = (byMonth[5] || 0) + (byMonth[6] || 0) + (byMonth[7] || 0); // Jun-Aug
                const decCount = byMonth[11] || 0;

                // Unique Day Count (How many different weekdays they took off)
                const uniqueWeekdays = Object.keys(byDay).length;

                // --- RULE EVALUATION (Specific -> General) ---

                // 1. Time Traveler (Next Year Logic)
                if (isTimeTraveler) {
                    baseTitle = "The Time Traveler ⏳";
                    baseReason = `You're living in the future! Most leaves booked for next Jan (${myNextJanLeaves} days).`;
                }
                // 2. The Ghost (Very Low Usage)
                else if (totalDays <= 3) {
                    baseTitle = "The Ghost 👻";
                    baseReason = "You were barely here... or maybe you were never here at all.";
                }
                // 3. The Marathon Runner (High Usage)
                else if (totalDays >= 25) {
                    baseTitle = "The Marathon Runner 🏃";
                    baseReason = "You used almost every single day available. Maximum efficiency.";
                }
                // 4. Fortune Teller (100% Planned)
                else if (percentPlanned === 100) {
                    baseTitle = "The Fortune Teller 🔮";
                    baseReason = "You knew you'd need a break months ago. 0% Surprise, 100% Execution.";
                }
                // 5. December Dasher (December specific)
                else if (decCount / totalDays >= 0.5) {
                    baseTitle = "The December Dasher 🦌";
                    baseReason = "You saved all your ammunition for the grand finale. See you next year!";
                }
                // 6. Deep Sleeper (Long Streak)
                else if (longestStreak > 10) {
                    baseTitle = "The Deep Sleeper 🛌";
                    baseReason = `You went into deep cover for ${longestStreak} days. We almost authorized a search party.`;
                }
                // 7. Summer Soul (Mid-Year)
                else if (summerCount / totalDays >= 0.5) {
                    baseTitle = "The Summer Soul ☀️";
                    baseReason = "You followed the sun. Most of your leaves were in June, July, or August.";
                }
                // 8. Early Riser (Q1)
                else if (q1Count / totalDays >= 0.5) {
                    baseTitle = "The Early Riser 🌅";
                    baseReason = "You started the year resting while everyone else was just waking up.";
                }
                // 9. Late Bloomer (Q4 non-December specific)
                else if (q4Count / totalDays >= 0.6) {
                    baseTitle = "The Late Bloomer 🌒";
                    baseReason = "You waited until the very end of the year to vanish.";
                }
                // 10. Monday Assassin
                else if ((mondayCount / totalDays) >= 0.45) {
                    baseTitle = "The Monday Assassin 🗡️";
                    baseReason = "You have systematically eliminated Mondays from your calendar.";
                }
                // 11. Friday Escapist
                else if ((fridayCount / totalDays) >= 0.45) {
                    baseTitle = "The Friday Escapist 🚀";
                    baseReason = "By Thursday noon, you're already mentally checked out.";
                }
                // 12. Hump Day Hacker
                else if ((wednesdayCount / totalDays) >= 0.4) {
                    baseTitle = "The Hump Day Hacker 🐫";
                    baseReason = "Splitting the week in half to maintain optimal sanity levels. Genius.";
                }
                // 13. Bridge Architect (Tue/Thu)
                else if ((tueThuCount / totalDays) >= 0.4) {
                    baseTitle = "The Bridge Architect 🌉";
                    baseReason = "Expert at turning 1 holiday into 4 days off. Engineering genius.";
                }
                // 14. Micro-Doser (Short frequent leaves)
                else if (longestStreak <= 1 && totalDays > 8) {
                    baseTitle = "The Micro-Doser 🧪";
                    baseReason = "You prefer your freedom in small, controlled tactical bursts. Never gone for long.";
                }
                // 15. The Chameleon (All days used)
                else if (uniqueWeekdays === 5 && totalDays > 10) {
                    baseTitle = "The Chameleon 🦎";
                    baseReason = "Monday, Tuesday, Friday... you don't discriminate. You take them all.";
                }
                // 16. Calendar CEO (High Planning)
                else if (percentPlanned >= 85) {
                    baseTitle = "The Calendar CEO 📅";
                    baseReason = "Your schedule is tighter than a drum. Strategic allocation of resources.";
                }
                // 17. Chaos Agent (Low Planning)
                else if (percentPlanned <= 20 && totalDays > 5) {
                    baseTitle = "The Chaos Agent 🌪️";
                    baseReason = "Zero plans, pure instinct. You keep HR on their toes.";
                }
                // 18. Long Weekender (Mon+Fri)
                else if ((mondayCount + fridayCount) / totalDays >= 0.6) {
                    baseTitle = "The Long Weekender 🏖️";
                    baseReason = "Mondays and Mondays (and Fridays) are just suggestions to you.";
                }
                // 19. Tactical Planner (Mid Planning)
                else if (percentPlanned >= 60) {
                    baseTitle = "The Tactical Planner 🎯";
                    baseReason = "Balanced, orderly, and suspiciously well-adjusted.";
                }
                // 20. Balanced Zen (The Rest)
                else if (percentPlanned >= 40 && percentPlanned < 60) {
                    baseTitle = "The Balanced Zen ☯️";
                    baseReason = "Perfect harmony between planning ahead and seizing the moment.";
                }
                // 21. Strategist (Backup)
                else {
                    baseTitle = "The Strategist ♟️";
                    baseReason = "Calculated moves only. You leave when you need to.";
                }

                punctualityData = {
                    title: baseTitle,
                    reason: baseReason
                };
            }

            const message = "Take more leaves!";

            setData({
                totalDays,
                topType,
                longestStreak,
                message,
                punctuality: punctualityData, // Now deterministic
                peakMonth,
                peakMonthTitle: "The Month You Peaced Out",
                utilization,
                utilizationTitle,
                rank,
                rank
            });
            setStep(0);
            setShowConfetti(false);
        }
    }, [open, user, activeLeaves, employees]);





    if (!data) return (
        <Dialog fullScreen open={open} onClose={onClose} TransitionComponent={Transition}>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', bgcolor: '#1a1a1a' }}>
                <Typography variant="h4" fontWeight={700} color="#fff" sx={{ animation: 'pulse 1.5s infinite' }}>
                    Unwrapping your year...
                </Typography>
            </Box>
        </Dialog>
    );


    // Dynamic backgrounds
    const bgStyles = [
        { background: 'linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)', animation: 'gradientBG 15s ease infinite' }, // 0
        { background: 'radial-gradient(circle at center, #2b5876 0%, #4e4376 100%)' }, // 1
        { background: 'linear-gradient(to top, #30cfd0 0%, #330867 100%)' }, // 2
        { background: 'linear-gradient(120deg, #f093fb 0%, #f5576c 100%)' }, // 3
        { background: 'linear-gradient(to right, #a943e9ff 0%, #f938cfff 100%)' }, // 4
        { background: 'linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)', animation: 'gradientBG 15s ease infinite' }, // 5
        { background: 'linear-gradient(to bottom right, #FF512F, #DD2476)' }, // 6
        { background: 'linear-gradient(to right, #8360c3, #2ebf91)' }, // 7
    ];

    const AnimationStyles = () => (
        <style>
            {`
            @keyframes pulse {
                0% { opacity: 0.6; transform: scale(0.98); }
                50% { opacity: 1; transform: scale(1.02); }
                100% { opacity: 0.6; transform: scale(0.98); }
            }
            @keyframes gradientBG {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
            }
            @keyframes slideUpFade {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            @keyframes stampThud {
                0% { opacity: 0; transform: scale(5) rotate(-25deg); }
                50% { opacity: 1; transform: scale(1) rotate(-25deg); }
                70% { transform: scale(1.1) rotate(-25deg); }
                100% { opacity: 1; transform: scale(1) rotate(-25deg); }
            }
            @keyframes slideRight {
                from { opacity: 0; transform: translateX(-50px); }
                to { opacity: 1; transform: translateX(0); }
            }
            @keyframes rotateIn {
                from { opacity: 0; transform: scale(0.5) rotate(-10deg); }
                to { opacity: 1; transform: scale(1) rotate(0); }
            }
            @keyframes elasticPop {
                0% { opacity: 0; transform: scale(0); }
                70% { opacity: 1; transform: scale(1.1); }
                100% { opacity: 1; transform: scale(1); }
            }
            @keyframes blurReveal {
                from { opacity: 0; filter: blur(20px); transform: scale(1.1); }
                to { opacity: 1; filter: blur(0); transform: scale(1); }
            }
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes scanLine {
                0% { top: 0%; opacity: 0; }
                10% { opacity: 1; }
                90% { opacity: 1; }
                100% { top: 100%; opacity: 0; }
            }
            @keyframes particleGather {
                0% { opacity: 0; transform: scale(2); filter: blur(20px); letter-spacing: 50px; }
                50% { opacity: 0.5; transform: scale(1.5); filter: blur(10px); letter-spacing: 10px; }
                100% { opacity: 1; transform: scale(1); filter: blur(0); letter-spacing: normal; }
            }
            `}
        </style>
    );

    if (data.error) return (
        <Dialog fullScreen open={open} onClose={onClose} TransitionComponent={Transition}>
            {/* Styles */}
            <AnimationStyles />
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', bgcolor: '#1a1a1a', flexDirection: 'column' }}>
                <Typography variant="h4" fontWeight={700} color="#fff">Error Loading Mission</Typography>
                <Button onClick={onClose} variant="contained" sx={{ mt: 2 }}>Close</Button>
            </Box>
        </Dialog>
    );
    const funnyQuotes = [
        "I don't need a vacation, I need a restart button.",
        "My favorite childhood memory is not paying bills.",
        "I work hard so my cat can have a better life.",
        "Out of office: Physically here, mentally on a beach.",
        "I assume my email will answer itself while I'm gone. It never does.",
        "Vacation calories don't count. Everyone knows that.",
        "A bad day on vacation is better than a good day at the office.",
        "Me: I'm going to be productive.\nNarrator: He was not.",
        "Current status: Looking for a way to get paid for sleeping.",
        "Sickness is just my body saying 'Nope, not today'."
    ];


    // Navigation Logic (Tap Left/Right)
    const handleTap = (e) => {
        // Ignore clicks on buttons/interactive elements to prevent double triggers
        if (e.target.closest('button') || e.target.closest('.interactive')) return;

        // Prevent navigation if user just finished interacting (e.g. scratching)
        if (Date.now() - lastInteractTime.current < 500) return;

        const screenWidth = window.innerWidth;
        const clickX = e.clientX;

        if (clickX > screenWidth / 2) {
            // Next
            if (step < slides.length - 1) {
                setStep(step + 1);
                if (step + 1 === slides.length - 1) setShowConfetti(true);
            }
        } else {
            // Prev
            if (step > 0) {
                setStep(step - 1);
                setShowConfetti(false);
            }
        }
    };



    const slides = [
        // Slide 0: Intro (Spy Theme)
        {
            content: (
                <>
                    <Typography variant="h6" color="#FFD700" sx={{ letterSpacing: 4, mb: 2, fontWeight: 700, textTransform: 'uppercase' }}>
                        TOP SECRET 🕵️‍♂️
                    </Typography>

                    <ScratchCard width={600} height={200} onScratchEnd={handleScratchEnd}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <Typography variant="h3" fontWeight={900} color="#fff" sx={{ textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
                                Your {currentYear}
                            </Typography>
                            <Typography variant="h4" color="#fff" sx={{ letterSpacing: 2, fontWeight: 300 }}>
                                LEAVE MISSION REPORT
                            </Typography>
                        </Box>
                    </ScratchCard>

                    <Typography variant="h6" color="#ccc" sx={{ maxWidth: '700px', fontStyle: 'italic', lineHeight: 1.6, mt: 4 }}>
                        "Yeah, we spied on all you guys in between the hectic work too... <br />
                        Here is the declassified footage of your year."
                    </Typography>
                </>
            )
        },
        // Slide 1: Total Days (Surveillance)
        {
            content: (
                <>
                    <Typography variant="h4" color="#fff" sx={{ opacity: 0.9, mb: 4, letterSpacing: 1, fontWeight: 700 }}>📂 Surveillance Log: Annual Absence</Typography>
                    <SecretReveal>
                        <Typography variant="h1" fontWeight={900} color="#fff" sx={{ fontSize: '9rem', textShadow: '0 0 30px rgba(255,255,255,0.4)' }}>
                            <CountUp end={data.totalDays} duration={2.5} />
                        </Typography>
                    </SecretReveal>
                    <Typography variant="h6" color="#eee" sx={{ mt: 2, maxWidth: '80%', fontStyle: 'italic', lineHeight: 1.5 }}>
                        {data.totalDays === 0 ?
                            "Target stationary. No significant movements detected. We will be watching you closely next year." :
                            (data.totalDays > 20
                                ? "Our drones successfully lost track of you this many times. Tactics: Admirable."
                                : "You were barely out of our sight. Surveillance was... boringly easy.")}
                    </Typography>
                </>
            )
        },
        // Slide 2: Top Type (Modus Operandi)
        {
            content: (
                <>
                    <Typography variant="h4" color="#fff" sx={{ opacity: 0.9, mb: 6, letterSpacing: 1, fontWeight: 700 }}>📂 Modus Operandi</Typography>
                    <Typography variant="h2" fontWeight={800} color="#fff" sx={{ transform: 'scale(1.2)', transition: 'transform 0.5s' }}>
                        {data.topType}
                    </Typography>
                    <Typography variant="h5" color="#eee" sx={{ mt: 5, fontStyle: 'italic', maxWidth: '80%', lineHeight: 1.5 }}>
                        {data.topType === 'Planned'
                            ? "Premeditated absence. You executed these getaways with tactical precision."
                            : data.topType === 'Sick'
                                ? "Biological warfare alibi verified. Or was it just Monday allergies?"
                                : "The 'Panic Button' specialist. Your departures were... dramatic."}
                    </Typography>
                </>
            )
        },
        // Slide 3: Peak Month (The Vanishing)
        {
            content: (
                <>
                    <Typography variant="h4" color="#fff" sx={{ opacity: 0.9, mb: 4, letterSpacing: 1, fontWeight: 700 }}>The Vanishing Act</Typography>
                    <SecretReveal>
                        <Typography variant="h2" fontWeight={900} color="#fff" sx={{ mb: 2 }}>{data.peakMonth || 'N/A'}</Typography>
                    </SecretReveal>
                    <Typography variant="h6" color="#fff" sx={{ opacity: 0.8, mt: 2 }}>
                        "{data.peakMonthTitle}"
                    </Typography>
                    <Typography variant="h6" color="#eee" sx={{ mt: 4, maxWidth: '80%', fontStyle: 'italic' }}>
                        "Satellite imagery shows zero activity from your desk for more hours than ever during this month. Ghost protocol initiated?"
                    </Typography>
                </>
            )
        },
        // Slide 4: Longest Streak (Deep Cover)
        {
            content: (
                <>
                    <Typography variant="h4" color="#fff" sx={{ opacity: 0.9, mb: 4, letterSpacing: 1, fontWeight: 700 }}>Deep Cover Assignment</Typography>
                    <SecretReveal>
                        <Typography variant="h1" fontWeight={900} color="#fff" sx={{ fontSize: '8rem' }}>
                            <CountUp end={data.longestStreak} duration={3} />
                        </Typography>
                    </SecretReveal>
                    <Typography variant="h5" color="#fff" sx={{ mt: 2 }}>Consecutive Days Dark</Typography>
                    <Typography variant="h6" color="#eee" sx={{ mt: 4, maxWidth: '80%', fontStyle: 'italic' }}>
                        {data.longestStreak > 5
                            ? `You went dark for ${data.longestStreak} days straight. We almost authorized a search party.`
                            : "A short tactical retreat. You popped back up on the radar before we could even miss you."}
                    </Typography>
                </>
            )
        },
        // Slide 5: Punctuality (Tactical Planning)
        {
            id: 'persona',
            content: (
                <>
                    <Typography variant="h4" color="#fff" sx={{ opacity: 0.9, mb: 6, letterSpacing: 1, fontWeight: 700 }}>Tactical Planning Award</Typography>

                    <ScratchCard width={window.innerWidth * 0.8} height={150} coverText="REVEAL AGENT IDENTITY" onScratchEnd={handleScratchEnd}>
                        <Typography variant="h3" fontWeight={800} color="#fff" sx={{ px: 4, lineHeight: 1.4 }}>
                            {data.punctuality.title}
                        </Typography>
                    </ScratchCard>
                    <Typography variant="h5" color="#eee" sx={{ mt: 4, fontStyle: 'italic', opacity: 0.9, maxWidth: '80%' }}>
                        "{data.punctuality.reason}"
                    </Typography>
                </>
            )
        },
        // Slide 6: Utilization (Resource Report)
        {
            content: (
                <>
                    <Typography variant="h4" color="#fff" sx={{ opacity: 0.9, mb: 2, letterSpacing: 1, fontWeight: 700 }}>Utilization of Escape (Rank No. {data.rank})</Typography>
                    <SecretReveal>
                        <Typography variant="h1" fontWeight={900} color="#fff" sx={{ fontSize: '7rem' }} data-testid="utilization-text">
                            <CountUp end={data.utilization || 0} duration={2} suffix="%" />
                        </Typography>
                    </SecretReveal>
                    <Box sx={{
                        width: '80%', height: 20, bgcolor: 'rgba(255,255,255,0.2)',
                        borderRadius: 8, mt: 5, overflow: 'hidden', position: 'relative'
                    }}>
                        <Box sx={{
                            width: `${data.utilization || 0}%`,
                            height: '100%',
                            bgcolor: '#fff',
                            transition: 'width 2s ease-out'
                        }} />
                    </Box>
                    <Typography variant="h4" fontWeight={700} color="#fff" sx={{ mt: 5 }}>
                        {data.utilizationTitle}
                    </Typography>

                    <Typography variant="h6" color="#eee" sx={{ mt: 3, fontStyle: 'italic', opacity: 0.9 }}>
                        Score Logic: Percentage of your 36 yearly leaves utilized.
                    </Typography>

                    <Typography variant="body1" color="rgba(255,255,255,0.8)" sx={{ mt: 6, maxWidth: '700px', display: 'block', fontStyle: 'italic' }}>
                        "Hey, don't be surprised—we have spied on you for the last few months only as re-building our survillance system took time ! 😉"
                    </Typography>
                </>
            )
        },

        // Slide 8: Outro / Summary Dashboard
        {
            content: (
                <Box sx={{ position: 'relative', width: '100%', maxWidth: '850px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

                    {/* Background Watermark */}
                    <Box sx={{
                        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(-30deg)',
                        opacity: 0.05, pointerEvents: 'none', whiteSpace: 'nowrap', zIndex: 0
                    }}>
                        <Typography variant="h1" fontWeight={900} sx={{ fontSize: '12rem', color: '#fff' }}>TOP SECRET</Typography>
                    </Box>

                    <Typography variant="h3" fontWeight={900} color="#FFD700" sx={{ mb: 3, letterSpacing: 4, textTransform: 'uppercase', textShadow: '0 0 20px rgba(255, 215, 0, 0.5)', zIndex: 2 }}>
                        MISSION COMPLETE 🏁
                    </Typography>

                    <Box sx={{
                        position: 'relative',
                        width: '100%',
                        maxWidth: '800px',
                        mb: 4,
                        animation: 'fadeIn 1s ease-out',
                        zIndex: 2
                    }}>
                        {/* Background & Clipper for Scan Line */}
                        <Box sx={{
                            position: 'absolute',
                            top: 0, left: 0, right: 0, bottom: 0,
                            bgcolor: 'rgba(20, 20, 30, 0.8)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255,255,255,0.15)',
                            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                            borderRadius: 4,
                            overflow: 'hidden', // Clips the scan line
                            zIndex: 0
                        }}>
                            {/* SCANNER LINE ANIMATION */}
                            <Box sx={{
                                position: 'absolute', top: 0, left: 0, width: '100%', height: '5px',
                                background: 'linear-gradient(to right, transparent, #00ffcc, transparent)',
                                boxShadow: '0 0 15px #00ffcc',
                                opacity: 0.7,
                                animation: 'scanLine 3s linear infinite',
                                pointerEvents: 'none'
                            }} />
                        </Box>

                        <Box sx={{
                            position: 'relative',
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: 3,
                            p: 4,
                            zIndex: 1
                        }} className="stats-panel">


                            {/* CASE CLOSED STAMP - HALF OUT */}
                            <Box sx={{
                                position: 'absolute',
                                bottom: '-40px', // Hanging out
                                right: '-30px',   // Hanging out
                                transform: 'rotate(-25deg)',
                                border: '8px solid #D32F2F', // Slightly thinner border for realism
                                color: '#D32F2F',
                                padding: '10px 20px',
                                borderRadius: '12px',
                                opacity: 0,
                                zIndex: 20, // On top of everything
                                textAlign: 'center',
                                mixBlendMode: 'normal', // Normal blend mode to ensure visibility over dark/light boundaries
                                background: 'rgba(211, 47, 47, 0.1)',
                                backdropFilter: 'blur(2px)', // Subtle blur to separate from bg
                                boxShadow: '0 10px 20px rgba(0,0,0,0.3)', // Shadow for 3D "on top" feel
                                animation: 'stampThud 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.8s forwards',
                            }}>
                                <Typography variant="h2" component="div" fontWeight={900} sx={{
                                    lineHeight: 0.9,
                                    fontSize: '5rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '10px',
                                    fontFamily: '"Courier New", Courier, monospace' // Stencil-ish feel
                                }}>
                                    CASE
                                </Typography>
                                <Typography variant="h2" component="div" fontWeight={900} sx={{
                                    lineHeight: 0.9,
                                    fontSize: '5rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '10px',
                                    fontFamily: '"Courier New", Courier, monospace'
                                }}>
                                    CLOSED
                                </Typography>
                                <Typography variant="overline" sx={{ fontSize: '1.2rem', fontWeight: 700, letterSpacing: 4, display: 'block', mt: 1 }}>
                                    {currentYear} • CLASSIFIED
                                </Typography>
                            </Box>


                            {/* Stat Items - High Contrast */}
                            <Box sx={{ animation: 'slideUpFade 0.5s ease-out 0.2s backwards', borderBottom: '1px solid rgba(255,255,255,0.1)', pb: 2 }}>
                                <Typography variant="overline" color="#00ffcc" display="block" sx={{ letterSpacing: 2, fontSize: '0.8rem' }}>ANNUAL ABSENCE</Typography>
                                <Typography variant="h3" fontWeight={800} color="#fff">{data.totalDays} Days</Typography>
                            </Box>
                            <Box sx={{ animation: 'slideUpFade 0.5s ease-out 0.4s backwards', borderBottom: '1px solid rgba(255,255,255,0.1)', pb: 2 }}>
                                <Typography variant="overline" color="#00ffcc" display="block" sx={{ letterSpacing: 2, fontSize: '0.8rem' }}>GLOBAL RANK</Typography>
                                <Typography variant="h3" fontWeight={800} color="#fff">#{data.rank}</Typography>
                                <Typography variant="overline" sx={{ fontSize: '1.2rem', fontWeight: 700, letterSpacing: 4, display: 'block', mt: 1 }}>
                                    {currentYear} • CLASSIFIED
                                </Typography>
                                <Typography variant="body2" color="#aaa" sx={{ mt: 0.5, letterSpacing: 1, textTransform: 'uppercase' }}>{user?.name || user?.username || "Unknown Agent"}</Typography>
                            </Box>

                            <Box sx={{ gridColumn: 'span 2', animation: 'slideUpFade 0.5s ease-out 0.6s backwards', py: 2, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                <Typography variant="overline" color="#00ffcc" display="block" sx={{ letterSpacing: 2, fontSize: '0.8rem' }}>CODENAME / PERSONA</Typography>
                                <Typography variant="h3" fontWeight={800} color="#FFD700" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                                    {data.punctuality.title}
                                </Typography>
                                <Typography variant="body2" color="#aaa" sx={{ mt: 1, fontStyle: 'italic' }}>
                                    "{data.punctuality.reason}"
                                </Typography>
                            </Box>

                            <Box sx={{ animation: 'slideUpFade 0.5s ease-out 1.0s backwards', pt: 2 }}>
                                <Typography variant="overline" color="#00ffcc" display="block" sx={{ letterSpacing: 2, fontSize: '0.8rem' }}>DARK STREAK</Typography>
                                <Typography variant="h4" fontWeight={700} color="#fff">{data.longestStreak} Days</Typography>
                            </Box>
                        </Box> {/* End of Grid Content */}
                    </Box> {/* End of Card Wrapper */}

                    {/* Authorized Signature Footer */}
                    < Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-end', mt: 2, mr: 4 }}>
                        <Box sx={{ textAlign: 'center', opacity: 0.7 }}>
                            <Typography variant="caption" display="block" color="#d71212ff" sx={{ letterSpacing: 2 }}>AUTHORIZED BY</Typography>
                            <Typography variant="h5" sx={{ fontFamily: '"Brush Script MT", cursive', color: '#fff', transform: 'rotate(-5deg)' }}>
                                SN Team
                            </Typography>
                        </Box>
                    </Box >

                    <Box sx={{
                        mt: 4,
                        p: 2,
                        bgcolor: 'rgba(255, 215, 0, 0.1)',
                        border: '1px dashed #FFD700',
                        borderRadius: 2,
                        maxWidth: '600px',
                        animation: 'fadeIn 1s ease 2s backwards'
                    }}>
                        <Typography variant="body1" color="#FFD700" fontStyle="italic" sx={{ fontWeight: 500 }}>
                            "{funnyQuotes[Math.floor(Math.random() * funnyQuotes.length)]}"
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 3, mt: 4 }} id="wrapped-controls">
                        <Button
                            variant="outlined"
                            size="large"
                            sx={{
                                color: '#fff',
                                borderColor: 'rgba(255,255,255,0.5)',
                                fontWeight: 700,
                                fontSize: '1rem',
                                px: 4,
                                py: 1,
                                '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.1)' }
                            }}
                            onClick={onClose}
                        >
                            CLOSE FILE
                        </Button>
                    </Box>
                </Box >
            )
        }
    ];




    const currentSlide = slides[step];
    const currentStyle = bgStyles[step] || bgStyles[0];


    return (
        <Dialog fullScreen open={open} onClose={onClose} TransitionComponent={Transition}>
            <AnimationStyles />
            {showConfetti && step === slides.length - 1 && <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} numberOfPieces={800} gravity={0.3} />}

            {/* Global Close Button */}
            <IconButton
                onClick={(e) => {
                    e.stopPropagation(); // Prevent slide tap
                    onClose();
                }}
                sx={{
                    position: 'fixed',
                    top: 20,
                    left: 20, // Moved to left to avoid Logout overlap
                    color: 'rgba(255,255,255,0.5)',
                    zIndex: 9999,
                    '&:hover': {
                        color: '#fff',
                        bgcolor: 'rgba(255,255,255,0.1)'
                    }
                }}
            >
                <CloseIcon sx={{ fontSize: '2rem' }} />
            </IconButton>

            <Box
                id="wrapped-container" // For html2canvas
                onClick={handleTap}
                sx={{
                    width: '100vw',
                    height: '100vh',
                    overflow: 'hidden', // Prevent scrolling / white bar
                    position: 'fixed', // Lock in place
                    top: 0,
                    left: 0,
                    backgroundSize: '400% 400%',
                    ...currentStyle, // Apply dynamic background
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 4,
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'background 1s ease-in-out',
                    userSelect: 'none'
                }}
            >
                {/* Slide Content with smoother entry animation */}
                <Box
                    key={step}
                    sx={{
                        // Dynamic Animation per Slide Index
                        animation: (() => {
                            switch (step) {
                                case 0: return 'slideUpFade 0.8s ease-out forwards';
                                case 1: return 'particleGather 1.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards'; // Slide 2
                                case 2: return 'rotateIn 0.8s ease-out forwards';
                                case 3: return 'slideRight 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards';
                                case 4: return 'elasticPop 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards';
                                case 5: return 'blurReveal 1s ease-out forwards';
                                case 6: return 'slideUpFade 0.8s ease-out forwards';
                                default: return 'slideUpFade 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards'; // Summary
                            }
                        })(),
                        opacity: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center'
                    }}
                >
                    <style>{`
                        @keyframes slideUpFade {
                            from { opacity: 0; transform: translateY(30px) scale(0.95); }
                            to { opacity: 1; transform: translateY(0) scale(1); }
                        }
                    `}</style>
                    {currentSlide.content}
                </Box>

                <Box id="wrapped-navigation-hint" sx={{ position: 'absolute', bottom: 40, width: '100%', display: 'flex', justifyContent: 'space-between', px: 4, pointerEvents: 'none' }}>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>
                        {step > 0 ? "← PREV" : ""}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>
                        {step < slides.length - 1 ? "NEXT →" : ""}
                    </Typography>
                </Box>
            </Box>
        </Dialog>
    );
};

export default LeaveWrapped;



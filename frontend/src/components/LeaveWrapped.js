import React, { useState, useRef } from 'react';
import { Dialog, Box, Typography, Button, Slide, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useAuth } from '../context/AuthContext';
import { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import Confetti from 'react-confetti';
import CountUp from 'react-countup';

// New Imports
import { useLeaveStats } from '../hooks/useLeaveStats';
import { useWrappedAudio } from '../hooks/useWrappedAudio';
import ScratchCard from './wrapped/ScratchCard';
import SecretReveal from './wrapped/SecretReveal';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const LeaveWrapped = ({ open, onClose }) => {
    const { user } = useAuth();
    const { activeLeaves, employees } = useContext(AppContext);

    // Extracted Logic Hooks
    const data = useLeaveStats(user, activeLeaves, employees);

    const [step, setStep] = useState(0);
    const [showConfetti, setShowConfetti] = useState(false);
    const lastInteractTime = useRef(0);
    const currentYear = new Date().getFullYear();

    // Audio Hook
    useWrappedAudio(open, step);

    const handleScratchEnd = () => {
        lastInteractTime.current = Date.now();
    };

    // Navigation Logic
    const handleTap = (e) => {
        if (e.target.closest('button') || e.target.closest('.interactive')) return;
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

import React, { useState, useEffect } from 'react';
import { Dialog, Box, Typography, Button, Slide } from '@mui/material';
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
                    <Typography variant="caption" sx={{ color: '#fff', bgcolor: 'rgba(0,0,0,0.5)', px: 1, borderRadius: 1 }}>TAP TO DECLASSIFY</Typography>
                </Box>
            )}
        </Box>
    );
};

const LeaveWrapped = ({ open, onClose }) => {
    const { user } = useAuth();
    const { activeLeaves, employees } = useContext(AppContext);
    const [data, setData] = useState(null);
    const [step, setStep] = useState(0);
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        if (open && user && activeLeaves && employees) {
            // Client-side calculation (Single Source of Truth)
            const userName = user.username || user.name;
            const currentYear = new Date().getFullYear(); // or fixed to user selection if needed, but wrapped is usually "This Year"

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

            // --- UNIQUE PERSONA GENERATOR ---
            // Helper to generate a deterministic hash from string
            const stringToHash = (str) => {
                let hash = 0;
                for (let i = 0; i < str.length; i++) {
                    const char = str.charCodeAt(i);
                    hash = ((hash << 5) - hash) + char;
                    hash |= 0; // Convert to 32bit integer
                }
                return Math.abs(hash);
            };

            const userHash = stringToHash(userName);

            // Adjectives List (50+)
            const ADJECTIVES = [
                "Secretive", "Bold", "Calculated", "Mysterious", "Phantom", "Rogue", "Elite", "Shadowy",
                "Tactical", "Strategic", "Silent", "Rapid", "Stealthy", "Grand", "Legendary", "Fabled",
                "Mythic", "Covert", "Undercover", "Diplomatic", "Chaotic", "Serene", "Zen", "Hyper",
                "Lazy", "Efficient", "Precise", "Unpredictable", "Ghostly", "Ethereal", "Cosmic", "Noble",
                "Savage", "Reckless", "Careful", "Diligent", "Masterful", "Supreme", "Ultimate", "Prime",
                "Omega", "Alpha", "Beta", "Sigma", "Director", "Chief", "Executive", "Senior", "Junior"
            ];

            const uniqueAdjective = ADJECTIVES[userHash % ADJECTIVES.length];
            const agentID = (userHash % 900) + 100; // Agent 100-999
            const agentCode = `Agent ${uniqueAdjective} ${agentID}`;

            if (totalDays > 0) {
                let baseTitle = "";
                let baseReason = "";

                if (isTimeTraveler) {
                    baseTitle = "Time Traveler ⏳";
                    baseReason = `You're living in ${nextYear}! Most leaves booked for next Jan (${myNextJanLeaves} days).`;
                } else if (percentPlanned === 100) {
                    baseTitle = "Fortune Teller 🔮";
                    baseReason = "You knew you'd need a break 6 months ago.";
                } else if (percentPlanned >= 80) {
                    baseTitle = "CEO of Calendars 📅";
                    baseReason = "Your schedule is tighter than a drum.";
                } else if (percentPlanned >= 60) {
                    baseTitle = "Responsible Adult 👔";
                    baseReason = "Balanced, orderly, and suspiciously well-adjusted.";
                } else if (percentPlanned >= 40) {
                    baseTitle = "Balance Keeper ⚖️";
                    baseReason = "You keep work and life in perfect harmony.";
                } else if (percentPlanned > 0) {
                    baseTitle = "Structured Chaos 🌪️";
                    baseReason = "You have a plan, even if it changes 5 times.";
                } else {
                    // Refined "Low Planning" Titles
                    const byDay = {};
                    userLeaves.forEach(l => {
                        const d = new Date(l.date);
                        const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
                        byDay[dayName] = (byDay[dayName] || 0) + 1;
                    });

                    const monFriCount = (byDay['Monday'] || 0) + (byDay['Friday'] || 0);
                    const isWeekendWarrior = monFriCount / totalDays > 0.5;

                    if (isWeekendWarrior) {
                        baseTitle = "Long Weekender 🏖️";
                        baseReason = "Mondays and Fridays are just suggestions to you.";
                    } else {
                        baseTitle = "Surprise Guest 🎁";
                        baseReason = "We never know when you're leaving (or coming back).";
                    }
                }

                // COMPOSE UNIQUE TITLE
                // Format: "The [Adjective] [BaseTitle]"
                // Or if it's already long, just append Agent ID. 
                // Let's go with: "The [Adjective] [BaseTitle]"
                punctualityData = {
                    title: `The ${uniqueAdjective} ${baseTitle}`,
                    reason: `${baseReason} (Codename: ${agentCode})`
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

    if (data.error) return (
        <Dialog fullScreen open={open} onClose={onClose} TransitionComponent={Transition}>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', bgcolor: '#1a1a1a', flexDirection: 'column' }}>
                <Typography variant="h4" fontWeight={700} color="#fff">Error Loading Mission</Typography>
                <Button onClick={onClose} variant="contained" sx={{ mt: 2 }}>Close</Button>
            </Box>
        </Dialog>
    );

    // Dynamic backgrounds
    const bgStyles = [
        { background: 'linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)', animation: 'gradientBG 15s ease infinite' }, // 0
        { background: 'radial-gradient(circle at center, #2b5876 0%, #4e4376 100%)' }, // 1 - Clouds/Space feel
        { background: 'linear-gradient(to top, #30cfd0 0%, #330867 100%)' }, // 2
        { background: 'linear-gradient(120deg, #f093fb 0%, #f5576c 100%)' }, // 3
        { background: 'linear-gradient(to right, #43e97b 0%, #38f9d7 100%)' }, // 4 - Calm
        { background: 'linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)', animation: 'gradientBG 15s ease infinite' }, // 5 - Planning/Structured
        { background: 'linear-gradient(to bottom right, #FF512F, #DD2476)' }, // 6 - Utilization
        { background: 'linear-gradient(to right, #8360c3, #2ebf91)' }, // 7 - Message
    ];
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
                    <Typography variant="h3" fontWeight={900} color="#fff" sx={{ textShadow: '0 4px 20px rgba(0,0,0,0.5)', mb: 2 }}>
                        Your 2025
                    </Typography>
                    <Typography variant="h4" color="#fff" sx={{ letterSpacing: 2, fontWeight: 300, mb: 4 }}>
                        LEAVE MISSION REPORT
                    </Typography>
                    <Typography variant="h6" color="#ccc" sx={{ maxWidth: '700px', fontStyle: 'italic', lineHeight: 1.6 }}>
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
            content: (
                <>
                    <Typography variant="h4" color="#fff" sx={{ opacity: 0.9, mb: 6, letterSpacing: 1, fontWeight: 700 }}>Tactical Planning Award</Typography>
                    <Typography variant="h3" fontWeight={800} color="#fff" sx={{ px: 4, lineHeight: 1.4 }}>
                        {data.punctuality.title}
                    </Typography>
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
                    <Typography variant="h4" color="#fff" sx={{ opacity: 0.9, mb: 2, letterSpacing: 1, fontWeight: 700 }}>Resource Depletion (Rank No. {data.rank})</Typography>
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
                        "Hey, don't be surprised—we have spied on you for the last few months exclusively! 😉"
                    </Typography>
                </>
            )
        },
        // Slide 7: Outro / Summary Dashboard
        {
            content: (
                <>
                    <Typography variant="h4" fontWeight={900} color="#FFD700" sx={{ mb: 2, letterSpacing: 2, textTransform: 'uppercase' }}>
                        MISSION COMPLETE 🏁
                    </Typography>

                    <Box sx={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: 3,
                        width: '100%',
                        maxWidth: '800px',
                        mb: 4,
                        p: 3,
                        bgcolor: 'rgba(0,0,0,0.4)',
                        borderRadius: 4,
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        {/* Stat Items */}
                        <Box>
                            <Typography variant="caption" color="#aaa" display="block" mb={0.5}>TOTAL DAYS OFF GRID</Typography>
                            <Typography variant="h3" fontWeight={800} color="#fff">{data.totalDays}</Typography>
                        </Box>
                        <Box>
                            <Typography variant="caption" color="#aaa" display="block" mb={0.5}>GLOBAL RANK</Typography>
                            <Typography variant="h3" fontWeight={800} color="#fff">#{data.rank}</Typography>
                        </Box>
                        <Box sx={{ gridColumn: 'span 2' }}>
                            <Typography variant="caption" color="#aaa" display="block" mb={0.5}>OPERATIVE PERSONA</Typography>
                            <Typography variant="h4" fontWeight={800} color="#43e97b">{data.punctuality.title}</Typography>
                        </Box>
                        <Box>
                            <Typography variant="caption" color="#aaa" display="block" mb={0.5}>TOP ALIBI</Typography>
                            <Typography variant="h5" fontWeight={700} color="#fff">{data.topType}</Typography>
                        </Box>
                        <Box>
                            <Typography variant="caption" color="#aaa" display="block" mb={0.5}>MAX DARK STREAK</Typography>
                            <Typography variant="h5" fontWeight={700} color="#fff">{data.longestStreak} Days</Typography>
                        </Box>
                    </Box>

                    <Box sx={{
                        mb: 5,
                        p: 3,
                        borderLeft: '4px solid #FFD700',
                        bgcolor: 'rgba(255, 215, 0, 0.1)',
                        maxWidth: '700px'
                    }}>
                        <Typography variant="h6" color="#fff" fontStyle="italic" sx={{ opacity: 0.9 }}>
                            "{funnyQuotes[Math.floor(Math.random() * funnyQuotes.length)]}"
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 3 }}>
                        <Button
                            variant="outlined"
                            size="large"
                            sx={{
                                color: '#fff',
                                borderColor: '#fff',
                                fontWeight: 700,
                                fontSize: '1.2rem',
                                px: 4,
                                py: 1.5,
                                '&:hover': { borderColor: '#eee', bgcolor: 'rgba(255,255,255,0.1)' }
                            }}
                            onClick={onClose}
                        >
                            CLOSE FILE
                        </Button>
                    </Box>
                </>
            )
        }
    ];

    const currentSlide = slides[step];
    const currentStyle = bgStyles[step] || bgStyles[0];


    const handleNext = () => {
        if (step < slides.length - 1) {
            setStep(step + 1);
            if (step + 1 === slides.length - 1) setShowConfetti(true);
        }
    };

    return (
        <Dialog fullScreen open={open} onClose={onClose} TransitionComponent={Transition}>
            {showConfetti && step === slides.length - 1 && <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} numberOfPieces={800} gravity={0.3} />}
            <Box
                onClick={step < slides.length - 1 ? handleNext : undefined}
                sx={{
                    width: '100%',
                    height: '100%',
                    backgroundSize: '400% 400%',
                    ...currentStyle, // Apply dynamic background
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 4,
                    cursor: step < slides.length - 1 ? 'pointer' : 'default',
                    textAlign: 'center',
                    transition: 'background 1s ease-in-out' // Smooth transition between styles
                }}
            >
                {/* Slide Content with simple scale-in animation */}
                <Box key={step} sx={{ animation: 'fadeInScale 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards', opacity: 0, transform: 'scale(0.95)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <style>{`
                        @keyframes fadeInScale {
                            from { opacity: 0; transform: scale(0.9); }
                            to { opacity: 1; transform: scale(1); }
                        }
                    `}</style>
                    {currentSlide.content}
                </Box>

                {step < slides.length - 1 && (
                    <Typography variant="caption" sx={{ position: 'absolute', bottom: 40, color: 'rgba(255,255,255,0.6)', fontWeight: 600, letterSpacing: 1 }}>
                        TAP TO CONTINUE ({step + 1}/{slides.length})
                    </Typography>
                )}
            </Box>
        </Dialog>
    );
};

export default LeaveWrapped;


import React, { useContext, useMemo, useState } from 'react';
import { Box, Typography, Avatar, Container, Paper, Tabs, Tab, Tooltip } from '@mui/material';
import { AppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
// import { format } from 'date-fns';

const LeaderboardPage = () => {
    const { leaves, employees } = useContext(AppContext);
    const { user: currentUser } = useAuth();
    const [tab, setTab] = useState(0); // 0 = This Month, 1 = This Year, 2 = Achievements

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date();

    // Motivational Quotes
    const quotes = [
        "Taking leaves actually increases productivity by 30%. Be like the leader.",
        "Work hard, rest harder. The leaderboard proves it.",
        "A well-rested mind is a dangerous weapon. Go charge yours.",
        "The best ideas come while on vacation. Scale the leaderboard!",
        "Don't just chase deadlines, chase destinations."
    ];
    const randomQuote = useMemo(() => quotes[Math.floor(Math.random() * quotes.length)], []);

    const leaderboardData = useMemo(() => {
        // Filter Based on Tab (Only for 0 and 1)
        if (tab === 2) return { sorted: [], max: 0 };

        const filteredLeaves = leaves.filter(l => {
            if (l.status === 'Revoked') return false;
            const d = new Date(l.date);
            if (tab === 0) {
                // Month Check
                return d.getMonth() === currentMonth.getMonth() && d.getFullYear() === currentMonth.getFullYear();
            } else {
                // Year Check
                return d.getFullYear() === currentYear;
            }
        });

        const counts = {};
        employees.forEach(emp => { counts[emp.name] = 0; });

        filteredLeaves.forEach(l => {
            counts[l.employee] = (counts[l.employee] || 0) + 1;
        });

        const sorted = Object.entries(counts)
            .map(([name, count]) => ({ name, count }))
            .filter(item => item.count > 0)
            .sort((a, b) => b.count - a.count);

        const max = sorted.length > 0 ? sorted[0].count : 0;
        return { sorted, max, filteredLeaves };
    }, [leaves, employees, tab, currentMonth, currentYear]);

    // Badge Logic Helper
    const BADGES = [
        // Day Patterns
        { id: 'weekender', icon: '🏖️', name: 'The Weekender', desc: '3+ leaves on Mon/Fri.' },
        { id: 'mon_blues', icon: '🌚', name: 'Monday Blues', desc: 'Missed 3+ Mondays.' },
        { id: 'midweek', icon: '🤪', name: 'Mid-Week Crisis', desc: 'Missed 3+ Tue/Thu.' },
        { id: 'hump', icon: '🐫', name: 'Hump Day Hater', desc: 'Missed 3+ Wednesdays.' },
        { id: 'tgif', icon: '🍻', name: 'TGIF', desc: 'Missed 3+ Fridays.' },
        { id: 'pattern', icon: '🧩', name: 'Pattern Breaker', desc: 'Hit every day of the week.' },

        // Streaks & Count
        { id: 'doubledown', icon: '✌️', name: 'Double Down', desc: 'Took 2 consecutive days.' },
        { id: 'trifecta', icon: '3️⃣', name: 'The Trifecta', desc: 'Took 3 consecutive days.' },
        { id: 'longhauler', icon: '✈️', name: 'Long Hauler', desc: '5+ consecutive days.' },
        { id: 'micro', icon: '🍬', name: 'Micro-Doser', desc: '5+ single-day leaves.' },
        { id: 'min_sprinter', icon: '👟', name: 'Mini Sprinter', desc: '3+ leaves in a month.' },
        { id: 'sprinter', icon: '🏃', name: 'The Sprinter', desc: '5+ leaves in a month.' },

        // Timing
        { id: 'earlybird', icon: '🐦', name: 'Early Bird', desc: 'Leave in first 5 days of month.' },
        { id: 'closer', icon: '🏁', name: 'The Closer', desc: 'Leave in last 5 days of month.' },
        { id: 'quarter', icon: '🍂', name: 'Quarter Master', desc: 'Leave in all 4 quarters.' },
        { id: 'sandwich', icon: '🥪', name: 'The Sandwich', desc: 'Mon & Fri off in same week.' },

        // Seasonal
        { id: 'summer', icon: '☀️', name: 'Summer Lover', desc: '3+ leaves in Jun/Jul/Aug.' },
        { id: 'winter', icon: '❄️', name: 'Winter Hibernator', desc: '3+ leaves in Dec/Jan/Feb.' },
        { id: 'diwali', icon: '🪔', name: 'Festival of Lights', desc: 'Leave during Diwali month.' },
        { id: 'festive', icon: '🎄', name: 'Holiday Spirit', desc: 'Leave in last week of Dec.' },

        // Types & Hygiene
        { id: 'survivor', icon: '🚑', name: 'Survivor', desc: '3+ Sick Leaves.' },
        { id: 'planner', icon: '📅', name: 'Master Planner', desc: '5+ Planned Leaves.' },
        { id: 'chill', icon: '😎', name: 'Chill Pill', desc: '3+ Casual Leaves.' },
        { id: 'cleansheet', icon: '🛡️', name: 'Clean Sheet', desc: '100% Planned (Min 3).' },
        { id: 'centurion', icon: '💯', name: 'The Centurion', desc: '15+ Total Leaves.' }
    ];

    const getBadges = (employeeName, employeeLeaves) => {
        const earned = [];
        const userLeaves = employeeLeaves
            .filter(l => l.employee === employeeName && l.status !== 'Revoked')
            .sort((a, b) => new Date(a.date) - new Date(b.date)); // Sort by date

        if (userLeaves.length === 0) return earned;

        const total = userLeaves.length;
        const leaveDates = userLeaves.map(l => new Date(l.date));

        // --- WEEKDAY ANALYSIS ---
        const weekdays = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 }; // 0=Sun
        leaveDates.forEach(d => weekdays[d.getDay()]++);

        if (weekdays[1] + weekdays[5] >= 3) earned.push(BADGES.find(b => b.id === 'weekender'));
        if (weekdays[1] >= 3) earned.push(BADGES.find(b => b.id === 'mon_blues'));
        if (weekdays[2] + weekdays[4] >= 3) earned.push(BADGES.find(b => b.id === 'midweek')); // Tue/Thu
        if (weekdays[3] >= 3) earned.push(BADGES.find(b => b.id === 'hump'));
        if (weekdays[5] >= 3) earned.push(BADGES.find(b => b.id === 'tgif'));
        if (weekdays[1] > 0 && weekdays[2] > 0 && weekdays[3] > 0 && weekdays[4] > 0 && weekdays[5] > 0) {
            earned.push(BADGES.find(b => b.id === 'pattern'));
        }

        // --- TIMING & SEASONAL ---
        if (leaveDates.some(d => d.getDate() <= 5)) earned.push(BADGES.find(b => b.id === 'earlybird'));
        if (leaveDates.some(d => d.getDate() >= 25)) earned.push(BADGES.find(b => b.id === 'closer'));

        const quarters = { 1: 0, 2: 0, 3: 0, 4: 0 };
        leaveDates.forEach(d => {
            const m = d.getMonth();
            if (m <= 2) quarters[1]++; else if (m <= 5) quarters[2]++; else if (m <= 8) quarters[3]++; else quarters[4]++;
        });
        if (quarters[1] > 0 && quarters[2] > 0 && quarters[3] > 0 && quarters[4] > 0) earned.push(BADGES.find(b => b.id === 'quarter'));

        const summerCount = leaveDates.filter(d => [5, 6, 7].includes(d.getMonth())).length;
        if (summerCount >= 3) earned.push(BADGES.find(b => b.id === 'summer'));

        const winterCount = leaveDates.filter(d => [11, 0, 1].includes(d.getMonth())).length;
        if (winterCount >= 3) earned.push(BADGES.find(b => b.id === 'winter'));

        // Diwali Check (Oct/Nov generic coverage)
        if (leaveDates.some(d => d.getMonth() === 9 || d.getMonth() === 10)) earned.push(BADGES.find(b => b.id === 'diwali'));

        if (leaveDates.some(d => d.getMonth() === 11 && d.getDate() >= 25)) earned.push(BADGES.find(b => b.id === 'festive'));

        // --- CONSECUTIVE & SANDWICH ---
        let maxStreak = 0;
        let currentStreak = 1;
        let singleDays = 0;
        let hasSandwich = false;

        // Sandwich Check (Mon & Fri in same week)
        const weeks = {}; // key: year-week
        leaveDates.forEach(d => {
            const start = new Date(d);
            start.setDate(start.getDate() - start.getDay() + 1); // Get Monday
            const key = start.toISOString().split('T')[0];
            if (!weeks[key]) weeks[key] = new Set();
            weeks[key].add(d.getDay());
        });
        Object.values(weeks).forEach(days => {
            if (days.has(1) && days.has(5)) hasSandwich = true;
        });
        if (hasSandwich) earned.push(BADGES.find(b => b.id === 'sandwich'));

        // Consecutive Logic
        for (let i = 0; i < leaveDates.length; i++) {
            if (i > 0) {
                const diffTime = Math.abs(leaveDates[i] - leaveDates[i - 1]);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays === 1) currentStreak++;
                else currentStreak = 1;
            }
            if (currentStreak > maxStreak) maxStreak = currentStreak;
        }

        // Single Days
        leaveDates.forEach(d => {
            const hasPrev = leaveDates.some(other => (d - other) === 86400000);
            const hasNext = leaveDates.some(other => (other - d) === 86400000);
            if (!hasPrev && !hasNext) singleDays++;
        });

        if (maxStreak >= 2) earned.push(BADGES.find(b => b.id === 'doubledown'));
        if (maxStreak >= 3) earned.push(BADGES.find(b => b.id === 'trifecta'));
        if (maxStreak >= 5) earned.push(BADGES.find(b => b.id === 'longhauler'));
        if (singleDays >= 5) earned.push(BADGES.find(b => b.id === 'micro'));

        // --- GENERIC ---
        const sick = userLeaves.filter(l => l.type === 'Sick').length;
        const planned = userLeaves.filter(l => l.type === 'Planned').length;
        const casual = userLeaves.filter(l => l.type === 'Casual').length;

        if (sick >= 3) earned.push(BADGES.find(b => b.id === 'survivor'));
        if (planned >= 5) earned.push(BADGES.find(b => b.id === 'planner'));
        if (casual >= 3) earned.push(BADGES.find(b => b.id === 'chill'));
        if (total >= 3 && planned === total) earned.push(BADGES.find(b => b.id === 'cleansheet'));
        if (total > 15) earned.push(BADGES.find(b => b.id === 'centurion'));

        // Sprinter
        const monthCounts = {};
        leaveDates.forEach(d => {
            const k = `${d.getFullYear()}-${d.getMonth()}`;
            monthCounts[k] = (monthCounts[k] || 0) + 1;
        });
        if (Object.values(monthCounts).some(c => c >= 3)) earned.push(BADGES.find(b => b.id === 'min_sprinter'));
        if (Object.values(monthCounts).some(c => c >= 5)) earned.push(BADGES.find(b => b.id === 'sprinter'));

        return earned;
    };

    // Helper for Achievements Tab
    const myBadges = useMemo(() => {
        if (!currentUser) return [];
        // Filter leaves for Current Year Only (Reset on Jan 1)
        const currentYearLeaves = leaves.filter(l => new Date(l.date).getFullYear() === currentYear);
        return getBadges(currentUser.username, currentYearLeaves);
    }, [currentUser, leaves, currentYear]);

    // Avatar Color Helper
    const stringToColor = (string) => {
        let hash = 0;
        for (let i = 0; i < string.length; i++) {
            hash = string.charCodeAt(i) + ((hash << 5) - hash);
        }
        let color = '#';
        for (let i = 0; i < 3; i++) {
            const value = (hash >> (i * 8)) & 0xFF;
            color += ('00' + value.toString(16)).substr(-2);
        }
        return color;
    }

    return (
        <Box sx={{
            minHeight: '100vh',
            pt: 4,
            pb: 8,
            px: 2,
            background: 'transparent',
            color: '#1a237e',
            fontFamily: 'Inter, sans-serif'
        }}>
            <Container maxWidth="lg">
                {/* Hero Section */}
                <Box sx={{ textAlign: 'center', mb: 6, animation: 'fadeInDown 0.8s ease' }}>
                    <Typography variant="h2" sx={{ fontWeight: 900, mb: 2, color: '#2c3e50', textShadow: '0 4px 10px rgba(255,255,255,0.5)' }}>
                        🏆 Wall of Fame
                    </Typography>
                    <Typography variant="h5" sx={{ color: '#455a64', fontWeight: 600, fontStyle: 'italic', mb: 1 }}>
                        &quot;{randomQuote}&quot;
                    </Typography>
                </Box>

                <style>{`
                    @keyframes fadeInDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
                    @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                `}</style>

                {/* Tabs */}
                <Paper sx={{
                    borderRadius: 4,
                    mb: 4,
                    bgcolor: 'rgba(255,255,255,0.3)',
                    backdropFilter: 'blur(10px)',
                    overflow: 'hidden',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                    maxWidth: 600,
                    mx: 'auto'
                }}>
                    <Tabs
                        value={tab}
                        onChange={(e, v) => setTab(v)}
                        centered
                        variant="fullWidth"
                        TabIndicatorProps={{ sx: { bgcolor: '#2c3e50', height: 3 } }}
                        sx={{
                            '& .MuiTab-root': { color: '#546e7a', fontWeight: 700, fontSize: '1rem' },
                            '& .Mui-selected': { color: '#1a237e !important' }
                        }}
                    >
                        <Tab label="Monthly" />
                        <Tab label="Yearly" />
                        <Tab label="Achievements 🎖️" />
                    </Tabs>
                </Paper>

                {/* ACHIEVEMENTS TAB */}
                {tab === 2 ? (
                    <Box>
                        <Typography variant="h5" fontWeight={800} sx={{ mb: 3, textAlign: 'center', color: '#2c3e50' }}>
                            Your Trophy Cabinet ({myBadges.length}/{BADGES.length})
                        </Typography>
                        {/* CSS GRID FOR 5 COLUMNS */}
                        <Box sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)', lg: 'repeat(5, 1fr)' },
                            gap: 2
                        }}>
                            {BADGES.map((badge, index) => {
                                const isUnlocked = myBadges.find(b => b.id === badge.id);

                                return (
                                    <Box key={badge.id} sx={{
                                        p: 2,
                                        height: '100%',
                                        borderRadius: 4,
                                        bgcolor: isUnlocked ? 'rgba(255, 255, 255, 0.85)' : 'rgba(255, 255, 255, 0.4)',
                                        border: isUnlocked ? '2px solid #FFD700' : '1px solid rgba(0,0,0,0.05)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        textAlign: 'center',
                                        gap: 1,
                                        opacity: isUnlocked ? 1 : 0.7,
                                        filter: isUnlocked ? 'none' : 'grayscale(100%)',
                                        transform: isUnlocked ? 'scale(1.02)' : 'none',
                                        transition: 'all 0.3s ease',
                                        boxShadow: isUnlocked ? '0 8px 20px rgba(255, 215, 0, 0.25)' : 'none',
                                        animation: `fadeInUp 0.5s ease backwards ${index * 0.05}s`
                                    }}>
                                        <Box sx={{ fontSize: '2.5rem', mb: 1 }}>{badge.icon}</Box>
                                        <Typography variant="body1" fontWeight={800} color={isUnlocked ? '#2c3e50' : '#78909c'} sx={{ lineHeight: 1.2 }}>
                                            {badge.name}
                                        </Typography>
                                        <Typography variant="caption" color={isUnlocked ? '#455a64' : '#90a4ae'} fontWeight={500} sx={{ flex: 1 }}>
                                            {badge.desc}
                                        </Typography>
                                        {isUnlocked ? (
                                            <Box sx={{ mt: 'auto', py: 0.5, px: 2, borderRadius: 10, bgcolor: '#e8f5e9', color: '#2e7d32', fontWeight: 800, fontSize: '0.7rem' }}>
                                                UNLOCKED
                                            </Box>
                                        ) : (
                                            <Box sx={{ mt: 'auto', py: 0.5, px: 2, borderRadius: 10, bgcolor: '#eceff1', color: '#b0bec5', fontWeight: 700, fontSize: '0.7rem' }}>
                                                LOCKED
                                            </Box>
                                        )}
                                    </Box>
                                );
                            })}
                        </Box>
                    </Box>
                ) : (
                    /* LEADERBOARD LIST (Monthly/Yearly) */
                    <Container maxWidth="md">
                        {/* YEARLY LOCKED STATE (Only viewable in December) */}
                        {
                            tab === 1 && currentMonth.getMonth() !== 11 ? (
                                <Box sx={{
                                    textAlign: 'center',
                                    py: 10,
                                    px: 4,
                                    bgcolor: 'rgba(255,255,255,0.25)',
                                    backdropFilter: 'blur(4px)',
                                    borderRadius: 8,
                                    border: '2px dashed rgba(0,0,0,0.1)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: 3
                                }}>
                                    <Box sx={{ fontSize: '4rem', filter: 'grayscale(100%) opacity(0.5)' }}>🔒</Box>
                                    <Typography variant="h5" fontWeight={800} color="#546e7a">
                                        Yearly Leaderboard is Locked
                                    </Typography>
                                    <Typography variant="body1" sx={{
                                        fontStyle: 'italic',
                                        color: '#78909c',
                                        fontWeight: 600,
                                        maxWidth: 400,
                                        lineHeight: 1.6
                                    }}>
                                        &quot;{[
                                            "Don't rush, you still have time.",
                                            "History is written in December.",
                                            "Too early to call the winner. Pace yourself!",
                                            "Great things take time. Wait for the grand finale.",
                                            "The year isn't over yet. Keep counting!",
                                            "Legends are revealed at the finish line."
                                        ][Math.floor(Math.random() * 6)]}&quot;
                                    </Typography>
                                    <Box sx={{
                                        mt: 2,
                                        py: 0.5,
                                        px: 2,
                                        borderRadius: 4,
                                        bgcolor: '#eceff1',
                                        color: '#b0bec5',
                                        fontSize: '0.8rem',
                                        fontWeight: 700
                                    }}>
                                        UNLOCKS IN DECEMBER
                                    </Box>
                                </Box>
                            ) : (
                                /* NORMAL LIST (Monthly limits applied) */
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    {(() => {
                                        // Logic for Monthly Limits (Top 3 only until 25th)
                                        const isMonthly = tab === 0;
                                        const dayOfMonth = new Date().getDate();
                                        const isLastWeek = dayOfMonth >= 25;

                                        let displayList = leaderboardData.sorted;
                                        let hiddenCount = 0;

                                        if (isMonthly && !isLastWeek) {
                                            displayList = leaderboardData.sorted.slice(0, 3);
                                            hiddenCount = leaderboardData.sorted.length - 3;
                                        }

                                        return (
                                            <>
                                                {displayList.map((user, index) => {
                                                    const isLeader = index === 0;
                                                    const gapToLeader = isLeader ? 0 : leaderboardData.max - user.count;
                                                    // Pass filtered leaves (Month/Year) so badges match the current view criteria
                                                    const userBadges = getBadges(user.name, leaderboardData.filteredLeaves);

                                                    return (
                                                        <Box key={user.name} sx={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            p: 2,
                                                            borderRadius: 4,
                                                            bgcolor: isLeader ? 'rgba(255, 215, 0, 0.25)' : 'rgba(255,255,255,0.4)',
                                                            border: isLeader ? '2px solid #FFD700' : '1px solid rgba(255,255,255,0.5)',
                                                            position: 'relative',
                                                            animation: `fadeInUp 0.5s ease backwards ${index * 0.1}s`,
                                                            backdropFilter: 'blur(10px)',
                                                            transition: 'transform 0.2s',
                                                            '&:hover': { transform: 'scale(1.01)', bgcolor: 'rgba(255,255,255,0.6)' },
                                                            boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
                                                        }}>
                                                            {/* Rank */}
                                                            <Box sx={{
                                                                width: 50,
                                                                textAlign: 'center',
                                                                fontWeight: 900,
                                                                fontSize: '1.5rem',
                                                                color: isLeader ? '#b8860b' : index < 3 ? '#546e7a' : '#78909c'
                                                            }}>
                                                                {isLeader ? '👑' : `#${index + 1}`}
                                                            </Box>

                                                            {/* Avatar */}
                                                            <Avatar sx={{
                                                                width: 56,
                                                                height: 56,
                                                                mx: 2,
                                                                bgcolor: stringToColor(user.name),
                                                                fontWeight: 700,
                                                                border: '2px solid rgba(255,255,255,0.8)',
                                                                color: '#fff'
                                                            }}>
                                                                {user.name.charAt(0)}
                                                            </Avatar>

                                                            {/* Info */}
                                                            <Box sx={{ flex: 1 }}>
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                    <Typography variant="h6" fontWeight={800} sx={{ color: '#263238' }}>
                                                                        {user.name}
                                                                    </Typography>

                                                                    {/* Badges Row */}
                                                                    <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                                                                        {userBadges.slice(0, 4).map((badge, i) => (
                                                                            <Tooltip key={i} title={`${badge.name}: ${badge.desc}`} arrow>
                                                                                <div style={{ cursor: 'help', fontSize: '1.2rem' }}>
                                                                                    {badge.icon}
                                                                                </div>
                                                                            </Tooltip>
                                                                        ))}
                                                                        {userBadges.length > 4 && (
                                                                            <Tooltip
                                                                                arrow
                                                                                title={
                                                                                    <Box sx={{ textAlign: 'center' }}>
                                                                                        {userBadges.slice(4).map((b, i) => (
                                                                                            <Typography key={i} variant="caption" display="block" sx={{ fontSize: '0.75rem' }}>
                                                                                                {b.icon} {b.name}
                                                                                            </Typography>
                                                                                        ))}
                                                                                    </Box>
                                                                                }
                                                                            >
                                                                                <Box sx={{
                                                                                    bgcolor: 'rgba(0,0,0,0.05)',
                                                                                    borderRadius: 10,
                                                                                    px: 0.8,
                                                                                    py: 0.2,
                                                                                    fontSize: '0.75rem',
                                                                                    fontWeight: 700,
                                                                                    color: '#546e7a',
                                                                                    cursor: 'pointer',
                                                                                    border: '1px solid rgba(0,0,0,0.1)',
                                                                                    '&:hover': { bgcolor: 'rgba(0,0,0,0.1)' }
                                                                                }}>
                                                                                    +{userBadges.length - 4}
                                                                                </Box>
                                                                            </Tooltip>
                                                                        )}
                                                                    </Box>
                                                                </Box>

                                                                {!isLeader && (
                                                                    <Typography variant="caption" sx={{ color: '#546e7a', display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 600 }}>
                                                                        🚀 Needs <span style={{ color: '#d84315', fontWeight: 800 }}>{gapToLeader}</span> more days to catch #1
                                                                    </Typography>
                                                                )}
                                                                {isLeader && (
                                                                    <Typography variant="caption" sx={{ color: '#f57f17', fontWeight: 800 }}>
                                                                        The Reigning Champion 🏆
                                                                    </Typography>
                                                                )}
                                                            </Box>

                                                            {/* Count Badge */}
                                                            <Box sx={{ textAlign: 'right', zIndex: 2 }}>
                                                                <Typography variant="h4" fontWeight={900} sx={{ color: isLeader ? '#f57f17' : '#1a237e' }}>
                                                                    {user.count}
                                                                </Typography>
                                                                <Typography variant="caption" sx={{ opacity: 0.8, textTransform: 'uppercase', letterSpacing: 1, color: '#455a64', fontWeight: 700 }}>
                                                                    DAYS OFF
                                                                </Typography>
                                                            </Box>

                                                            {/* Progress Bar Background */}
                                                            <Box sx={{
                                                                position: 'absolute', left: 0, bottom: 0, height: 4,
                                                                width: `${(user.count / leaderboardData.max) * 100}%`,
                                                                bgcolor: isLeader ? '#fbc02d' : '#3949ab',
                                                                opacity: 0.5
                                                            }} />
                                                        </Box>
                                                    );
                                                })}

                                                {/* Hidden Users Message (if any) */}
                                                {hiddenCount > 0 && (
                                                    <Box sx={{
                                                        textAlign: 'center',
                                                        p: 3,
                                                        mx: 4,
                                                        bgcolor: 'rgba(255,255,255,0.4)',
                                                        borderRadius: 4,
                                                        border: '1px dashed rgba(0,0,0,0.1)',
                                                        color: '#546e7a'
                                                    }}>
                                                        <Typography variant="h6" fontWeight={700}>
                                                            🕵️ And {hiddenCount} others...
                                                        </Typography>
                                                        <Typography variant="caption" fontWeight={600}>
                                                            The full list reveals on the 25th of the month!
                                                        </Typography>
                                                    </Box>
                                                )}
                                            </>
                                        );
                                    })()}

                                    {leaderboardData.sorted.length === 0 && (
                                        <Box sx={{ textAlign: 'center', py: 8, opacity: 0.6, color: '#37474f' }}>
                                            <Typography variant="h5" fontWeight={700}>No leaves taken yet...</Typography>
                                            <Typography>Be the first to claim the throne!</Typography>
                                        </Box>
                                    )}
                                </Box>
                            )}
                    </Container>
                )}
            </Container>
        </Box >
    );
};

export default LeaderboardPage;

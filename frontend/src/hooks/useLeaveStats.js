import { useMemo } from 'react';

export const useLeaveStats = (user, activeLeaves, employees) => {
    return useMemo(() => {
        if (!user || !activeLeaves || !employees) return null;

        const userName = user.name || user.username;
        const currentYear = new Date().getFullYear();
        const entitlement = 36; // Could be passed as prop or config

        // Filter for THIS user and THIS year
        const userLeaves = activeLeaves.filter(l => {
            const d = new Date(l.date);
            return l.employee === userName && d.getFullYear() === currentYear && l.status !== 'Revoked';
        });

        // Calculate Rank (Global Leaderboard)
        const leaderboard = employees.map(emp => {
            const count = activeLeaves.filter(l => {
                const d = new Date(l.date);
                return l.employee === emp.name && d.getFullYear() === currentYear && l.status !== 'Revoked';
            }).length;
            return { name: emp.name, count };
        });

        // Sort descending (Highest leaves = Rank 1)
        leaderboard.sort((a, b) => b.count - a.count);

        // Find my rank (1-based index)
        const myRankIndex = leaderboard.findIndex(item => item.name === userName);
        const rank = myRankIndex !== -1 ? myRankIndex + 1 : 'N/A';

        if (userLeaves.length === 0) {
            return {
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
            };
        }

        // Calculation Logic
        // 1. Total Days
        const totalDays = userLeaves.length;

        // 2. Top Type & Peak Month & Advance Booking
        const byType = {};
        const byMonth = {};
        // let advanceBookingCount = 0;

        userLeaves.forEach(l => {
            // Type
            byType[l.type] = (byType[l.type] || 0) + 1;

            // Month
            const d = new Date(l.date);
            const m = d.toLocaleString('default', { month: 'long' });
            byMonth[m] = (byMonth[m] || 0) + 1;

            // Advance (Simplified: Planned = Advance)
            // if (l.type === 'Planned') advanceBookingCount++;
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

        // 5. Utilization
        const utilization = Math.min(Math.round((totalDays / entitlement) * 100), 100);
        let utilizationTitle = "Saving for a Rainy Day";
        if (utilization > 90) utilizationTitle = "The Leave Master (Apex Tier)";
        else if (utilization > 75) utilizationTitle = "The Max Utilizer Award";


        // --- TIME TRAVELER LOGIC ---
        const nextYear = currentYear + 1;

        // --- GLOBAL UNIQUE PERSONA GENERATOR ---
        // 1. Calculate stats for ALL employees to find "Best Fits"
        const allUserStats = employees.map(emp => {
            const empLeaves = activeLeaves.filter(l => {
                const d = new Date(l.date);
                return l.employee === emp.name && d.getFullYear() === currentYear && l.status !== 'Revoked';
            });

            const total = empLeaves.length;

            // Helper Counts
            let planned = 0, sick = 0, casual = 0;
            let mon = 0, fri = 0, tueWedThu = 0;
            let nextYearJan = 0;

            // Month Clumping
            const byMonthEmp = {};
            let maxMonthCountEmp = 0;
            // let maxMonthNameEmp = "";

            const sortedDatesEmp = empLeaves.map(l => new Date(l.date).getTime()).sort((a, b) => a - b);
            let longestStreakEmp = sortedDatesEmp.length > 0 ? 1 : 0;
            let currStreakEmp = 1;
            for (let i = 1; i < sortedDatesEmp.length; i++) {
                const diff = Math.round((sortedDatesEmp[i] - sortedDatesEmp[i - 1]) / (1000 * 60 * 60 * 24));
                if (diff === 1) currStreakEmp++;
                else { if (currStreakEmp > longestStreakEmp) longestStreakEmp = currStreakEmp; currStreakEmp = 1; }
            }
            if (currStreakEmp > longestStreakEmp) longestStreakEmp = currStreakEmp;


            empLeaves.forEach(l => {
                if (l.type === 'Planned') planned++;
                if (l.type === 'Sick') sick++;
                if (l.type === 'Casual') casual++;

                const d = new Date(l.date);
                const day = d.getDay(); // 0=Sun, 1=Mon...
                if (day === 1) mon++;
                if (day === 5) fri++;
                if (day >= 2 && day <= 4) tueWedThu++;

                // Check Next Year
                if (d.getFullYear() === nextYear && d.getMonth() === 0) nextYearJan++;

                // Month Clumping
                const mName = d.toLocaleString('default', { month: 'long' });
                byMonthEmp[mName] = (byMonthEmp[mName] || 0) + 1;
                if (byMonthEmp[mName] > maxMonthCountEmp) {
                    maxMonthCountEmp = byMonthEmp[mName];
                    // maxMonthNameEmp = mName;
                }
            });

            return {
                name: emp.name,
                total,
                planned, sick, casual,
                mon, fri, tueWedThu,
                nextYearJan,
                longestStreak: longestStreakEmp,
                maxMonthCount: maxMonthCountEmp,
                utilization: (total / entitlement) * 100
            };
        }).sort((a, b) => a.name.localeCompare(b.name)); // Deterministic Order


        // 2. Define Personas & Criteria (Priority Order)
        const PERSONAS = [
            {
                title: "The Time Traveler ⏳",
                description: "Living in 2026. Booked leaves before the calendar was even printed.",
                criteria: (s) => s.nextYearJan * 100
            },
            {
                title: "The Ghost 👻",
                description: "We checked the records. Do you even work here? (0 Leaves taken)",
                criteria: (s) => s.total === 0 ? 1000 : 0
            },
            {
                title: "The Max Out King 👑",
                description: "You paid for the whole leave balance, you're gonna use the whole leave balance.",
                criteria: (s) => s.utilization
            },
            {
                title: "The Sick Day CEO 🤒",
                description: "Cough cough. I think I'm coming down with... a 3-day weekend.",
                criteria: (s) => s.sick
            },
            {
                title: "The Monday Evader ☕",
                description: "Monday Blues? You've never heard of them.",
                criteria: (s) => s.total > 2 ? (s.mon * s.mon) / s.total : 0
            },
            {
                title: "The Friday Escape Artist 🏃",
                description: "Your weekend starts on Thursday at 5:00 PM sharp.",
                criteria: (s) => s.total > 2 ? (s.fri * s.fri) / s.total : 0
            },
            {
                title: "The Long Weekender 🏖️",
                description: "3-day weekends are your religion.",
                criteria: (s) => {
                    const count = s.mon + s.fri;
                    return s.total > 2 ? (count * count) / s.total : 0;
                }
            },
            {
                title: "The Marathon Runner 🏃‍♂️",
                description: `Disappeared for ${longestStreak} days. We almost sent a search party.`,
                criteria: (s) => s.longestStreak
            },
            {
                title: "The Micro-Doser 💊",
                description: "You take leaves in sprinkle form. A day here, a day there.",
                criteria: (s) => (s.longestStreak === 1 ? s.total : 0)
            },
            {
                title: "The Fortune Teller 🔮",
                description: "You planned this headache 6 months ago.",
                criteria: (s) => s.total > 2 ? (s.planned * s.planned) / s.total : 0
            },
            {
                title: "The Last Minute Legend ⚡",
                description: "Plans? Where we're going, we don't need plans.",
                criteria: (s) => s.total > 2 ? (s.casual * s.casual) / s.total : 0
            },
            {
                title: "The Hump Day Hero 🐫",
                description: "Breaking up the week like a pro. Who needs momentum?",
                criteria: (s) => s.total > 2 ? (s.tueWedThu * s.tueWedThu) / s.total : 0
            },
            {
                title: "The Seasonal Migrator 🍂",
                description: "You basically hibernate in one specific month.",
                criteria: (s) => s.total > 2 ? (s.maxMonthCount * s.maxMonthCount) / s.total : 0
            },
            {
                title: "The Bank Hoarder 💰",
                description: "Saving leaves for the apocalypse? usage is low.",
                criteria: (s) => (s.total > 0 && s.total < 10) ? (100 - s.utilization) : 0
            },
            {
                title: "The Calculated Risk 🧮",
                description: "Maximizing holiday overlap with mathematical precision.",
                criteria: (s) => (s.name.charCodeAt(0) % 10)
            },
            {
                title: "The Average Joe ☕",
                description: "Remarkably statistically average. You are the control group.",
                criteria: (s) => s.total >= 5 && s.total <= 20 ? 50 : 0
            },
            {
                title: "The Deep Sleeper 🛌",
                description: "Silent, steady, and completely under the radar.",
                criteria: (s) => s.total > 0 && s.total < 5 ? 20 : 0
            },
            {
                title: "The Mystery 🕵️‍♂️",
                description: "We have data on you, but it refuses to fit a pattern.",
                criteria: (s) => (s.name.length % 2 === 0) ? 10 : 0
            },
            {
                title: "The NPC 🤖",
                description: "Just doing your job, living your life. Respect.",
                criteria: (s) => (s.name.length % 2 !== 0) ? 10 : 0
            },
            {
                title: "The Wildcard 🃏",
                description: "Your leave pattern is so chaotic, even the AI gave up.",
                criteria: () => 1
            }
        ];

        // 3. Assignment Algorithm (Greedy Best Fit)
        const assignments = {};
        const assignedUsers = new Set();

        PERSONAS.forEach(persona => {
            let bestCandidate = null;
            let maxScore = -1;

            allUserStats.forEach(stat => {
                if (assignedUsers.has(stat.name)) return;

                const score = persona.criteria(stat);
                if (score > maxScore) {
                    maxScore = score;
                    bestCandidate = stat;
                }
            });

            if (bestCandidate && maxScore > 0) {
                assignments[bestCandidate.name] = {
                    title: persona.title,
                    reason: persona.description.replace('${longestStreak}', bestCandidate.longestStreak)
                };
                assignedUsers.add(bestCandidate.name);
            }
        });

        // 4. Fill gaps
        allUserStats.forEach(stat => {
            if (!assignedUsers.has(stat.name)) {
                assignments[stat.name] = {
                    title: `Agent ${stat.name.split(' ')[0]} 🕵️`,
                    reason: "Operative dossier classified. (Unassigned Pattern)"
                };
            }
        });

        // 5. Select MY Persona
        const punctualityData = assignments[userName] || {
            title: "The Unassigned 🤷",
            reason: "System could not determine a profile."
        };

        const message = "Take more leaves!";

        return {
            totalDays,
            topType,
            longestStreak,
            message,
            punctuality: punctualityData,
            peakMonth,
            peakMonthTitle: "The Month You Peaced Out",
            utilization,
            utilizationTitle,
            rank
        };

    }, [user, activeLeaves, employees]);
};

const Leave = require('../models/Leave');
const Employee = require('../models/Employee');
const { startOfMonth, endOfMonth, startOfYear, endOfYear, format, differenceInDays } = require('date-fns');

// Helper to filter active leaves
const isActive = (leave) => leave.status === 'Active';

exports.getTopLeavers = async (req, res) => {
    try {
        const { month, year } = req.query;
        const currentYear = parseInt(year) || new Date().getFullYear();
        const currentMonth = month ? parseInt(month) : new Date().getMonth();

        // Define date range
        const start = startOfMonth(new Date(currentYear, currentMonth));
        const end = endOfMonth(new Date(currentYear, currentMonth));

        // Fetch leaves within range
        const allLeaves = await Leave.find();

        // Filter in JS for simplicity (dates are stored as ISO strings)
        const activeLeaves = allLeaves.filter(l => {
            if (!isActive(l)) return false;
            const d = new Date(l.date);
            return d >= start && d <= end;
        });

        // Aggregate by employee
        const stats = {};
        activeLeaves.forEach(l => {
            if (!stats[l.employee]) {
                stats[l.employee] = { name: l.employee, totalDays: 0, byType: {} };
            }
            stats[l.employee].totalDays += 1;
            stats[l.employee].byType[l.type] = (stats[l.employee].byType[l.type] || 0) + 1;
        });

        // Determine top leave type for each
        const result = Object.values(stats).map(emp => {
            let topType = 'N/A';
            let maxCount = 0;
            for (const [type, count] of Object.entries(emp.byType)) {
                if (count > maxCount) {
                    maxCount = count;
                    topType = type;
                }
            }
            return {
                name: emp.name,
                totalDays: emp.totalDays,
                topType
            };
        });

        // Sort by totalDays descending
        result.sort((a, b) => b.totalDays - a.totalDays);

        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getLeaveWrapped = async (req, res) => {
    try {
        const { employeeName, year } = req.query;
        if (!employeeName) return res.status(400).json({ error: 'employeeName is required' });

        const currentYear = parseInt(year) || new Date().getFullYear();

        // STRICT Single Source of Truth: Fetch from DB without timeout/mock fallback
        // Matches AppContext logic: status !== "Revoked"
        const allLeaves = await Leave.find({ employee: employeeName });

        // Filter for year and active status (Active/Approved)
        const yearLeaves = allLeaves.filter(l => {
            const d = new Date(l.date);
            return l.status !== 'Revoked' && d.getFullYear() === currentYear;
        });

        if (yearLeaves.length === 0) {
            return res.json({
                totalDays: 0,
                topType: 'Workaholic',
                longestStreak: 0,
                message: "The Iron Man (0 Days Off!)",
                punctuality: "N/A",
                peakMonth: "N/A",
                peakMonthTitle: "No Sabbatical",
                utilization: 0,
                utilizationTitle: "Freshman"
            });
        }

        // 1. Total Days & Top Type
        let totalDays = yearLeaves.length;
        const byType = {};
        const byMonth = {};
        let advanceBookingCount = 0;

        yearLeaves.forEach(l => {
            // Type
            byType[l.type] = (byType[l.type] || 0) + 1;

            // Month
            const d = new Date(l.date);
            const m = d.toLocaleString('default', { month: 'long' });
            byMonth[m] = (byMonth[m] || 0) + 1;

            // Punctuality: assume created date is roughly roughly known or check gap
            // Since we don't have 'createdAt' easily on all records, we'll mock logic or use a simpler metric if missing.
            // For now, let's treat Planned as advance.
            if (l.type === 'Planned') advanceBookingCount++;
        });

        let topType = 'Planned';
        let maxCount = 0;
        for (const [type, count] of Object.entries(byType)) {
            if (count > maxCount) {
                maxCount = count;
                topType = type;
            }
        }

        // 2. Longest Streak
        const sortedDates = yearLeaves
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

        // 3. Peak Month
        let peakMonth = 'N/A';
        let peakMonthCount = 0;
        for (const [m, count] of Object.entries(byMonth)) {
            if (count > peakMonthCount) {
                peakMonthCount = count;
                peakMonth = m;
            }
        }

        // 4. Punctuality Title
        // If > 50% leaves are Planned => Prophet of PTO
        const percentPlanned = (advanceBookingCount / totalDays) * 100;
        let punctuality = "Spontaneous Spirit";
        if (percentPlanned > 80) punctuality = "The Prophet of PTO (Top 10% of Planners)";
        else if (percentPlanned > 50) punctuality = "The Advance Planner";

        // 5. Utilization (Assuming 20 days entitlement)
        const entitlement = 20;
        const utilization = Math.min(Math.round((totalDays / entitlement) * 100), 100);
        let utilizationTitle = "Saving for a Rainy Day";
        if (utilization > 90) utilizationTitle = "The Leave Master (Apex Tier)";
        else if (utilization > 75) utilizationTitle = "The Max Utilizer Award";

        // Fun Message / Title
        let message = "A balanced year!";
        if (totalDays > 30) message = "Legacy of Leisure! You are the relaxation champion.";
        else if (totalDays < 5) message = "The Iron Man. Barely a day off!";
        else if (topType === 'Sick') message = "The Survivor. You made it through!";
        else if (topType === 'Emergency') message = "Living on the edge!";

        res.json({
            totalDays,
            topType,
            longestStreak,
            message,
            punctuality,
            peakMonth,
            peakMonthTitle: "The Month You Peaced Out",
            utilization,
            utilizationTitle
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

import { useState, useEffect } from "react";

export const useWrappedTrigger = (user) => {
    const [teaserOpen, setTeaserOpen] = useState(false);

    useEffect(() => {
        const checkPopup = async () => {
            // 1. Check Global Trigger (Admin Override)
            try {
                console.log("Checking for global wrapped trigger...");
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

                const token = sessionStorage.getItem('token');
                const res = await fetch(`${process.env.REACT_APP_API_URL || '/api'}/config/wrapped-trigger?t=${Date.now()}`, {
                    headers: {
                        'Cache-Control': 'no-cache',
                        'Pragma': 'no-cache',
                        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                    },
                    signal: controller.signal
                });
                clearTimeout(timeoutId);

                const data = await res.json();
                console.log("Trigger Config Response:", data);

                if (data.value) {
                    const serverTriggerTime = parseInt(data.value);
                    // Use associateId as primary key (fallback to username)
                    const userId = user?.associateId || user?.username || 'anon';
                    const storageKeyTrigger = `wrappedTriggerSeenAt_${userId}`;
                    const storageKeyLastShown = `wrappedLastShown_${userId}`;

                    const lastSeenTrigger = parseInt(localStorage.getItem(storageKeyTrigger) || '0');

                    console.log(`Trigger Check for User [${userId}]: Server(${serverTriggerTime}) > Client(${lastSeenTrigger})? ${serverTriggerTime > lastSeenTrigger}`);

                    if (serverTriggerTime > lastSeenTrigger) {
                        console.log("Wrapped: Global Admin Trigger Detected!");
                        setTeaserOpen(true);
                        localStorage.setItem(storageKeyTrigger, serverTriggerTime.toString());
                        // Clear the 24h cooldown too so it shows immediately even if they saw the 'natural' one recently
                        localStorage.removeItem(storageKeyLastShown);
                        return; // Stop here, priority to Admin
                    } else {
                        console.log("Wrapped: Trigger already seen or older.");
                    }
                } else {
                    console.log("Wrapped: No global trigger set.");
                }
            } catch (err) {
                console.error("Failed to check global trigger", err);
            }

            // 2. Normal Date Window Logic (Dec 10 - Jan 5)
            const now = new Date();
            const currentMonth = now.getMonth(); // 0-11
            const currentDay = now.getDate(); // 1-31

            // Month: Dec (11) >= 10th OR Month: Jan (0) <= 1st
            const isTime = (currentMonth === 11 && currentDay >= 10) || (currentMonth === 0 && currentDay <= 1);

            if (isTime) {
                // Use associateId as primary key (fallback to username)
                const userId = user?.associateId || user?.username || 'anon';
                const storageKeyLastShown = `wrappedLastShown_${userId}`;
                const lastShown = parseInt(localStorage.getItem(storageKeyLastShown) || '0');
                const ONE_DAY = 24 * 60 * 60 * 1000;

                // Show if not shown in last 24h
                if (Date.now() - lastShown > ONE_DAY) {
                    console.log("Wrapped: Date window active & cooldown passed. Showing teaser.");
                    setTeaserOpen(true);
                    localStorage.setItem(storageKeyLastShown, Date.now().toString());
                } else {
                    console.log("Wrapped: In window but cooldown active.");
                }
            } else {
                console.log("Wrapped: Not in date window (Dec 10 - Jan 5).");
            }
        };

        if (user) {
            checkPopup();
        }
    }, [user]);

    return { teaserOpen, setTeaserOpen };
};

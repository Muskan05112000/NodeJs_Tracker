import { useState, useEffect } from 'react';

export const useWrappedAudio = (open, step) => {
    const [audioContext, setAudioContext] = useState(null);

    useEffect(() => {
        if (!open) return;

        const ctx = new (window.AudioContext || window.webkitAudioContext)();

        // --- BACKGROUND MUSIC (Jingle Bells - Slow & Rich) ---
        const E5 = 659.25, G5 = 783.99, C5 = 523.25, D5 = 587.33, F5 = 698.46;
        const C3 = 130.81, F3 = 174.61, G3 = 196.00; // Bass Notes

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
            // Check if context is valid and active/running
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

        setAudioContext(ctx);

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
};

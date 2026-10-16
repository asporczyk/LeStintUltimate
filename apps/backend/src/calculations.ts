// Pit stop lap of each stint = running total of full laps driven in the
// stints after the first one. See docs/LOGIKA_OBLICZEN.md, section 3.
export function computeFuelLaps(durations: number[], avgLapTime: number): number[] {
    let cumulativeLaps = 0;
    return durations.map((duration, index) => {
        if (index > 0) {
            cumulativeLaps += Math.floor(duration * 60 / avgLapTime);
        }
        return cumulativeLaps;
    });
}

// Clock time ("HH:MM" or "HH:MM:SS") shifted by a number of minutes, wrapping
// past midnight. Returns "HH:MM:SS".
export function addMinutesToClock(clock: string, minutes: number): string {
    const [h, m, sec = 0] = clock.split(':').map(Number);
    const total = ((h * 3600 + m * 60 + sec + Math.round(minutes * 60)) % 86400 + 86400) % 86400;
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(Math.floor(total / 3600))}:${pad(Math.floor((total % 3600) / 60))}:${pad(total % 60)}`;
}

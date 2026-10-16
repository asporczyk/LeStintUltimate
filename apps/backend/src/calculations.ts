export const DEFAULT_LAP_TIME = 120;

// Lap on which each stint starts = full laps completed during all earlier
// stints (stint #1 starts on lap 0). Laps are counted from the total time so
// rounding doesn't accumulate. See docs/LOGIKA_OBLICZEN.md, section 3.
export function computeFuelLaps(durations: number[], avgLapTime: number): number[] {
    const lapTime = avgLapTime > 0 ? avgLapTime : DEFAULT_LAP_TIME;
    let minutesBefore = 0;
    return durations.map(duration => {
        const startLap = Math.floor(minutesBefore * 60 / lapTime);
        minutesBefore += duration;
        return startLap;
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

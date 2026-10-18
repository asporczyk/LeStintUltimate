export const DEFAULT_LAP_TIME = 120;

// Floating point slack, so a lap finished exactly on the minute counts.
const EPSILON = 1e-9;

const isSet = (value: number | null | undefined): value is number => value != null && value > 0;

interface PaceSource {
    avgLapTime?: number | null;
}

// Lap time of a stint: its own, else its driver's, else the race's, else 120 s.
export function stintLapTime(
    race: PaceSource & { driverPace?: ({ driver: string } & PaceSource)[] } | null | undefined,
    stint: PaceSource & { driver?: string | null }
): number {
    const driverPace = race?.driverPace?.find(entry => entry.driver === stint.driver);
    return [stint.avgLapTime, driverPace?.avgLapTime, race?.avgLapTime].find(isSet) ?? DEFAULT_LAP_TIME;
}

// Lap on which each stint starts = full laps completed during all earlier
// stints (stint #1 starts on lap 0), each driven at its own lap time. Laps are
// summed with their fractions so rounding doesn't accumulate. See
// docs/LOGIKA_OBLICZEN.md, section 3.
export function computeFuelLaps(stints: { duration: number; lapTime: number }[]): number[] {
    let lapsBefore = 0;
    return stints.map(({ duration, lapTime }) => {
        const startLap = Math.floor(lapsBefore + EPSILON);
        lapsBefore += duration * 60 / (lapTime > 0 ? lapTime : DEFAULT_LAP_TIME);
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

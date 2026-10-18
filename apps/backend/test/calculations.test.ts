import { describe, expect, it } from "vitest";
import { addMinutesToClock, computeFuelLaps, stintLapTime } from "../src/calculations.js";

describe("computeFuelLaps (start lap of each stint)", () => {
    const at = (lapTime: number, ...durations: number[]) => durations.map(duration => ({ duration, lapTime }));

    it("starts the first stint on lap 0 and counts laps of earlier stints", () => {
        expect(computeFuelLaps(at(120, 50, 50, 30))).toEqual([0, 25, 50]);
    });

    it("does not depend on the stint's own duration", () => {
        expect(computeFuelLaps(at(120, 50, 10))).toEqual([0, 25]);
        expect(computeFuelLaps(at(120, 50, 90))).toEqual([0, 25]);
    });

    it("counts laps from the total time, so rounding does not accumulate", () => {
        // per-stint rounding would give 0, 10, 20
        expect(computeFuelLaps(at(225.5, 40, 40, 40))).toEqual([0, 10, 21]);
    });

    it("drives each stint at its own lap time", () => {
        // 50 min at 120 s = 25 laps, then 50 min at 100 s = 30 laps
        expect(computeFuelLaps([{ duration: 50, lapTime: 120 }, { duration: 50, lapTime: 100 }, { duration: 30, lapTime: 120 }]))
            .toEqual([0, 25, 55]);
    });

    it("falls back to 120 s when the lap time is not set", () => {
        expect(computeFuelLaps(at(0, 50, 50))).toEqual([0, 25]);
    });

    it("handles an empty schedule", () => {
        expect(computeFuelLaps([])).toEqual([]);
    });
});

describe("stintLapTime", () => {
    const race = { avgLapTime: 120, driverPace: [{ driver: "Adam", avgLapTime: 110 }, { driver: "Ola" }] };

    it("prefers the stint's lap time, then the driver's, then the race's", () => {
        expect(stintLapTime(race, { driver: "Adam", avgLapTime: 105 })).toBe(105);
        expect(stintLapTime(race, { driver: "Adam", avgLapTime: null })).toBe(110);
        expect(stintLapTime(race, { driver: "Ola" })).toBe(120);
        expect(stintLapTime(race, { driver: "Kuba" })).toBe(120);
    });

    it("falls back to 120 s when nothing is set", () => {
        expect(stintLapTime({ avgLapTime: 0 }, { driver: "Adam" })).toBe(120);
        expect(stintLapTime(null, {})).toBe(120);
    });
});

describe("addMinutesToClock", () => {
    it("returns the end of a session as HH:MM:SS", () => {
        expect(addMinutesToClock("19:30", 30)).toBe("20:00:00");
        expect(addMinutesToClock("20:30:15", 1.5)).toBe("20:31:45");
    });

    it("wraps past midnight", () => {
        expect(addMinutesToClock("23:30", 45)).toBe("00:15:00");
    });
});

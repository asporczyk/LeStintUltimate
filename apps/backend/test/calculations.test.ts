import { describe, expect, it } from "vitest";
import { addMinutesToClock, computeFuelLaps } from "../src/calculations.js";

describe("computeFuelLaps (start lap of each stint)", () => {
    it("starts the first stint on lap 0 and counts laps of earlier stints", () => {
        expect(computeFuelLaps([50, 50, 30], 120)).toEqual([0, 25, 50]);
    });

    it("does not depend on the stint's own duration", () => {
        expect(computeFuelLaps([50, 10], 120)).toEqual([0, 25]);
        expect(computeFuelLaps([50, 90], 120)).toEqual([0, 25]);
    });

    it("counts laps from the total time, so rounding does not accumulate", () => {
        // per-stint rounding would give 0, 10, 20
        expect(computeFuelLaps([40, 40, 40], 225.5)).toEqual([0, 10, 21]);
    });

    it("falls back to 120 s when the lap time is not set", () => {
        expect(computeFuelLaps([50, 50], 0)).toEqual([0, 25]);
    });

    it("handles an empty schedule", () => {
        expect(computeFuelLaps([], 120)).toEqual([]);
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

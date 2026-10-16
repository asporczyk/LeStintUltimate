import { describe, expect, it } from "vitest";
import { addMinutesToClock, computeFuelLaps } from "../src/calculations.js";

describe("computeFuelLaps", () => {
    it("starts at 0 and adds full laps of each following stint", () => {
        expect(computeFuelLaps([50, 50, 30], 120)).toEqual([0, 25, 40]);
    });

    it("drops partial laps", () => {
        expect(computeFuelLaps([45, 45], 225.5)).toEqual([0, 11]);
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

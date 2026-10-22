// JSON schemas for route validation. Fastify's Ajv defaults strip properties
// not listed here (removeAdditional) and coerce primitive types.

const objectId = { type: "string", pattern: "^[0-9a-fA-F]{24}$" } as const;
const clockTime = { type: "string", pattern: "^\\d{2}:\\d{2}(:\\d{2})?$" } as const;
const tire = { type: "string", maxLength: 3 } as const;
// A driver or spotter: one or two words, as the frontend allows; "-" is no spotter, "" not set.
const person = { type: "string", maxLength: 20, pattern: "^(-|[\\p{L}\\p{N}][\\p{L}\\p{N}_.'-]*( [\\p{L}\\p{N}_.'-]+)?)?$" } as const;
// Seconds; 0 = not set. Anything longer is a typo, and a lap of days hangs the race page.
const lapTime = { type: "number", minimum: 0, maximum: 600 } as const;
const lap = { type: "integer", minimum: 0, maximum: 10000 } as const;
const electronicsLevel = { type: "integer", minimum: 1, maximum: 9 } as const;
// "HH:MM" ("HH:MM+1" for its second time in a session over 24 h), or empty for no limit.
const availabilityHour = { type: "string", pattern: "^(([01]\\d|2[0-3]):[0-5]\\d(\\+1)?)?$" } as const;

export const idParams = {
    type: "object",
    required: ["id"],
    properties: { id: objectId }
} as const;

export const raceIdParams = {
    type: "object",
    required: ["raceId"],
    properties: { raceId: objectId }
} as const;

export const createRaceBody = {
    type: "object",
    required: ["name", "startDate"],
    additionalProperties: false,
    properties: {
        name: { type: "string", minLength: 1, maxLength: 100 },
        startDate: { type: "string", minLength: 1, maxLength: 40 }
    }
} as const;

export const patchRaceBody = {
    type: "object",
    additionalProperties: false,
    properties: {
        name: { type: "string", minLength: 1, maxLength: 100 },
        startDate: { type: "string", minLength: 1, maxLength: 40 },
        startTime: clockTime,
        raceLength: { type: "number", minimum: 0, maximum: 24 },
        drivers: { type: "array", maxItems: 20, items: person },
        // One entry per block of hours; a driver can have several.
        driverAvailability: {
            type: "array",
            maxItems: 200,
            items: {
                type: "object",
                required: ["driver"],
                additionalProperties: false,
                properties: { driver: person, from: availabilityHour, to: availabilityHour }
            }
        },
        // Pace per driver; a missing field falls back to the race's average.
        driverPace: {
            type: "array",
            maxItems: 20,
            items: {
                type: "object",
                required: ["driver"],
                additionalProperties: false,
                properties: {
                    driver: person,
                    avgLapTime: lapTime,
                    avgFuelPerLap: { type: "number", minimum: 0, maximum: 100 }
                }
            }
        },
        // Car electronics per driver; a missing field is not noted.
        driverElectronics: {
            type: "array",
            maxItems: 20,
            items: {
                type: "object",
                required: ["driver"],
                additionalProperties: false,
                properties: {
                    driver: person,
                    abs: electronicsLevel,
                    tc: electronicsLevel,
                    tcSlip: electronicsLevel,
                    tcCut: electronicsLevel,
                    // % of braking force on the front axle; the rear gets the rest.
                    brakeBias: { type: "number", minimum: 40, maximum: 70 },
                    // Rear wing angle in degrees; it can go below zero.
                    rearWing: { type: "number", minimum: -10, maximum: 10 }
                }
            }
        },
        tireSets: { type: "integer", minimum: 0, maximum: 100 },
        fuelTankCapacity: { type: "number", minimum: 0, maximum: 1000 },
        pitLaneTime: { type: "number", minimum: 0, maximum: 300 },
        avgLapTime: lapTime,
        avgFuelPerLap: { type: "number", minimum: 0, maximum: 100 },
        avgStintTime: { type: "number", minimum: 0, maximum: 120 },
        notes: { type: "string", maxLength: 200 }
    }
} as const;

const stintFields = {
    duration: { type: "number", minimum: 0, maximum: 120 },
    durationAuto: { type: "boolean" },
    driver: person,
    spotter: person,
    fuelLaps: lap,
    fuel: { type: "number", minimum: 0, maximum: 100 },
    // null falls back to the driver's (then the race's) pace
    avgLapTime: { ...lapTime, type: ["number", "null"] },
    avgFuelPerLap: { type: ["number", "null"], minimum: 0, maximum: 100 },
    tireFL: tire,
    tireFR: tire,
    tireRL: tire,
    tireRR: tire,
    repairs: {
        type: "array",
        maxItems: 7,
        uniqueItems: true,
        items: { type: "string", enum: ["bodywork", "frontWing", "rearWing", "suspFL", "suspFR", "suspRL", "suspRR"] }
    },
    // null removes the incident
    incident: {
        type: ["object", "null"],
        required: ["type", "lap"],
        additionalProperties: false,
        properties: {
            type: { type: "string", enum: ["weatherChange", "damage", "totalDamage"] },
            lap
        }
    },
    // Drive throughs and stop and gos served during the stint; [] removes them all.
    penalties: {
        type: "array",
        maxItems: 10,
        items: {
            type: "object",
            required: ["type", "lap"],
            additionalProperties: false,
            properties: {
                type: { type: "string", enum: ["driveThrough", "stopAndGo"] },
                lap,
                stopSeconds: { type: "number", minimum: 0, maximum: 300 }
            }
        }
    }
} as const;

export const createStintBody = {
    type: "object",
    required: ["raceId", "order"],
    additionalProperties: false,
    properties: {
        raceId: objectId,
        order: { type: "integer", minimum: 1 },
        ...stintFields
    }
} as const;

export const updateStintBody = {
    type: "object",
    additionalProperties: false,
    properties: stintFields
} as const;

export const trainingBody = {
    type: "object",
    additionalProperties: false,
    properties: {
        startTime: clockTime,
        duration: { type: "number", minimum: 0, maximum: 600 }
    }
} as const;

export const qualificationBody = {
    type: "object",
    additionalProperties: false,
    properties: {
        startTime: clockTime,
        duration: { type: "number", minimum: 0, maximum: 600 },
        laps: lap,
        driver: person,
        spotter: person,
        fuel: { type: "number", minimum: 0, maximum: 100 },
        tireFL: tire,
        tireFR: tire,
        tireRL: tire,
        tireRR: tire
    }
} as const;

// JSON schemas for route validation. Fastify's Ajv defaults strip properties
// not listed here (removeAdditional) and coerce primitive types.

const objectId = { type: "string", pattern: "^[0-9a-fA-F]{24}$" } as const;
const clockTime = { type: "string", pattern: "^\\d{2}:\\d{2}(:\\d{2})?$" } as const;
const tire = { type: "string", maxLength: 3 } as const;
const person = { type: "string", maxLength: 50 } as const;

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
        startDate: { type: "string", minLength: 1 }
    }
} as const;

export const patchRaceBody = {
    type: "object",
    additionalProperties: false,
    properties: {
        name: { type: "string", minLength: 1, maxLength: 100 },
        startDate: { type: "string", minLength: 1 },
        startTime: clockTime,
        raceLength: { type: "number", minimum: 0, maximum: 24 },
        drivers: { type: "array", maxItems: 20, items: person },
        tireSets: { type: "integer", minimum: 0, maximum: 100 },
        fuelTankCapacity: { type: "number", minimum: 0 },
        avgLapTime: { type: "number", minimum: 0 },
        avgFuelPerLap: { type: "number", minimum: 0, maximum: 100 },
        avgStintTime: { type: "number", minimum: 0, maximum: 120 },
        notes: { type: "string", maxLength: 200 }
    }
} as const;

const stintFields = {
    startTime: { type: "number" },
    duration: { type: "number", minimum: 0, maximum: 120 },
    driver: person,
    spotter: person,
    fuelLaps: { type: "integer", minimum: 0 },
    fuel: { type: "number", minimum: 0, maximum: 100 },
    tireFL: tire,
    tireFR: tire,
    tireRL: tire,
    tireRR: tire,
    tires: { type: "integer" }
} as const;

export const createStintBody = {
    type: "object",
    required: ["scheduleId", "order"],
    additionalProperties: false,
    properties: {
        scheduleId: objectId,
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
        laps: { type: "integer", minimum: 0 },
        driver: person,
        spotter: person,
        fuel: { type: "number", minimum: 0, maximum: 100 },
        tireFL: tire,
        tireFR: tire,
        tireRL: tire,
        tireRR: tire
    }
} as const;

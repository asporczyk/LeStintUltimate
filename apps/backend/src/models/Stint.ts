import { Schema, model, Types } from "mongoose";

export const INCIDENT_TYPES = ["weatherChange", "damage", "totalDamage"] as const;

// What cut the stint short and on which lap; the stint's duration already ends there.
const IncidentSchema = new Schema(
    {
        type: { type: String, enum: INCIDENT_TYPES, required: true },
        lap: { type: Number, required: true }
    },
    { _id: false }
);

export const PENALTY_TYPES = ["driveThrough", "stopAndGo"] as const;

// Penalty served during the stint: a pass through the pit lane after `lap` laps (with a
// stop of `stopSeconds` for a stop and go). The stint goes on with the same driver.
const PenaltySchema = new Schema(
    {
        type: { type: String, enum: PENALTY_TYPES, required: true },
        lap: { type: Number, required: true },
        stopSeconds: Number
    },
    { _id: false }
);

const StintSchema = new Schema(
    {
        scheduleId: { type: Types.ObjectId, ref: "Schedule", required: true },
        order: { type: Number, required: true },
        duration: Number,
        // true while duration is the race's avgStintTime (filled in automatically)
        durationAuto: Boolean,
        driver: String,
        spotter: String,
        fuelLaps: Number,
        fuel: Number,
        // Pace of this stint; unset (null) falls back to the driver's, then the race's.
        avgLapTime: Number,
        avgFuelPerLap: Number,
        tireFL: String,
        tireFR: String,
        tireRL: String,
        tireRR: String,
        // Parts repaired at the pit stop before the stint
        repairs: { type: [String], default: undefined },
        // null once removed
        incident: { type: IncidentSchema, default: undefined },
        penalties: { type: [PenaltySchema], default: undefined }
    },
    { timestamps: true }
);

StintSchema.index({ scheduleId: 1 });

export const Stint = model("Stint", StintSchema);

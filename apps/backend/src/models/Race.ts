import { Schema, model, Types } from "mongoose";

const RaceSchema = new Schema(
    {
        name: { type: String, required: true },
        startDate: { type: Date, required: true },
        raceLength: { type: Number, default: 6 },
        drivers: [{ type: String }],
        tireSets: { type: Number, default: 0 },
        avgLapTime: { type: Number, default: 0 },
        avgFuelPerLap: { type: Number, default: 0 },
        avgStintTime: { type: Number, default: 0 }
    },
    { timestamps: true }
);

export const Race = model("Race", RaceSchema);

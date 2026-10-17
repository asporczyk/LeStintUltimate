import { Schema, model, Types } from "mongoose";

const RaceSchema = new Schema(
    {
        name: { type: String, required: true },
        startDate: { type: Date, required: true },
        startTime: { type: String, default: '19:30' },
        raceLength: { type: Number, default: 6 },
        drivers: [{ type: String }],
        // Blocks of real clock hours ("HH:MM") a driver can drive, one entry per block;
        // empty = from the start / to the end.
        driverAvailability: [{
            _id: false,
            driver: { type: String, required: true },
            from: { type: String, default: '' },
            to: { type: String, default: '' }
        }],
        tireSets: { type: Number, default: 0 },
        fuelTankCapacity: { type: Number, default: 100 },
        avgLapTime: { type: Number, default: 0 },
        avgFuelPerLap: { type: Number, default: 0 },
        avgStintTime: { type: Number, default: 0 },
        notes: { 
            type: String, 
            default: '',
            validate: {
                validator: (v: string) => v.length <= 200,
                message: "Notes can be at most 200 characters"
            }
        }
    },
    { timestamps: true }
);

RaceSchema.index({ createdAt: -1 });

export const Race = model("Race", RaceSchema);

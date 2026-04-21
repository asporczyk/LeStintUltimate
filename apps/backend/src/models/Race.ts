import { Schema, model, Types } from "mongoose";

const RaceSchema = new Schema(
    {
        name: { type: String, required: true },
        startDate: { type: Date, required: true },
        startTime: { type: String, default: '19:30' },
        raceLength: { type: Number, default: 6 },
        drivers: [{ type: String }],
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
                message: "Notatka może mieć maksymalnie 200 znaków"
            }
        }
    },
    { timestamps: true }
);

RaceSchema.index({ createdAt: -1 });

export const Race = model("Race", RaceSchema);

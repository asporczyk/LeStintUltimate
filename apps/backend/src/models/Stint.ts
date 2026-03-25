import { Schema, model, Types } from "mongoose";

const StintSchema = new Schema(
    {
        scheduleId: { type: Types.ObjectId, ref: "Schedule", required: true },
        startTime: Number,
        duration: Number,
        driver: String,
        spotter: String,
        fuelLaps: Number,
        fuel: Number,
        tireFL: String,
        tireFR: String,
        tireRL: String,
        tireRR: String,
        tires: Number,
        lockedBy: String
    },
    { timestamps: true }
);

export const Stint = model("Stint", StintSchema);

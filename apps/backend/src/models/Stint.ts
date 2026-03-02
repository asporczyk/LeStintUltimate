import { Schema, model, Types } from "mongoose";

const StintSchema = new Schema(
    {
        scheduleId: { type: Types.ObjectId, ref: "Schedule", required: true },

        startTime: Number,
        duration: Number,
        driver: String,
        fuelLaps: Number,
        tires: String,
        lockedBy: String
    },
    { timestamps: true }
);

export const Stint = model("Stint", StintSchema);

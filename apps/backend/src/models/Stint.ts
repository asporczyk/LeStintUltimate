import { Schema, model, Types } from "mongoose";

const StintSchema = new Schema(
    {
        scheduleId: { type: Types.ObjectId, ref: "Schedule", required: true },
        order: { type: Number, required: true },
        startTime: Number,
        duration: Number,
        // true while duration is the race's avgStintTime (filled in automatically)
        durationAuto: Boolean,
        driver: String,
        spotter: String,
        fuelLaps: Number,
        fuel: Number,
        tireFL: String,
        tireFR: String,
        tireRL: String,
        tireRR: String,
        tires: Number
    },
    { timestamps: true }
);

StintSchema.index({ scheduleId: 1 });

export const Stint = model("Stint", StintSchema);

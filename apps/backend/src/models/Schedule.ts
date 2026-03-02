import { Schema, model } from "mongoose";

const ScheduleSchema = new Schema(
    {
        raceId: { type: String, required: true },
        version: { type: Number, default: 1 }
    },
    { timestamps: true }
);

export const Schedule = model("Schedule", ScheduleSchema);
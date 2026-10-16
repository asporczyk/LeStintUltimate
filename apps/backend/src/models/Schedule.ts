import { Schema, model } from "mongoose";

const ScheduleSchema = new Schema(
    {
        raceId: { type: String, required: true }
    },
    { timestamps: true }
);

export const Schedule = model("Schedule", ScheduleSchema);
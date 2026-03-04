import { Schema, model, Types } from "mongoose";

const RaceSchema = new Schema(
    {
        name: { type: String, required: true },
        startDate: { type: Date, required: true }
    },
    { timestamps: true }
);

export const Race = model("Race", RaceSchema);

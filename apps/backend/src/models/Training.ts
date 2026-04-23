import { Schema, model } from "mongoose";

const TrainingSchema = new Schema({
    raceId: { type: String, required: true },
    startTime: { type: String, default: '19:30' },
    duration: { type: Number, default: 30 }
}, { timestamps: true });

TrainingSchema.index({ raceId: 1 });

export const Training = model("Training", TrainingSchema);
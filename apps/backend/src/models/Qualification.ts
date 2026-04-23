import { Schema, model } from "mongoose";

const QualificationSchema = new Schema({
    raceId: { type: String, required: true },
    startTime: { type: String, default: '19:30' },
    duration: { type: Number, default: 30 },
    laps: { type: Number, default: 0 },
    driver: { type: String, default: '' },
    spotter: { type: String, default: '' },
    fuel: { type: Number, default: 100 },
    tireFL: { type: String, default: 'N' },
    tireFR: { type: String, default: 'N' },
    tireRL: { type: String, default: 'N' },
    tireRR: { type: String, default: 'N' }
}, { timestamps: true });

QualificationSchema.index({ raceId: 1 });

export const Qualification = model("Qualification", QualificationSchema);

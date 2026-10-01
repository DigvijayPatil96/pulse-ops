const mongoose = require('mongoose');

const vitalsSchema = new mongoose.Schema(
  {
    heartRate: { type: Number, required: true }, // bpm
    systolicBP: { type: Number, required: true }, // mmHg
    diastolicBP: { type: Number, required: true }, // mmHg
    spo2: { type: Number, required: true }, // percentage
    respiratoryRate: { type: Number, required: true }, // breaths/min
    temperature: { type: Number, required: true }, // celsius
    isAbnormal: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const chartNoteSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    authorName: String,
    authorRole: String,
    note: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['Progress Note', 'Doctor Order', 'Nursing Assessment', 'Triage Intake', 'Medication'],
      default: 'Progress Note',
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const patientSchema = new mongoose.Schema(
  {
    mrn: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    age: {
      type: Number,
      required: true,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      required: true,
    },
    bloodGroup: {
      type: String,
      default: 'Unknown',
    },
    allergies: [String],
    chiefComplaint: {
      type: String,
      required: true,
    },
    diagnosis: {
      type: String,
      default: 'Pending Physician Review',
    },
    status: {
      type: String,
      enum: ['triage', 'admitted', 'icu_transfer_requested', 'discharged'],
      default: 'triage',
    },
    triagePriority: {
      type: String,
      enum: ['CRITICAL', 'URGENT', 'SEMI_URGENT', 'STABLE'],
      default: 'STABLE',
    },
    esiScore: {
      type: Number,
      min: 1,
      max: 5,
      default: 4,
    },
    assignedDoctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    assignedNurse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    currentBed: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bed',
      default: null,
    },
    latestVitals: {
      type: vitalsSchema,
      default: () => ({
        heartRate: 75,
        systolicBP: 120,
        diastolicBP: 80,
        spo2: 98,
        respiratoryRate: 16,
        temperature: 37.0,
        isAbnormal: false,
        timestamp: new Date(),
      }),
    },
    vitalsHistory: [vitalsSchema],
    chartNotes: [chartNoteSchema],
    admissionDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Patient', patientSchema);

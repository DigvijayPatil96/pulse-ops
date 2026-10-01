const mongoose = require('mongoose');

const triageRecordSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    intakeNurse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    chiefComplaint: {
      type: String,
      required: true,
    },
    symptoms: [String],
    rawNurseNotes: {
      type: String,
      required: true,
    },
    vitalsSnapshot: {
      heartRate: Number,
      systolicBP: Number,
      diastolicBP: Number,
      spo2: Number,
      respiratoryRate: Number,
      temperature: Number,
    },
    aiSeverity: {
      type: String,
      enum: ['CRITICAL', 'URGENT', 'SEMI_URGENT', 'STABLE'],
      required: true,
    },
    esiScore: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    recommendedWard: {
      type: String,
      enum: ['ICU', 'Emergency', 'Cardiology', 'General'],
      required: true,
    },
    clinicalRationale: {
      type: String,
      required: true,
    },
    immediateActions: [
      {
        type: String,
      },
    ],
    requiredStaffRole: {
      type: String,
      enum: ['doctor', 'nurse', 'specialist'],
      default: 'doctor',
    },
    assignedStaff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    modelUsed: {
      type: String,
      default: 'gemini-2.5-flash',
    },
    isFallback: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('TriageRecord', triageRecordSchema);

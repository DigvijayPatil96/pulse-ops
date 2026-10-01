const mongoose = require('mongoose');

const bedSchema = new mongoose.Schema(
  {
    bedNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    ward: {
      type: String,
      enum: ['ICU', 'Emergency', 'Cardiology', 'General'],
      required: true,
    },
    status: {
      type: String,
      enum: ['available', 'occupied', 'cleaning', 'maintenance'],
      default: 'available',
    },
    currentPatient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      default: null,
    },
    isTelemetryActive: {
      type: Boolean,
      default: true,
    },
    floor: {
      type: Number,
      default: 2,
    },
    equipment: [
      {
        type: String,
      },
    ],
    lastCleaned: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Bed', bedSchema);

const mongoose = require('mongoose');

const systemAlertSchema = new mongoose.Schema(
  {
    alertType: {
      type: String,
      enum: [
        'ICU_CAPACITY_FULL',
        'CRITICAL_VITALS_BREACH',
        'UNASSIGNED_HIGH_PRIORITY',
        'STAFF_OVERLOAD',
        'CODE_BLUE',
      ],
      required: true,
    },
    severity: {
      type: String,
      enum: ['CRITICAL', 'WARNING', 'INFO'],
      default: 'WARNING',
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    ward: {
      type: String,
      default: 'All',
    },
    relatedPatient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      default: null,
    },
    relatedBed: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bed',
      default: null,
    },
    isResolved: {
      type: Boolean,
      default: false,
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('SystemAlert', systemAlertSchema);

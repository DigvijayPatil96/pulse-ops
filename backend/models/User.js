const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['doctor', 'nurse', 'admin'],
      default: 'nurse',
      required: true,
    },
    department: {
      type: String,
      enum: ['Emergency', 'ICU', 'Cardiology', 'General', 'Neurology', 'Pediatrics'],
      default: 'Emergency',
    },
    specialty: {
      type: String,
      default: 'General Medicine',
    },
    availabilityStatus: {
      type: String,
      enum: ['available', 'in_procedure', 'busy', 'off_duty'],
      default: 'available',
    },
    activePatientCount: {
      type: Number,
      default: 0,
    },
    phone: {
      type: String,
      default: 'ext-4091',
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password helper
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

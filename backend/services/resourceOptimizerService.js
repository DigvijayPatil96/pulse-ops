const mongoose = require('mongoose');
const Bed = require('../models/Bed');
const Patient = require('../models/Patient');
const User = require('../models/User');
const SystemAlert = require('../models/SystemAlert');
const memoryStore = require('./memoryStore');
const { emitAlert } = require('./socketService');

let bottleneckTimer = null;

const autoAssignStaffMember = async (role = 'doctor', department = 'Emergency') => {
  try {
    if (mongoose.connection.readyState === 1) {
      let staff = await User.findOne({
        role,
        availabilityStatus: { $in: ['available', 'busy'] },
      }).sort({ activePatientCount: 1 });

      if (!staff) staff = await User.findOne({ role }).sort({ activePatientCount: 1 });

      if (staff) {
        staff.activePatientCount += 1;
        await staff.save();
      }
      return staff;
    } else {
      // Memory Store
      let staff = memoryStore.users.find((u) => u.role === role);
      if (staff) {
        staff.activePatientCount = (staff.activePatientCount || 0) + 1;
      }
      return staff;
    }
  } catch (err) {
    console.error('[Resource Optimizer] Staff auto-assignment error:', err.message);
    return null;
  }
};

const auditBottlenecks = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      const icuBeds = await Bed.find({ ward: 'ICU' });
      if (icuBeds.length > 0) {
        const occupied = icuBeds.filter((b) => b.status === 'occupied').length;
        const rate = occupied / icuBeds.length;

        if (rate >= 0.75) {
          const recentAlert = await SystemAlert.findOne({
            alertType: 'ICU_CAPACITY_FULL',
            isResolved: false,
            createdAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) },
          });

          if (!recentAlert) {
            const alert = await SystemAlert.create({
              alertType: 'ICU_CAPACITY_FULL',
              severity: rate >= 1.0 ? 'CRITICAL' : 'WARNING',
              title: `ICU Capacity Saturated (${Math.round(rate * 100)}%)`,
              message: `Intensive Care Unit has ${occupied} of ${icuBeds.length} beds occupied. Immediate step-down transfers or diversion protocols recommended.`,
              ward: 'ICU',
            });
            emitAlert(alert);
          }
        }
      }
    } else {
      // Memory Store
      const icuBeds = memoryStore.beds.filter((b) => b.ward === 'ICU');
      if (icuBeds.length > 0) {
        const occupied = icuBeds.filter((b) => b.status === 'occupied').length;
        const rate = occupied / icuBeds.length;

        if (rate >= 0.75) {
          const existing = memoryStore.alerts.find(
            (a) =>
              a.alertType === 'ICU_CAPACITY_FULL' &&
              !a.isResolved &&
              new Date() - new Date(a.createdAt) < 5 * 60 * 1000
          );

          if (!existing) {
            const alert = {
              _id: `alert-${Date.now()}`,
              alertType: 'ICU_CAPACITY_FULL',
              severity: rate >= 1.0 ? 'CRITICAL' : 'WARNING',
              title: `ICU Capacity Saturated (${Math.round(rate * 100)}%)`,
              message: `Intensive Care Unit has ${occupied} of ${icuBeds.length} beds occupied. Immediate step-down transfers or diversion protocols recommended.`,
              ward: 'ICU',
              isResolved: false,
              createdAt: new Date(),
            };
            memoryStore.alerts.unshift(alert);
            emitAlert(alert);
          }
        }
      }
    }
  } catch (error) {
    console.error('[Resource Optimizer] Audit error:', error.message);
  }
};

const startResourceOptimizer = (intervalMs = 15000) => {
  if (bottleneckTimer) clearInterval(bottleneckTimer);
  console.log(`[Resource Optimizer] Automated bottleneck monitor active (interval: ${intervalMs}ms)...`);
  bottleneckTimer = setInterval(auditBottlenecks, intervalMs);
};

const stopResourceOptimizer = () => {
  if (bottleneckTimer) {
    clearInterval(bottleneckTimer);
    bottleneckTimer = null;
  }
};

module.exports = {
  autoAssignStaffMember,
  auditBottlenecks,
  startResourceOptimizer,
  stopResourceOptimizer,
};

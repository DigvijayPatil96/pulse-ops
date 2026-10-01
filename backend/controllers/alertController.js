const mongoose = require('mongoose');
const SystemAlert = require('../models/SystemAlert');
const memoryStore = require('../services/memoryStore');
const { auditBottlenecks } = require('../services/resourceOptimizerService');
const { emitAlertResolved } = require('../services/socketService');

// @desc    Get system bottleneck and critical alarms
// @route   GET /api/alerts
const getAlerts = async (req, res, next) => {
  try {
    const { isResolved } = req.query;

    if (mongoose.connection.readyState === 1) {
      const query = {};
      if (isResolved !== undefined) {
        query.isResolved = isResolved === 'true';
      } else {
        query.isResolved = false;
      }

      const alerts = await SystemAlert.find(query)
        .populate('relatedPatient', 'fullName mrn triagePriority')
        .populate('relatedBed', 'bedNumber ward')
        .populate('resolvedBy', 'name role')
        .sort({ createdAt: -1 })
        .limit(30);

      const criticalCount = alerts.filter((a) => a.severity === 'CRITICAL' && !a.isResolved).length;
      return res.json({ success: true, criticalCount, count: alerts.length, alerts });
    } else {
      // Memory Store
      let alerts = [...memoryStore.alerts];
      if (isResolved !== undefined) {
        alerts = alerts.filter((a) => a.isResolved === (isResolved === 'true'));
      } else {
        alerts = alerts.filter((a) => !a.isResolved);
      }

      const criticalCount = alerts.filter((a) => a.severity === 'CRITICAL' && !a.isResolved).length;
      return res.json({ success: true, criticalCount, count: alerts.length, alerts });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Mark bottleneck or telemetry alert as resolved
// @route   PATCH /api/alerts/:id/resolve
const resolveAlert = async (req, res, next) => {
  try {
    const id = req.params.id;

    if (mongoose.connection.readyState === 1) {
      const alert = await SystemAlert.findById(id);
      if (!alert) return res.status(404).json({ success: false, message: 'Alert not found' });

      alert.isResolved = true;
      alert.resolvedBy = req.user?._id;
      alert.resolvedAt = new Date();
      await alert.save();

      emitAlertResolved(alert._id);
      return res.json({ success: true, message: 'Alert marked as resolved', alert });
    } else {
      // Memory Store
      const alert = memoryStore.alerts.find((a) => a._id === id);
      if (!alert) return res.status(404).json({ success: false, message: 'Alert not found' });

      alert.isResolved = true;
      alert.resolvedBy = req.user;
      alert.resolvedAt = new Date();

      emitAlertResolved(alert._id);
      return res.json({ success: true, message: 'Alert marked as resolved', alert });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Manually trigger hospital operational bottleneck check
// @route   POST /api/alerts/audit
const triggerAudit = async (req, res, next) => {
  try {
    await auditBottlenecks();
    res.json({ success: true, message: 'Operational bottleneck audit completed.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAlerts,
  resolveAlert,
  triggerAudit,
};

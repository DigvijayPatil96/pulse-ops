const mongoose = require('mongoose');
const Patient = require('../models/Patient');
const SystemAlert = require('../models/SystemAlert');
const memoryStore = require('./memoryStore');
const { emitVitalsTick, emitAlert } = require('./socketService');

let simulationInterval = null;

const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

const fluctuate = (current, min, max, maxDelta = 2) => {
  const delta = (Math.random() * 2 - 1) * maxDelta;
  return clamp(Math.round((current + delta) * 10) / 10, min, max);
};

const runVitalsTick = async () => {
  try {
    let admittedPatients = [];

    if (mongoose.connection.readyState === 1) {
      admittedPatients = await Patient.find({
        status: { $in: ['admitted', 'icu_transfer_requested'] },
        currentBed: { $ne: null },
      }).populate('currentBed');
    } else {
      admittedPatients = memoryStore.patients.filter(
        (p) =>
          (p.status === 'admitted' || p.status === 'icu_transfer_requested') &&
          p.currentBed !== null
      );
    }

    if (!admittedPatients || admittedPatients.length === 0) return;

    for (const patient of admittedPatients) {
      const current = patient.latestVitals || {
        heartRate: 75,
        systolicBP: 120,
        diastolicBP: 80,
        spo2: 98,
        respiratoryRate: 16,
        temperature: 37.0,
      };

      const isCritical = patient.triagePriority === 'CRITICAL';

      let newHR = fluctuate(current.heartRate, isCritical ? 90 : 55, isCritical ? 165 : 115, isCritical ? 4 : 2);
      let newSpO2 = fluctuate(current.spo2, isCritical ? 84 : 92, 100, isCritical ? 1.5 : 0.8);
      let newSys = fluctuate(current.systolicBP, isCritical ? 80 : 100, isCritical ? 205 : 140, 3);
      let newDia = fluctuate(current.diastolicBP, 50, 105, 2);
      let newRR = fluctuate(current.respiratoryRate, 10, isCritical ? 34 : 22, 1);
      let newTemp = fluctuate(current.temperature, 36.2, 39.4, 0.1);

      const isAbnormal = newSpO2 < 90 || newHR > 130 || newHR < 50 || newSys > 180 || newSys < 85;

      const newVitals = {
        heartRate: Math.round(newHR),
        systolicBP: Math.round(newSys),
        diastolicBP: Math.round(newDia),
        spo2: Math.min(100, Math.round(newSpO2)),
        respiratoryRate: Math.round(newRR),
        temperature: Math.round(newTemp * 10) / 10,
        isAbnormal,
        timestamp: new Date(),
      };

      patient.latestVitals = newVitals;
      if (!patient.vitalsHistory) patient.vitalsHistory = [];
      patient.vitalsHistory.push(newVitals);
      if (patient.vitalsHistory.length > 25) {
        patient.vitalsHistory.shift();
      }

      if (mongoose.connection.readyState === 1 && typeof patient.save === 'function') {
        await patient.save();
      }

      const bedId = patient.currentBed?._id || patient.currentBed;
      emitVitalsTick(patient._id, bedId, newVitals);

      // Trigger critical telemetry alarm if patient vital markers collapse
      if (isAbnormal && isCritical) {
        const title = `Critical Telemetry Alert: ${patient.fullName}`;
        const message = `Bed ${patient.currentBed?.bedNumber || 'Assigned'}: Vitals breach (SpO2 ${newVitals.spo2}%, HR ${newVitals.heartRate} bpm, BP ${newVitals.systolicBP}/${newVitals.diastolicBP}). Emergency bedside physician required.`;

        if (mongoose.connection.readyState === 1) {
          const existing = await SystemAlert.findOne({
            relatedPatient: patient._id,
            alertType: 'CRITICAL_VITALS_BREACH',
            isResolved: false,
            createdAt: { $gte: new Date(Date.now() - 2 * 60 * 1000) },
          });

          if (!existing) {
            const alert = await SystemAlert.create({
              alertType: 'CRITICAL_VITALS_BREACH',
              severity: 'CRITICAL',
              title,
              message,
              ward: patient.currentBed?.ward || 'ICU',
              relatedPatient: patient._id,
              relatedBed: patient.currentBed?._id,
            });
            emitAlert(alert);
          }
        } else {
          const existing = memoryStore.alerts.find(
            (a) =>
              (a.relatedPatient?._id || a.relatedPatient) === patient._id &&
              a.alertType === 'CRITICAL_VITALS_BREACH' &&
              !a.isResolved &&
              new Date() - new Date(a.createdAt) < 2 * 60 * 1000
          );

          if (!existing) {
            const newAlert = {
              _id: `alert-${Date.now()}`,
              alertType: 'CRITICAL_VITALS_BREACH',
              severity: 'CRITICAL',
              title,
              message,
              ward: patient.currentBed?.ward || 'ICU',
              relatedPatient: patient,
              relatedBed: patient.currentBed,
              isResolved: false,
              createdAt: new Date(),
            };
            memoryStore.alerts.unshift(newAlert);
            emitAlert(newAlert);
          }
        }
      }
    }
  } catch (err) {
    console.error('[Vitals Engine] Error during vitals simulation tick:', err.message);
  }
};

const startVitalsSimulation = (intervalMs = 3000) => {
  if (simulationInterval) clearInterval(simulationInterval);
  console.log(`[Vitals Engine] Starting simulated real-time vital streams (tick: ${intervalMs}ms)...`);
  simulationInterval = setInterval(runVitalsTick, intervalMs);
};

const stopVitalsSimulation = () => {
  if (simulationInterval) {
    clearInterval(simulationInterval);
    simulationInterval = null;
    console.log('[Vitals Engine] Real-time vitals simulation halted.');
  }
};

module.exports = {
  startVitalsSimulation,
  stopVitalsSimulation,
};

const mongoose = require('mongoose');
const Bed = require('../models/Bed');
const Patient = require('../models/Patient');
const memoryStore = require('../services/memoryStore');
const { emitBedUpdate } = require('../services/socketService');

// @desc    Get all hospital beds with current occupancy & patient telemetry
// @route   GET /api/beds
const getBeds = async (req, res, next) => {
  try {
    const { ward, status } = req.query;

    if (mongoose.connection.readyState === 1) {
      const query = {};
      if (ward) query.ward = ward;
      if (status) query.status = status;

      const beds = await Bed.find(query)
        .populate({
          path: 'currentPatient',
          select: 'fullName mrn age gender triagePriority esiScore latestVitals status admissionDate',
          populate: [
            { path: 'assignedDoctor', select: 'name email specialty' },
            { path: 'assignedNurse', select: 'name email' },
          ],
        })
        .sort({ ward: 1, bedNumber: 1 });

      const totalBeds = beds.length;
      const occupied = beds.filter((b) => b.status === 'occupied').length;
      const available = beds.filter((b) => b.status === 'available').length;
      const cleaning = beds.filter((b) => b.status === 'cleaning').length;

      return res.json({
        success: true,
        stats: {
          total: totalBeds,
          occupied,
          available,
          cleaning,
          occupancyRate: totalBeds > 0 ? Math.round((occupied / totalBeds) * 100) : 0,
        },
        beds,
      });
    } else {
      // Memory Store
      let beds = [...memoryStore.beds];
      if (ward && ward !== 'ALL') beds = beds.filter((b) => b.ward === ward);
      if (status && status !== 'ALL') beds = beds.filter((b) => b.status === status);

      const safeBeds = beds.map((b) => {
        if (!b.currentPatient) return b;
        const { currentBed, ...pRest } = b.currentPatient;
        return { ...b, currentPatient: pRest };
      });

      const totalBeds = memoryStore.beds.length;
      const occupied = memoryStore.beds.filter((b) => b.status === 'occupied').length;
      const available = memoryStore.beds.filter((b) => b.status === 'available').length;
      const cleaning = memoryStore.beds.filter((b) => b.status === 'cleaning').length;

      return res.json({
        success: true,
        stats: {
          total: totalBeds,
          occupied,
          available,
          cleaning,
          occupancyRate: totalBeds > 0 ? Math.round((occupied / totalBeds) * 100) : 0,
        },
        beds: safeBeds,
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Assign an active patient to a specific hospital bed
// @route   PATCH /api/beds/:id/assign
const assignPatientToBed = async (req, res, next) => {
  try {
    const { patientId } = req.body;
    const bedId = req.params.id;

    if (mongoose.connection.readyState === 1) {
      const bed = await Bed.findById(bedId);
      if (!bed) return res.status(404).json({ success: false, message: 'Bed not found' });

      const patient = await Patient.findById(patientId);
      if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });

      if (patient.currentBed && patient.currentBed.toString() !== bedId) {
        const oldBed = await Bed.findById(patient.currentBed);
        if (oldBed) {
          oldBed.status = 'cleaning';
          oldBed.currentPatient = null;
          await oldBed.save();
          emitBedUpdate(oldBed);
        }
      }

      bed.currentPatient = patient._id;
      bed.status = 'occupied';
      await bed.save();

      patient.currentBed = bed._id;
      patient.status = 'admitted';
      await patient.save();

      const populatedBed = await Bed.findById(bed._id).populate('currentPatient');
      emitBedUpdate(populatedBed);

      return res.json({
        success: true,
        message: `Patient ${patient.fullName} successfully assigned to Bed ${bed.bedNumber}`,
        bed: populatedBed,
      });
    } else {
      // Memory Store
      const bed = memoryStore.beds.find((b) => b._id === bedId);
      if (!bed) return res.status(404).json({ success: false, message: 'Bed not found' });

      const patient = memoryStore.patients.find((p) => p._id === patientId);
      if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });

      if (patient.currentBed && patient.currentBed._id !== bedId) {
        const oldBed = memoryStore.beds.find((b) => b._id === patient.currentBed._id);
        if (oldBed) {
          oldBed.status = 'cleaning';
          oldBed.currentPatient = null;
          emitBedUpdate(oldBed);
        }
      }

      bed.currentPatient = patient;
      bed.status = 'occupied';
      patient.currentBed = bed;
      patient.status = 'admitted';

      emitBedUpdate(bed);

      return res.json({
        success: true,
        message: `Patient ${patient.fullName} successfully assigned to Bed ${bed.bedNumber}`,
        bed,
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Release / discharge patient from bed
// @route   PATCH /api/beds/:id/release
const releaseBed = async (req, res, next) => {
  try {
    const bedId = req.params.id;

    if (mongoose.connection.readyState === 1) {
      const bed = await Bed.findById(bedId);
      if (!bed) return res.status(404).json({ success: false, message: 'Bed not found' });

      if (bed.currentPatient) {
        const patient = await Patient.findById(bed.currentPatient);
        if (patient) {
          patient.currentBed = null;
          patient.status = 'discharged';
          await patient.save();
        }
      }

      bed.currentPatient = null;
      bed.status = 'cleaning';
      bed.lastCleaned = new Date();
      await bed.save();

      emitBedUpdate(bed);
      return res.json({ success: true, message: `Bed ${bed.bedNumber} released.`, bed });
    } else {
      // Memory Store
      const bed = memoryStore.beds.find((b) => b._id === bedId);
      if (!bed) return res.status(404).json({ success: false, message: 'Bed not found' });

      if (bed.currentPatient) {
        const patient = memoryStore.patients.find((p) => p._id === bed.currentPatient._id);
        if (patient) {
          patient.currentBed = null;
          patient.status = 'discharged';
        }
      }

      bed.currentPatient = null;
      bed.status = 'cleaning';
      bed.lastCleaned = new Date();

      emitBedUpdate(bed);
      return res.json({ success: true, message: `Bed ${bed.bedNumber} released.`, bed });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update bed maintenance or cleaning status
// @route   PATCH /api/beds/:id/status
const updateBedStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const bedId = req.params.id;

    if (mongoose.connection.readyState === 1) {
      const bed = await Bed.findById(bedId);
      if (!bed) return res.status(404).json({ success: false, message: 'Bed not found' });

      bed.status = status;
      if (status === 'available') bed.currentPatient = null;
      await bed.save();

      emitBedUpdate(bed);
      return res.json({ success: true, message: `Bed status updated to ${status}`, bed });
    } else {
      // Memory Store
      const bed = memoryStore.beds.find((b) => b._id === bedId);
      if (!bed) return res.status(404).json({ success: false, message: 'Bed not found' });

      bed.status = status;
      if (status === 'available') bed.currentPatient = null;

      emitBedUpdate(bed);
      return res.json({ success: true, message: `Bed status updated to ${status}`, bed });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBeds,
  assignPatientToBed,
  releaseBed,
  updateBedStatus,
};

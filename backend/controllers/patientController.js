const mongoose = require('mongoose');
const Patient = require('../models/Patient');
const Bed = require('../models/Bed');
const memoryStore = require('../services/memoryStore');
const { emitVitalsTick, emitBedUpdate } = require('../services/socketService');

// @desc    Get all active patients with filters
// @route   GET /api/patients
const getPatients = async (req, res, next) => {
  try {
    const { status, priority, ward } = req.query;

    if (mongoose.connection.readyState === 1) {
      const query = {};
      if (status) query.status = status;
      if (priority) query.triagePriority = priority;

      let patients = await Patient.find(query)
        .populate('assignedDoctor', 'name email specialty department')
        .populate('assignedNurse', 'name email department')
        .populate('currentBed')
        .sort({ createdAt: -1 });

      if (ward) {
        patients = patients.filter((p) => p.currentBed && p.currentBed.ward === ward);
      }

      return res.json({ success: true, count: patients.length, patients });
    } else {
      // Memory Store
      let patients = [...memoryStore.patients];
      if (status) patients = patients.filter((p) => p.status === status);
      if (priority) patients = patients.filter((p) => p.triagePriority === priority);
      if (ward) patients = patients.filter((p) => p.currentBed && p.currentBed.ward === ward);

      return res.json({ success: true, count: patients.length, patients });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get single patient by ID
// @route   GET /api/patients/:id
const getPatientById = async (req, res, next) => {
  try {
    const id = req.params.id;

    if (mongoose.connection.readyState === 1) {
      const patient = await Patient.findById(id)
        .populate('assignedDoctor', 'name email specialty department phone')
        .populate('assignedNurse', 'name email department phone')
        .populate('currentBed');

      if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });
      return res.json({ success: true, patient });
    } else {
      // Memory Store
      const patient = memoryStore.patients.find((p) => p._id === id);
      if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });
      return res.json({ success: true, patient });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Admit a new patient into the hospital
// @route   POST /api/patients
const admitPatient = async (req, res, next) => {
  try {
    const { fullName, age, gender, bloodGroup, allergies, chiefComplaint, initialVitals, bedId } = req.body;
    const mrn = `MRN-${Math.floor(10000 + Math.random() * 90000)}`;

    const defaultVitals = initialVitals || {
      heartRate: 75,
      systolicBP: 120,
      diastolicBP: 80,
      spo2: 98,
      respiratoryRate: 16,
      temperature: 37.0,
      isAbnormal: false,
      timestamp: new Date(),
    };

    if (mongoose.connection.readyState === 1) {
      const patient = new Patient({
        mrn,
        fullName,
        age,
        gender,
        bloodGroup: bloodGroup || 'Unknown',
        allergies: allergies || [],
        chiefComplaint,
        status: bedId ? 'admitted' : 'triage',
        latestVitals: defaultVitals,
        vitalsHistory: [defaultVitals],
      });

      if (req.user?.role === 'doctor') patient.assignedDoctor = req.user._id;
      else if (req.user?.role === 'nurse') patient.assignedNurse = req.user._id;

      if (bedId) {
        const bed = await Bed.findById(bedId);
        if (bed && bed.status === 'available') {
          bed.status = 'occupied';
          bed.currentPatient = patient._id;
          await bed.save();
          patient.currentBed = bed._id;
          emitBedUpdate(bed);
        }
      }

      await patient.save();
      return res.status(201).json({ success: true, message: 'Patient admitted', patient });
    } else {
      // Memory Store
      const newPatient = {
        _id: `pat-${Date.now()}`,
        mrn,
        fullName,
        age,
        gender,
        bloodGroup: bloodGroup || 'Unknown',
        allergies: allergies || [],
        chiefComplaint,
        diagnosis: 'Pending Physician Review',
        status: bedId ? 'admitted' : 'triage',
        triagePriority: 'STABLE',
        esiScore: 4,
        assignedDoctor: req.user?.role === 'doctor' ? req.user : null,
        assignedNurse: req.user?.role === 'nurse' ? req.user : null,
        currentBed: null,
        latestVitals: defaultVitals,
        vitalsHistory: [defaultVitals],
        chartNotes: [],
        admissionDate: new Date(),
      };

      if (bedId) {
        const bed = memoryStore.beds.find((b) => b._id === bedId);
        if (bed && bed.status === 'available') {
          bed.status = 'occupied';
          bed.currentPatient = newPatient;
          newPatient.currentBed = bed;
          emitBedUpdate(bed);
        }
      }

      memoryStore.patients.unshift(newPatient);
      return res.status(201).json({ success: true, message: 'Patient admitted', patient: newPatient });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update patient vitals manually from staff portal
// @route   PATCH /api/patients/:id/vitals
const updatePatientVitals = async (req, res, next) => {
  try {
    const { heartRate, systolicBP, diastolicBP, spo2, respiratoryRate, temperature } = req.body;
    const id = req.params.id;

    const isAbnormal = spo2 < 90 || heartRate > 130 || heartRate < 50 || systolicBP > 180 || systolicBP < 85;

    const newVitals = {
      heartRate,
      systolicBP,
      diastolicBP,
      spo2,
      respiratoryRate,
      temperature,
      isAbnormal,
      timestamp: new Date(),
    };

    if (mongoose.connection.readyState === 1) {
      const patient = await Patient.findById(id);
      if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });

      patient.latestVitals = newVitals;
      if (!patient.vitalsHistory) patient.vitalsHistory = [];
      patient.vitalsHistory.push(newVitals);
      await patient.save();

      emitVitalsTick(patient._id, patient.currentBed, newVitals);
      return res.json({ success: true, message: 'Vitals updated', latestVitals: newVitals });
    } else {
      // Memory Store
      const patient = memoryStore.patients.find((p) => p._id === id);
      if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });

      patient.latestVitals = newVitals;
      if (!patient.vitalsHistory) patient.vitalsHistory = [];
      patient.vitalsHistory.push(newVitals);

      emitVitalsTick(patient._id, patient.currentBed?._id, newVitals);
      return res.json({ success: true, message: 'Vitals updated', latestVitals: newVitals });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Add a clinical chart note
// @route   POST /api/patients/:id/chart-notes
const addChartNote = async (req, res, next) => {
  try {
    const { note, category } = req.body;
    const id = req.params.id;

    const newNote = {
      _id: `note-${Date.now()}`,
      author: req.user?._id || req.user?.id,
      authorName: req.user?.name || 'Clinical Staff',
      authorRole: req.user?.role || 'nurse',
      note,
      category: category || (req.user?.role === 'doctor' ? 'Doctor Order' : 'Nursing Assessment'),
      timestamp: new Date(),
    };

    if (mongoose.connection.readyState === 1) {
      const patient = await Patient.findById(id);
      if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });

      patient.chartNotes.unshift(newNote);
      await patient.save();
      return res.status(201).json({ success: true, message: 'Chart note appended', note: newNote });
    } else {
      // Memory Store
      const patient = memoryStore.patients.find((p) => p._id === id);
      if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });

      if (!patient.chartNotes) patient.chartNotes = [];
      patient.chartNotes.unshift(newNote);
      return res.status(201).json({ success: true, message: 'Chart note appended', note: newNote });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPatients,
  getPatientById,
  admitPatient,
  updatePatientVitals,
  addChartNote,
};

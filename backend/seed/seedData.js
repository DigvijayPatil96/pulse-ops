require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../config/db');
const User = require('../models/User');
const Bed = require('../models/Bed');
const Patient = require('../models/Patient');
const Task = require('../models/Task');
const SystemAlert = require('../models/SystemAlert');
const TriageRecord = require('../models/TriageRecord');

const seedHospitalData = async () => {
  try {
    await connectDB();
    console.log('[Seeder] Connected to database. Purging existing collections...');

    await Promise.all([
      User.deleteMany({}),
      Bed.deleteMany({}),
      Patient.deleteMany({}),
      Task.deleteMany({}),
      SystemAlert.deleteMany({}),
      TriageRecord.deleteMany({}),
    ]);

    console.log('[Seeder] Creating staff accounts (Doctors & Nurses)...');

    const doctor1 = await User.create({
      name: 'Dr. Sarah Chen, MD',
      email: 'dr.chen@hospital.org',
      password: 'password123',
      role: 'doctor',
      department: 'ICU',
      specialty: 'Intensive Care & Pulmonology',
      availabilityStatus: 'available',
      phone: 'ext-4091',
    });

    const doctor2 = await User.create({
      name: 'Dr. Marcus Vance, MD',
      email: 'dr.vance@hospital.org',
      password: 'password123',
      role: 'doctor',
      department: 'Emergency',
      specialty: 'Emergency Medicine',
      availabilityStatus: 'available',
      phone: 'ext-4092',
    });

    const nurse1 = await User.create({
      name: 'Elena Rostova, RN',
      email: 'nurse.elena@hospital.org',
      password: 'password123',
      role: 'nurse',
      department: 'Emergency',
      specialty: 'Trauma & Triage Intake',
      availabilityStatus: 'available',
      phone: 'ext-3021',
    });

    const nurse2 = await User.create({
      name: 'James Miller, BSN',
      email: 'nurse.james@hospital.org',
      password: 'password123',
      role: 'nurse',
      department: 'ICU',
      specialty: 'Critical Care Monitoring',
      availabilityStatus: 'available',
      phone: 'ext-3022',
    });

    console.log('[Seeder] Generating hospital wards and beds matrix...');

    const bedDefs = [
      // ICU Ward (4 Beds)
      { bedNumber: 'ICU-01', ward: 'ICU', floor: 3, equipment: ['Ventilator', 'Arterial Line Monitor', 'Infusion Pump'] },
      { bedNumber: 'ICU-02', ward: 'ICU', floor: 3, equipment: ['Ventilator', 'Dialysis Port', 'Multiparameter Monitor'] },
      { bedNumber: 'ICU-03', ward: 'ICU', floor: 3, equipment: ['Ventilator', 'ECMO Hookup', 'Defibrillator'] },
      { bedNumber: 'ICU-04', ward: 'ICU', floor: 3, equipment: ['Telemetry Monitor', 'Oxygen Blender'] },

      // Emergency Ward (4 Beds)
      { bedNumber: 'ER-01', ward: 'Emergency', floor: 1, equipment: ['Crash Cart', 'Mobile X-Ray Port', 'Suction'] },
      { bedNumber: 'ER-02', ward: 'Emergency', floor: 1, equipment: ['Rapid Infuser', 'Multiparameter Monitor'] },
      { bedNumber: 'ER-03', ward: 'Emergency', floor: 1, equipment: ['Standard Monitor', 'Diagnostic Ultrasound'] },
      { bedNumber: 'ER-04', ward: 'Emergency', floor: 1, equipment: ['Standard Monitor', 'Splinting Cart'] },

      // Cardiology Ward (4 Beds)
      { bedNumber: 'CARD-01', ward: 'Cardiology', floor: 2, equipment: ['12-Lead Continuous ECG', 'Pacemaker Programmer'] },
      { bedNumber: 'CARD-02', ward: 'Cardiology', floor: 2, equipment: ['12-Lead Continuous ECG', 'Infusion Array'] },
      { bedNumber: 'CARD-03', ward: 'Cardiology', floor: 2, equipment: ['Telemetry Transmitter'] },
      { bedNumber: 'CARD-04', ward: 'Cardiology', floor: 2, equipment: ['Telemetry Transmitter'] },

      // General Ward (4 Beds)
      { bedNumber: 'GEN-01', ward: 'General', floor: 2, equipment: ['Pulse Oximeter', 'IV Pole'] },
      { bedNumber: 'GEN-02', ward: 'General', floor: 2, equipment: ['Pulse Oximeter', 'Vital Spot Monitor'] },
      { bedNumber: 'GEN-03', ward: 'General', floor: 2, equipment: ['Pulse Oximeter'] },
      { bedNumber: 'GEN-04', ward: 'General', floor: 2, equipment: ['Pulse Oximeter'] },
    ];

    const createdBeds = await Bed.insertMany(bedDefs);
    const bedMap = {};
    createdBeds.forEach((b) => {
      bedMap[b.bedNumber] = b;
    });

    console.log('[Seeder] Populating acute and stable admitted patients...');

    // Patient 1: Critical STEMI in ICU-01
    const p1 = await Patient.create({
      mrn: 'MRN-10824',
      fullName: 'Arthur Pendelton',
      age: 68,
      gender: 'Male',
      bloodGroup: 'O+',
      allergies: ['Penicillin', 'Sulfa'],
      chiefComplaint: 'Acute substernal chest pressure radiating to left jaw',
      diagnosis: 'Acute Anterior Wall STEMI s/p Emergency PCI',
      status: 'admitted',
      triagePriority: 'CRITICAL',
      esiScore: 1,
      assignedDoctor: doctor1._id,
      assignedNurse: nurse2._id,
      currentBed: bedMap['ICU-01']._id,
      latestVitals: {
        heartRate: 114,
        systolicBP: 158,
        diastolicBP: 94,
        spo2: 92,
        respiratoryRate: 22,
        temperature: 37.2,
        isAbnormal: true,
        timestamp: new Date(),
      },
      chartNotes: [
        {
          author: doctor1._id,
          authorName: doctor1.name,
          authorRole: 'doctor',
          note: 'PCI completed with drug-eluting stent to LAD. Dual antiplatelet therapy started. Continue continuous ST-segment monitoring.',
          category: 'Doctor Order',
          timestamp: new Date(Date.now() - 3600 * 1000),
        },
      ],
    });
    bedMap['ICU-01'].currentPatient = p1._id;
    bedMap['ICU-01'].status = 'occupied';
    await bedMap['ICU-01'].save();

    // Patient 2: Sepsis in ICU-02
    const p2 = await Patient.create({
      mrn: 'MRN-39182',
      fullName: 'Maria Hernandez',
      age: 54,
      gender: 'Female',
      bloodGroup: 'A+',
      allergies: ['Aspirin'],
      chiefComplaint: 'High spiking fever, productive purulent cough, and severe hypotension',
      diagnosis: 'Severe Septic Shock secondary to Lobar Pneumonia',
      status: 'admitted',
      triagePriority: 'CRITICAL',
      esiScore: 1,
      assignedDoctor: doctor1._id,
      assignedNurse: nurse2._id,
      currentBed: bedMap['ICU-02']._id,
      latestVitals: {
        heartRate: 128,
        systolicBP: 84,
        diastolicBP: 52,
        spo2: 89,
        respiratoryRate: 28,
        temperature: 39.3,
        isAbnormal: true,
        timestamp: new Date(),
      },
      chartNotes: [
        {
          author: doctor1._id,
          authorName: doctor1.name,
          authorRole: 'doctor',
          note: 'Initiate sepsis bundle: IV crystalloid bolus 30mL/kg, broad-spectrum Vancomycin + Zosyn, titrate Levophed for MAP > 65.',
          category: 'Doctor Order',
          timestamp: new Date(Date.now() - 7200 * 1000),
        },
      ],
    });
    bedMap['ICU-02'].currentPatient = p2._id;
    bedMap['ICU-02'].status = 'occupied';
    await bedMap['ICU-02'].save();

    // Patient 3: Polytrauma in ICU-03
    const p3 = await Patient.create({
      mrn: 'MRN-55401',
      fullName: 'David Sterling',
      age: 42,
      gender: 'Male',
      bloodGroup: 'B-',
      allergies: ['None known'],
      chiefComplaint: 'High-speed motor vehicle collision with bilateral rib fractures and flail chest',
      diagnosis: 'Severe Polytrauma, Hemothorax s/p Chest Tube Insertion',
      status: 'admitted',
      triagePriority: 'CRITICAL',
      esiScore: 1,
      assignedDoctor: doctor1._id,
      assignedNurse: nurse2._id,
      currentBed: bedMap['ICU-03']._id,
      latestVitals: {
        heartRate: 108,
        systolicBP: 105,
        diastolicBP: 68,
        spo2: 93,
        respiratoryRate: 24,
        temperature: 36.8,
        isAbnormal: false,
        timestamp: new Date(),
      },
    });
    bedMap['ICU-03'].currentPatient = p3._id;
    bedMap['ICU-03'].status = 'occupied';
    await bedMap['ICU-03'].save();

    // Patient 4: Severe Asthma in ER-01
    const p4 = await Patient.create({
      mrn: 'MRN-78219',
      fullName: 'Emily Watson',
      age: 31,
      gender: 'Female',
      bloodGroup: 'O-',
      allergies: ['Latex'],
      chiefComplaint: 'Acute inspiratory/expiratory wheezing refractory to home inhaler',
      diagnosis: 'Status Asthmaticus, Acute Respiratory Distress',
      status: 'admitted',
      triagePriority: 'URGENT',
      esiScore: 2,
      assignedDoctor: doctor2._id,
      assignedNurse: nurse1._id,
      currentBed: bedMap['ER-01']._id,
      latestVitals: {
        heartRate: 110,
        systolicBP: 135,
        diastolicBP: 85,
        spo2: 91,
        respiratoryRate: 26,
        temperature: 37.1,
        isAbnormal: true,
        timestamp: new Date(),
      },
    });
    bedMap['ER-01'].currentPatient = p4._id;
    bedMap['ER-01'].status = 'occupied';
    await bedMap['ER-01'].save();

    // Patient 5: Unstable Angina in CARD-01
    const p5 = await Patient.create({
      mrn: 'MRN-90234',
      fullName: 'Linda Kowalski',
      age: 64,
      gender: 'Female',
      bloodGroup: 'AB+',
      allergies: ['Iodine Contrast'],
      chiefComplaint: 'Recurrent exertional retrosternal angina',
      diagnosis: 'Unstable Angina, Coronary Artery Disease',
      status: 'admitted',
      triagePriority: 'URGENT',
      esiScore: 2,
      assignedDoctor: doctor2._id,
      assignedNurse: nurse1._id,
      currentBed: bedMap['CARD-01']._id,
      latestVitals: {
        heartRate: 88,
        systolicBP: 142,
        diastolicBP: 88,
        spo2: 96,
        respiratoryRate: 18,
        temperature: 36.9,
        isAbnormal: false,
        timestamp: new Date(),
      },
    });
    bedMap['CARD-01'].currentPatient = p5._id;
    bedMap['CARD-01'].status = 'occupied';
    await bedMap['CARD-01'].save();

    // Patient 6: Post-op in GEN-01
    const p6 = await Patient.create({
      mrn: 'MRN-44210',
      fullName: 'Thomas Brooks',
      age: 47,
      gender: 'Male',
      bloodGroup: 'A-',
      allergies: ['Codeine'],
      chiefComplaint: 'Post-laparoscopic appendectomy day 1 recovery',
      diagnosis: 'Acute Appendicitis s/p Appendectomy',
      status: 'admitted',
      triagePriority: 'STABLE',
      esiScore: 4,
      assignedDoctor: doctor2._id,
      assignedNurse: nurse1._id,
      currentBed: bedMap['GEN-01']._id,
      latestVitals: {
        heartRate: 72,
        systolicBP: 118,
        diastolicBP: 76,
        spo2: 99,
        respiratoryRate: 14,
        temperature: 36.8,
        isAbnormal: false,
        timestamp: new Date(),
      },
    });
    bedMap['GEN-01'].currentPatient = p6._id;
    bedMap['GEN-01'].status = 'occupied';
    await bedMap['GEN-01'].save();

    // Mark bed ER-02 as cleaning
    bedMap['ER-02'].status = 'cleaning';
    await bedMap['ER-02'].save();

    console.log('[Seeder] Generating clinical tasks and operational alerts...');

    await Task.create([
      {
        title: 'Titrate Norepinephrine infusion',
        description: 'Target MAP > 65 mmHg for Maria Hernandez (ICU-02)',
        priority: 'CRITICAL',
        assignedTo: nurse2._id,
        patient: p2._id,
        bed: bedMap['ICU-02']._id,
        category: 'Medication',
        status: 'in_progress',
        autoGeneratedByAI: true,
      },
      {
        title: 'Repeat Troponin I & 12-Lead ECG at 4 hours',
        description: 'Follow-up cardiac enzyme panel for Arthur Pendelton (ICU-01)',
        priority: 'HIGH',
        assignedTo: nurse2._id,
        patient: p1._id,
        bed: bedMap['ICU-01']._id,
        category: 'Lab Work',
        status: 'pending',
        autoGeneratedByAI: true,
      },
      {
        title: 'Continuous Albuterol/Ipratropium Nebulizer',
        description: 'Deliver 3 back-to-back treatments for Emily Watson (ER-01)',
        priority: 'HIGH',
        assignedTo: nurse1._id,
        patient: p4._id,
        bed: bedMap['ER-01']._id,
        category: 'Medication',
        status: 'completed',
        autoGeneratedByAI: true,
      },
    ]);

    await SystemAlert.create([
      {
        alertType: 'ICU_CAPACITY_FULL',
        severity: 'WARNING',
        title: 'ICU Bed Capacity Alert (75% Saturated)',
        message: 'Intensive Care Unit has 3 of 4 active beds occupied. Only Bed ICU-04 remains available. Consider triage diversion or step-down transfers.',
        ward: 'ICU',
        isResolved: false,
      },
      {
        alertType: 'CRITICAL_VITALS_BREACH',
        severity: 'CRITICAL',
        title: 'Telemetry Desaturation: Maria Hernandez',
        message: 'Bed ICU-02: Patient SpO2 dropped below 90% (89%). Respiratory rate elevated to 28 bpm. Physician attention requested.',
        ward: 'ICU',
        relatedPatient: p2._id,
        relatedBed: bedMap['ICU-02']._id,
        isResolved: false,
      },
    ]);

    console.log('[Seeder] ============================================');
    console.log('[Seeder] Hospital Database Seeded Successfully!');
    console.log('[Seeder] Demo Credentials:');
    console.log('[Seeder]   Doctor: dr.chen@hospital.org / password123');
    console.log('[Seeder]   Doctor: dr.vance@hospital.org / password123');
    console.log('[Seeder]   Nurse:  nurse.elena@hospital.org / password123');
    console.log('[Seeder]   Nurse:  nurse.james@hospital.org / password123');
    console.log('[Seeder] ============================================');

    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error('[Seeder] Error seeding data:', error);
    process.exit(1);
  }
};

seedHospitalData();

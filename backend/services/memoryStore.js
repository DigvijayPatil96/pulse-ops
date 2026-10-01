const bcrypt = require('bcryptjs');

class MemoryStore {
  constructor() {
    this.users = [];
    this.beds = [];
    this.patients = [];
    this.tasks = [];
    this.alerts = [];
    this.triageRecords = [];
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;

    console.log('[Memory Store] Initializing in-memory clinical database with seed data...');

    // Doctors & Nurses
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const doc1 = {
      _id: 'doc-001',
      name: 'Dr. Sarah Chen, MD',
      email: 'dr.chen@hospital.org',
      password: hashedPassword,
      role: 'doctor',
      department: 'ICU',
      specialty: 'Intensive Care & Pulmonology',
      availabilityStatus: 'available',
      activePatientCount: 2,
      phone: 'ext-4091',
    };

    const doc2 = {
      _id: 'doc-002',
      name: 'Dr. Marcus Vance, MD',
      email: 'dr.vance@hospital.org',
      password: hashedPassword,
      role: 'doctor',
      department: 'Emergency',
      specialty: 'Emergency Medicine',
      availabilityStatus: 'available',
      activePatientCount: 2,
      phone: 'ext-4092',
    };

    const nurse1 = {
      _id: 'nurse-001',
      name: 'Elena Rostova, RN',
      email: 'nurse.elena@hospital.org',
      password: hashedPassword,
      role: 'nurse',
      department: 'Emergency',
      specialty: 'Trauma & Triage Intake',
      availabilityStatus: 'available',
      activePatientCount: 3,
      phone: 'ext-3021',
    };

    const nurse2 = {
      _id: 'nurse-002',
      name: 'James Miller, BSN',
      email: 'nurse.james@hospital.org',
      password: hashedPassword,
      role: 'nurse',
      department: 'ICU',
      specialty: 'Critical Care Monitoring',
      availabilityStatus: 'available',
      activePatientCount: 2,
      phone: 'ext-3022',
    };

    this.users = [doc1, doc2, nurse1, nurse2];

    // Beds
    const wards = ['ICU', 'Emergency', 'Cardiology', 'General'];
    const bedList = [];

    // ICU Beds
    for (let i = 1; i <= 4; i++) {
      bedList.push({
        _id: `bed-icu-0${i}`,
        bedNumber: `ICU-0${i}`,
        ward: 'ICU',
        status: i <= 3 ? 'occupied' : 'available',
        currentPatient: null,
        isTelemetryActive: true,
        floor: 3,
        equipment: ['Ventilator', 'Multiparameter Monitor', 'Infusion Array'],
      });
    }

    // Emergency Beds
    for (let i = 1; i <= 4; i++) {
      bedList.push({
        _id: `bed-er-0${i}`,
        bedNumber: `ER-0${i}`,
        ward: 'Emergency',
        status: i === 1 ? 'occupied' : i === 2 ? 'cleaning' : 'available',
        currentPatient: null,
        isTelemetryActive: true,
        floor: 1,
        equipment: ['Crash Cart', 'Mobile Telemetry'],
      });
    }

    // Cardiology Beds
    for (let i = 1; i <= 4; i++) {
      bedList.push({
        _id: `bed-card-0${i}`,
        bedNumber: `CARD-0${i}`,
        ward: 'Cardiology',
        status: i === 1 ? 'occupied' : 'available',
        currentPatient: null,
        isTelemetryActive: true,
        floor: 2,
        equipment: ['12-Lead Continuous ECG', 'Pacemaker Monitor'],
      });
    }

    // General Beds
    for (let i = 1; i <= 4; i++) {
      bedList.push({
        _id: `bed-gen-0${i}`,
        bedNumber: `GEN-0${i}`,
        ward: 'General',
        status: i === 1 ? 'occupied' : 'available',
        currentPatient: null,
        isTelemetryActive: true,
        floor: 2,
        equipment: ['Pulse Oximeter'],
      });
    }

    this.beds = bedList;

    // Patients
    const p1 = {
      _id: 'pat-001',
      mrn: 'MRN-10824',
      fullName: 'Arthur Pendelton',
      age: 68,
      gender: 'Male',
      bloodGroup: 'O+',
      allergies: ['Penicillin'],
      chiefComplaint: 'Acute substernal chest pressure radiating to left jaw',
      diagnosis: 'Acute Anterior STEMI s/p Emergency PCI',
      status: 'admitted',
      triagePriority: 'CRITICAL',
      esiScore: 1,
      assignedDoctor: doc1,
      assignedNurse: nurse2,
      currentBed: { _id: this.beds[0]._id, bedNumber: this.beds[0].bedNumber, ward: this.beds[0].ward },
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
          _id: 'note-001',
          author: doc1._id,
          authorName: doc1.name,
          authorRole: 'doctor',
          note: 'PCI completed with drug-eluting stent to LAD. Dual antiplatelet therapy started. Continue continuous ST-segment monitoring.',
          category: 'Doctor Order',
          timestamp: new Date(Date.now() - 3600 * 1000),
        },
      ],
      admissionDate: new Date(Date.now() - 14400 * 1000),
    };
    this.beds[0].currentPatient = p1;

    const p2 = {
      _id: 'pat-002',
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
      assignedDoctor: doc1,
      assignedNurse: nurse2,
      currentBed: { _id: this.beds[1]._id, bedNumber: this.beds[1].bedNumber, ward: this.beds[1].ward },
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
          _id: 'note-002',
          author: doc1._id,
          authorName: doc1.name,
          authorRole: 'doctor',
          note: 'Initiate sepsis bundle: IV crystalloid bolus 30mL/kg, broad-spectrum Vancomycin + Zosyn, titrate Levophed for MAP > 65.',
          category: 'Doctor Order',
          timestamp: new Date(Date.now() - 7200 * 1000),
        },
      ],
      admissionDate: new Date(Date.now() - 28800 * 1000),
    };
    this.beds[1].currentPatient = p2;

    const p3 = {
      _id: 'pat-003',
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
      assignedDoctor: doc1,
      assignedNurse: nurse2,
      currentBed: { _id: this.beds[2]._id, bedNumber: this.beds[2].bedNumber, ward: this.beds[2].ward },
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
      admissionDate: new Date(Date.now() - 40000 * 1000),
    };
    this.beds[2].currentPatient = p3;

    const p4 = {
      _id: 'pat-004',
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
      assignedDoctor: doc2,
      assignedNurse: nurse1,
      currentBed: { _id: this.beds[4]._id, bedNumber: this.beds[4].bedNumber, ward: this.beds[4].ward },
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
      admissionDate: new Date(Date.now() - 10000 * 1000),
    };
    this.beds[4].currentPatient = p4;

    const p5 = {
      _id: 'pat-005',
      mrn: 'MRN-90234',
      fullName: 'Linda Kowalski',
      age: 64,
      gender: 'Female',
      bloodGroup: 'AB+',
      allergies: ['Iodine'],
      chiefComplaint: 'Recurrent exertional retrosternal angina',
      diagnosis: 'Unstable Angina, Coronary Artery Disease',
      status: 'admitted',
      triagePriority: 'URGENT',
      esiScore: 2,
      assignedDoctor: doc2,
      assignedNurse: nurse1,
      currentBed: { _id: this.beds[8]._id, bedNumber: this.beds[8].bedNumber, ward: this.beds[8].ward },
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
      admissionDate: new Date(Date.now() - 20000 * 1000),
    };
    this.beds[8].currentPatient = p5;

    const p6 = {
      _id: 'pat-006',
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
      assignedDoctor: doc2,
      assignedNurse: nurse1,
      currentBed: { _id: this.beds[12]._id, bedNumber: this.beds[12].bedNumber, ward: this.beds[12].ward },
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
      admissionDate: new Date(Date.now() - 50000 * 1000),
    };
    this.beds[12].currentPatient = p6;

    this.patients = [p1, p2, p3, p4, p5, p6];

    // Tasks
    this.tasks = [
      {
        _id: 'task-001',
        title: 'Titrate Norepinephrine infusion',
        description: 'Target MAP > 65 mmHg for Maria Hernandez (ICU-02)',
        priority: 'CRITICAL',
        assignedTo: nurse2,
        patient: { _id: p2._id, fullName: p2.fullName, mrn: p2.mrn },
        bed: { _id: this.beds[1]._id, bedNumber: this.beds[1].bedNumber, ward: this.beds[1].ward },
        category: 'Medication',
        status: 'in_progress',
        autoGeneratedByAI: true,
        createdAt: new Date(),
      },
      {
        _id: 'task-002',
        title: 'Repeat Troponin I & 12-Lead ECG at 4 hours',
        description: 'Follow-up cardiac enzyme panel for Arthur Pendelton (ICU-01)',
        priority: 'HIGH',
        assignedTo: nurse2,
        patient: { _id: p1._id, fullName: p1.fullName, mrn: p1.mrn },
        bed: { _id: this.beds[0]._id, bedNumber: this.beds[0].bedNumber, ward: this.beds[0].ward },
        category: 'Lab Work',
        status: 'pending',
        autoGeneratedByAI: true,
        createdAt: new Date(),
      },
      {
        _id: 'task-003',
        title: 'Continuous Albuterol/Ipratropium Nebulizer',
        description: 'Deliver 3 back-to-back treatments for Emily Watson (ER-01)',
        priority: 'HIGH',
        assignedTo: nurse1,
        patient: { _id: p4._id, fullName: p4.fullName, mrn: p4.mrn },
        bed: { _id: this.beds[4]._id, bedNumber: this.beds[4].bedNumber, ward: this.beds[4].ward },
        category: 'Medication',
        status: 'completed',
        autoGeneratedByAI: true,
        createdAt: new Date(),
      },
    ];

    // Alerts
    this.alerts = [
      {
        _id: 'alert-001',
        alertType: 'ICU_CAPACITY_FULL',
        severity: 'WARNING',
        title: 'ICU Bed Capacity Alert (75% Saturated)',
        message:
          'Intensive Care Unit has 3 of 4 active beds occupied. Only Bed ICU-04 remains available. Consider triage diversion or step-down transfers.',
        ward: 'ICU',
        isResolved: false,
        createdAt: new Date(),
      },
      {
        _id: 'alert-002',
        alertType: 'CRITICAL_VITALS_BREACH',
        severity: 'CRITICAL',
        title: 'Telemetry Desaturation: Maria Hernandez',
        message:
          'Bed ICU-02: Patient SpO2 dropped below 90% (89%). Respiratory rate elevated to 28 bpm. Immediate physician bedside evaluation required.',
        ward: 'ICU',
        relatedPatient: { _id: p2._id, fullName: p2.fullName, mrn: p2.mrn },
        relatedBed: { _id: this.beds[1]._id, bedNumber: this.beds[1].bedNumber, ward: this.beds[1].ward },
        isResolved: false,
        createdAt: new Date(),
      },
    ];

    this.initialized = true;
    console.log('[Memory Store] Initialized with 16 beds, 6 patients, 4 staff members, and real-time alerts.');
  }
}

const memoryStore = new MemoryStore();
module.exports = memoryStore;

const { z } = require('zod');

const patientAdmissionSchema = z.object({
  fullName: z.string().min(2, 'Patient full name is required'),
  age: z.number().int().min(0).max(130, 'Invalid age'),
  gender: z.enum(['Male', 'Female', 'Other']),
  bloodGroup: z.string().optional(),
  allergies: z.array(z.string()).optional(),
  chiefComplaint: z.string().min(3, 'Chief complaint is required'),
  diagnosis: z.string().optional(),
  status: z.enum(['triage', 'admitted', 'icu_transfer_requested', 'discharged']).optional(),
  initialVitals: z
    .object({
      heartRate: z.number().min(20).max(280),
      systolicBP: z.number().min(40).max(300),
      diastolicBP: z.number().min(30).max(200),
      spo2: z.number().min(40).max(100),
      respiratoryRate: z.number().min(4).max(70),
      temperature: z.number().min(30).max(45),
    })
    .optional(),
});

const vitalsUpdateSchema = z.object({
  heartRate: z.number().min(20).max(280),
  systolicBP: z.number().min(40).max(300),
  diastolicBP: z.number().min(30).max(200),
  spo2: z.number().min(40).max(100),
  respiratoryRate: z.number().min(4).max(70),
  temperature: z.number().min(30).max(45),
});

const chartNoteSchema = z.object({
  note: z.string().min(2, 'Note content is required'),
  category: z.enum(['Progress Note', 'Doctor Order', 'Nursing Assessment', 'Triage Intake', 'Medication']).optional(),
});

module.exports = {
  patientAdmissionSchema,
  vitalsUpdateSchema,
  chartNoteSchema,
};

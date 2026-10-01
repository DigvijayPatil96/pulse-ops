const { z } = require('zod');

const triageIntakeSchema = z.object({
  patientId: z.string().min(1, 'Patient ID is required'),
  chiefComplaint: z.string().min(3, 'Chief complaint is required'),
  symptoms: z.array(z.string()).default([]),
  nurseNotes: z.string().min(5, 'Nurse assessment observations are required'),
  vitals: z.object({
    heartRate: z.number().min(20).max(280),
    systolicBP: z.number().min(40).max(300),
    diastolicBP: z.number().min(30).max(200),
    spo2: z.number().min(40).max(100),
    respiratoryRate: z.number().min(4).max(70),
    temperature: z.number().min(30).max(45),
  }),
});

module.exports = {
  triageIntakeSchema,
};

const express = require('express');
const router = express.Router();
const {
  getPatients,
  getPatientById,
  admitPatient,
  updatePatientVitals,
  addChartNote,
} = require('../controllers/patientController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const {
  patientAdmissionSchema,
  vitalsUpdateSchema,
  chartNoteSchema,
} = require('../validators/patientValidators');

router.use(protect);

router.route('/')
  .get(getPatients)
  .post(validate(patientAdmissionSchema), admitPatient);

router.route('/:id')
  .get(getPatientById);

router.patch('/:id/vitals', validate(vitalsUpdateSchema), updatePatientVitals);
router.post('/:id/chart-notes', validate(chartNoteSchema), addChartNote);

module.exports = router;

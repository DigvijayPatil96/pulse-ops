const express = require('express');
const router = express.Router();
const { evaluateTriage, getTriageHistory } = require('../controllers/triageController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const { triageIntakeSchema } = require('../validators/triageValidators');

router.use(protect);

router.post('/evaluate', validate(triageIntakeSchema), evaluateTriage);
router.get('/history', getTriageHistory);

module.exports = router;

const express = require('express');
const router = express.Router();
const {
  getBeds,
  assignPatientToBed,
  releaseBed,
  updateBedStatus,
} = require('../controllers/bedController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getBeds);
router.patch('/:id/assign', assignPatientToBed);
router.patch('/:id/release', releaseBed);
router.patch('/:id/status', updateBedStatus);

module.exports = router;

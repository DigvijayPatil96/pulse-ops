const express = require('express');
const router = express.Router();
const { getAlerts, resolveAlert, triggerAudit } = require('../controllers/alertController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getAlerts);
router.patch('/:id/resolve', resolveAlert);
router.post('/audit', triggerAudit);

module.exports = router;

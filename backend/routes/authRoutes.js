const express = require('express');
const router = express.Router();
const { register, login, getMe, getStaffList } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const { loginSchema, registerSchema } = require('../validators/authValidators');

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.get('/me', protect, getMe);
router.get('/staff', protect, getStaffList);

module.exports = router;

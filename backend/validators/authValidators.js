const { z } = require('zod');

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['doctor', 'nurse', 'admin'], {
    errorMap: () => ({ message: 'Role must be doctor, nurse, or admin' }),
  }),
  department: z.enum(['Emergency', 'ICU', 'Cardiology', 'General', 'Neurology', 'Pediatrics']).optional(),
  specialty: z.string().optional(),
});

module.exports = {
  loginSchema,
  registerSchema,
};

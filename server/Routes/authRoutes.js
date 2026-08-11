import express from 'express';
import { loginUser, registerUser, registerSuperAdmin, updatePassword, deleteUser, updateUser, getUsers } from '../Controllers/auth.js';
import { protect, superadmin } from '../Middleware/auth.js';

const router = express.Router();

router.post('/login', loginUser);
router.post('/register', protect, superadmin, registerUser);
router.post('/register-superadmin' , registerSuperAdmin) ;
// routes/auth.js
router.get('/users', protect, superadmin, getUsers);
router.put('/users/:id', protect, superadmin, updateUser);
router.delete('/users/:id', protect, superadmin, deleteUser);
router.put('/users/:id/password', protect, superadmin, updatePassword);

export default router;
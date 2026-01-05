import express from 'express';
import userRoutes from './auth/auth.routes';

const router = express.Router();

//Admin Routes
router.use('/user/auth', userRoutes);

export default router;

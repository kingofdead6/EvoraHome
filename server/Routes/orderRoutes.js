// routes/orderRoutes.js
import express from 'express';
import { createOrder , getAllOrders , updateOrderStatus } from '../Controllers/orderController.js';

const router = express.Router();

router.post('/create', createOrder);
router.get('/', getAllOrders);
router.put('/:id/status', updateOrderStatus);
export default router;
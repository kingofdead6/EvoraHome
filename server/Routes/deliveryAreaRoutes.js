import express from 'express';
import { protect, admin } from '../Middleware/auth.js';
import {
  getDeliveryAreas,
  createDeliveryArea,
  updateDeliveryArea,
  deleteDeliveryArea,
} from '../Controllers/deliveryAreaController.js';

const router = express.Router();

router.get('/', getDeliveryAreas);                    
router.post('/',  createDeliveryArea); 
router.put('/:id', protect, admin, updateDeliveryArea);
router.delete('/:id', protect, admin, deleteDeliveryArea);

export default router;
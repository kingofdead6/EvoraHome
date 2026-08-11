import express from 'express';
import {
  createContact,
  getAllContacts,
  deleteContact,
} from '../Controllers/contactController.js';

const router = express.Router();

// Public route
router.post('/', createContact);

// Admin routes
router.get('/', getAllContacts);
router.delete('/:id', deleteContact);

export default router;
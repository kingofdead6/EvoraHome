import express from 'express';
import multer from 'multer';
import { protect, admin } from '../Middleware/auth.js';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../Controllers/productController.js';

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'), false);
  },
});

// Public
router.get('/', getProducts);
router.get('/:id', getProductById);

// Admin
router.post('/', protect, admin, upload.array('images', 8), createProduct);
router.put('/:id', protect, admin, upload.array('images', 8), updateProduct);
router.delete('/:id', protect, admin, deleteProduct);

export default router;

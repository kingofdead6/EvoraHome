import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';

import { errorHandler } from './Middleware/error.js';

import authRoutes from './Routes/authRoutes.js';
import productRoutes from './Routes/productRoutes.js';
import categoryRoutes from './Routes/categoryRoutes.js';
import deliveryAreaRoutes from './Routes/deliveryAreaRoutes.js';
import orderRoutes from './Routes/orderRoutes.js';
import contactRoutes from './Routes/contactRoutes.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log(err));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/delivery-areas', deliveryAreaRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/contact', contactRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

import asyncHandler from 'express-async-handler';
import Product from '../Models/Product.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';

const slugify = (name) =>
  name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');

export const getProducts = asyncHandler(async (req, res) => {
  const { category, featured } = req.query;
  const query = {};
  if (category) query.category = category;
  if (featured !== undefined) query.featured = featured === 'true';

  const products = await Product.find(query)
    .populate('category', 'name')
    .sort({ createdAt: -1 })
    .lean();
  res.json(products);
});

export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate('category', 'name').lean();
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  res.json(product);
});

export const createProduct = asyncHandler(async (req, res) => {
  const { name, category, price, stock, description, featured } = req.body;

  if (!name || !category || price === undefined) {
    res.status(400);
    throw new Error('Name, category and price are required');
  }

  const images = [];
  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      const url = await uploadToCloudinary(file);
      images.push({ url, public_id: null });
    }
  }

  const product = await Product.create({
    name: name.trim(),
    slug: slugify(name),
    category,
    price: Number(price),
    stock: stock !== undefined ? Number(stock) : 0,
    description: description?.trim() || '',
    featured: featured === 'true' || featured === true,
    images,
  });

  res.status(201).json(product);
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const { name, category, price, stock, description, featured } = req.body;
  if (name) {
    product.name = name.trim();
    product.slug = slugify(name);
  }
  if (category) product.category = category;
  if (price !== undefined) product.price = Number(price);
  if (stock !== undefined) product.stock = Number(stock);
  if (description !== undefined) product.description = description.trim();
  if (featured !== undefined) product.featured = featured === 'true' || featured === true;

  if (req.files && req.files.length > 0) {
    const newImages = [];
    for (const file of req.files) {
      const url = await uploadToCloudinary(file);
      newImages.push({ url, public_id: null });
    }
    product.images = [...product.images, ...newImages];
  }

  const updated = await product.save();
  res.json(updated);
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  await product.deleteOne();
  res.json({ message: 'Product deleted' });
});

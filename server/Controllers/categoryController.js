import asyncHandler from 'express-async-handler';
import Category from '../Models/Categories.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinary.js';

export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({}).sort({ name: 1 }).lean();
  res.json(categories);
});

export const getCategoryById = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id).lean();
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }
  res.json(category);
});

export const createCategory = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!name || name.trim().length === 0) {
    res.status(400);
    throw new Error('Category name is required');
  }

  const exists = await Category.findOne({ name: name.trim() });
  if (exists) {
    res.status(400);
    throw new Error('This category already exists');
  }

  let image = { url: null, public_id: null };
  if (req.file) {
    const url = await uploadToCloudinary(req.file);
    image = { url, public_id: null };
  }

  const category = await Category.create({
    name: name.trim(),
    description: description ? description.trim() : '',
    image,
  });

  res.status(201).json(category);
});

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  const { name, description } = req.body;
  if (name) category.name = name.trim();
  if (description !== undefined) category.description = description.trim();

  if (req.file) {
    const url = await uploadToCloudinary(req.file);
    category.image = { url, public_id: null };
  }

  const updated = await category.save();
  res.json(updated);
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  if (category.image?.public_id) {
    await deleteFromCloudinary(category.image.public_id).catch(() => {});
  }

  await category.deleteOne();
  res.json({ message: 'Category deleted' });
});

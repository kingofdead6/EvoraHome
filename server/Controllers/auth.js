import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import User from '../Models/User.js';
import validator from 'validator';

// Login user
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  console.log('Login attempt:', { email });

  if (!email || !validator.isEmail(email)) {
    console.error('Invalid email');
    res.status(400);
    throw new Error('Valid email is required');
  }
  if (!password) {
    console.error('Password required');
    res.status(400);
    throw new Error('Password is required');
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    console.error('Invalid credentials');
    res.status(401);
    throw new Error('Invalid email or password');
  }

  const token = jwt.sign(
    { id: user._id, usertype: user.usertype },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );

  console.log('Login successful:', { userId: user._id, usertype: user.usertype });
  res.status(200).json({ token, usertype: user.usertype });
});

// Register user (superadmin only)
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, usertype } = req.body;
  console.log('Register user request:', { name, email, usertype });

  if (!name || !validator.isLength(name, { min: 1, max: 100 })) {
    console.error('Invalid name');
    res.status(400);
    throw new Error('Valid name required');
  }
  if (!email || !validator.isEmail(email)) {
    console.error('Invalid email');
    res.status(400);
    throw new Error('Valid email required');
  }
  if (!password || password.length < 6) {
    console.error('Invalid password');
    res.status(400);
    throw new Error('Password must be at least 6 characters');
  }
  if (!usertype || !['user', 'admin', 'superadmin'].includes(usertype)) {
    console.error('Invalid usertype');
    res.status(400);
    throw new Error('Valid usertype required');
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    console.error('Email already exists');
    res.status(400);
    throw new Error('Email already exists');
  }

  const user = await User.create({ name, email, password, usertype });
  console.log('User registered:', user._id);
  res.status(201).json({ id: user._id, name, email, usertype });
});

// Get all users (superadmin only)
export const getUsers = asyncHandler(async (req, res) => {
  console.log('Fetching all users');
  const users = await User.find({}).select('-password').lean();
  console.log('Retrieved users:', users.length);
  res.status(200).json(users);
});

// Update user (superadmin only)
export const updateUser = asyncHandler(async (req, res) => {
  const { name, email, usertype } = req.body;
  console.log('Update user request:', { id: req.params.id, name, email, usertype });

  const user = await User.findById(req.params.id);
  if (!user) {
    console.error('User not found:', req.params.id);
    res.status(404);
    throw new Error('User not found');
  }

  if (name) user.name = name;
  if (email) user.email = email;
  if (usertype) user.usertype = usertype;

  await user.save();
  console.log('User updated:', user._id);
  res.status(200).json({ id: user._id, name: user.name, email: user.email, usertype: user.usertype });
});

// Delete user (superadmin only)
export const deleteUser = asyncHandler(async (req, res) => {
  console.log('Delete user request:', req.params.id);
  const user = await User.findById(req.params.id);
  if (!user) {
    console.error('User not found:', req.params.id);
    res.status(404);
    throw new Error('User not found');
  }
  if (user.usertype === 'superadmin') {
    console.error('Cannot delete superadmin');
    res.status(400);
    throw new Error('Cannot delete superadmin');
  }
  await User.deleteOne({ _id: req.params.id });
  console.log('User deleted:', req.params.id);
  res.status(200).json({ message: 'User deleted' });
});

// Register Super Admin 
export const registerSuperAdmin = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  console.log('Register superadmin request:', { name, email });

  // ✅ Validation
  if (!name || !validator.isLength(name, { min: 1, max: 100 })) {
    console.error('Invalid name');
    res.status(400);
    throw new Error('Valid name required');
  }
  if (!email || !validator.isEmail(email)) {
    console.error('Invalid email');
    res.status(400);
    throw new Error('Valid email required');
  }
  if (!password || password.length < 6) {
    console.error('Invalid password');
    res.status(400);
    throw new Error('Password must be at least 6 characters');
  }


  // ✅ Prevent duplicate email
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    console.error('Email already exists');
    res.status(400);
    throw new Error('Email already exists');
  }

  // ✅ Create superadmin
  const superAdmin = await User.create({
    name,
    email,
    password,
    usertype: 'superadmin',
  });

  console.log('Superadmin registered successfully:', superAdmin._id);
  res.status(201).json({
    id: superAdmin._id,
    name: superAdmin.name,
    email: superAdmin.email,
    usertype: superAdmin.usertype,
  });
});

export const updatePassword = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
  if (!user) throw new Error("User not found");
  user.password = req.body.password;
  await user.save();
  res.json({ message: "Password updated" });
});
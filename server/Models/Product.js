import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
    default: '',
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  images: [
    {
      url: { type: String, required: true },
      public_id: { type: String, default: null },
    },
  ],
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  stock: {
    type: Number,
    default: 0,
    min: 0,
  },
  featured: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

export default mongoose.model('Product', productSchema);

import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  customerName: { type: String, required: true, trim: true },
  customerEmail: { type: String, trim: true },
  phone: { type: String, required: true, trim: true },
  
  wilaya: { type: String, required: true },
  address: { type: String },
  desk: { type: String },
  deliveryType: { type: String, enum: ['home', 'desk'], required: true },
  
  deliveryPrice: { type: Number, default: 0 },
  
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    price: Number,
    image: String,
    quantity: Number,
  }],

  subtotal: { type: Number, required: true },
  totalPrice: { type: Number, required: true },

  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in_delivery', 'reached', 'canceled'],
    default: 'pending'
  }
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);
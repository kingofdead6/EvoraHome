import mongoose from 'mongoose';

const deliveryAreaSchema = new mongoose.Schema({
  wilaya: { type: String, required: true, trim: true },
  priceHome: { type: Number, default: 600 },
  priceDesk: { type: Number, default: 700 },
  desks: [{name: { type: String, required: true }}],
});

deliveryAreaSchema.index({ wilaya: 1 }, { unique: true });

export default mongoose.model('DeliveryArea', deliveryAreaSchema);

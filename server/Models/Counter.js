import mongoose from 'mongoose';

/**
 * Atomic sequence source for order numbers. One document per year, so numbering
 * restarts at EVH-2027-0001 in January.
 *
 * Counting existing orders and adding one is the obvious alternative and it is
 * wrong: two customers checking out in the same second both read the same count
 * and collide on the unique index.
 */
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

const Counter = mongoose.model('Counter', counterSchema);

export async function nextOrderNumber(date = new Date()) {
  const year = date.getFullYear();
  const doc = await Counter.findByIdAndUpdate(
    `order-${year}`,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return `EVH-${year}-${String(doc.seq).padStart(4, '0')}`;
}

export default Counter;

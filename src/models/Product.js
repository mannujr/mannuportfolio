import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true, min: 0, max: 10000000 },
  imageUrl: { type: String, default: '' },
  type: { type: String, default: '' },
  metal: { type: String, default: '' },
  inStock: { type: Boolean, default: true },
  deletedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
});

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
export default Product;

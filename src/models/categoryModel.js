import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 100
  },
  subcategories: [String]
}, { timestamps: true });

const Category = mongoose.model('Category', categorySchema);

export default Category;

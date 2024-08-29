import mongoose from 'mongoose';

// Definir el esquema de producto
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
    index: true
  },
  priceCOP: {
    type: Number,
    required: true,
    min: 0,
    index: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  subcategory: {
    type: String,
    // Este enum es opcional y puedes eliminarlo si manejas las subcategorías dinámicamente desde el modelo Category
  },
  description: {
    type: String,
    required: true,
    maxlength: 500
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  images: [String], // URLs de las imágenes
  sizes: [String],  // Tallas disponibles (para ropa)
  colors: [String], // Colores disponibles (para ropa)
  discount: {
    value: {
      type: Number,
      default: 0,
      min: 0,
      max: 50
    },
    startDate: Date,
    endDate: Date
  }
}, { timestamps: true });

// Índice compuesto para consultas frecuentes
productSchema.index({ category: 1, priceCOP: -1 });

// Método para aplicar el descuento
productSchema.methods.applyDiscount = function () {
  const now = new Date();
  if (this.discount.startDate && this.discount.endDate) {
    if (now >= this.discount.startDate && now <= this.discount.endDate) {
      const discountAmount = this.priceCOP * (this.discount.value / 100);
      return this.priceCOP - discountAmount;
    }
  }
  return this.priceCOP;
};

const Product = mongoose.model('Product', productSchema);

export default Product;

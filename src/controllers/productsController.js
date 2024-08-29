import Product from '../models/productModel.js';
import Category from '../models/categoryModel.js';

export const getProducts = async (req, res) => {
  try {
    const { page = 1, limit = 20, category, subcategory } = req.query;

    // Crear el objeto de consulta
    const query = {};

    // Si se proporciona una categoría, buscar el ObjectId correspondiente
    if (category) {
      const categoryDoc = await Category.findOne({ name: category });
      if (categoryDoc) {
        query.category = categoryDoc._id;
      } else {
        // Si no se encuentra la categoría, devolver un error o una respuesta vacía
        return res.status(404).json({ message: 'Category not found' });
      }
    }

    // Si se proporciona una subcategoría, agregar al query
    if (subcategory) {
      query.subcategory = subcategory;
    }

    // Buscar productos que coincidan con la consulta
    const products = await Product.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    // Aplica el descuento a cada producto
    const productsWithDiscounts = products.map(product => {
      const discountedPrice = product.applyDiscount();
      return {
        ...product.toObject(),
        discountedPrice
      };
    });

    // Contar el total de productos que coinciden con la consulta
    const totalProducts = await Product.countDocuments(query);

    res.status(200).json({
      total: totalProducts,
      products: productsWithDiscounts
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


export const createProduct = async (req, res) => {
  try {
    const { name, priceCOP, categoryId, subcategory, description, quantity, sizes, colors, discount } = req.body;

    // Verificar si la categoría existe
    const category = await Category.findById(categoryId);

    if (!category) {
      return res.status(400).json({ message: 'Category not found' });
    }

    const images = req.files.map(file => file.path)

    // Crear el nuevo producto
    const product = new Product({
      name,
      priceCOP,
      category: categoryId,
      subcategory,
      description,
      quantity,
      images,
      sizes,
      colors,
      discount
    });

    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

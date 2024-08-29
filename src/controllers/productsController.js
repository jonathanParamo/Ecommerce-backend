import Product from '../models/productModel.js';

export const getProducts = async (req, res) => {
  try {
    const { page = 1, limit = 20, category } = req.query;
    const query = {};
    if (category) {
      query.category = category;
    }

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

    const totalProducts = await Product.countDocuments(query);
    res.status(200).json({
      total: totalProducts,
      products: productsWithDiscounts
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

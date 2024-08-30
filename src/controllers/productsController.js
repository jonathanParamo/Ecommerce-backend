import Product from '../models/productModel.js';
import Category from '../models/categoryModel.js';

export const getProducts = async (req, res) => {
  try {
    const { page = 1, limit = 20, category, subcategory } = req.query;

    //  Create the query object
    const query = {};

    // If a category is provided, find the corresponding ObjectId
    if (category) {
      const categoryDoc = await Category.findOne({ name: category });
      if (categoryDoc) {
        query.category = categoryDoc._id;
      } else {
        // If the category is not found, return an error or an empty response
        return res.status(404).json({ message: 'Category not found' });
      }
    }

    // If a subcategory is provided, add it to the queryquery
    if (subcategory) {
      query.subcategory = subcategory;
    }

    // Find products that match the query
    const products = await Product.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    // Apply the discount to each product
    const productsWithDiscounts = products.map(product => {
      const discountedPrice = product.applyDiscount();
      return {
        ...product.toObject(),
        discountedPrice
      };
    });

    // Count the total number of products that match the query
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

    // Check if the category exists
    const category = await Category.findById(categoryId);

    if (!category) {
      return res.status(400).json({ message: 'Category not found' });
    }

    const images = req.files.map(file => file.path)

    // Create the new product
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


export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { categoryId, subcategory, ...updateData } = req.body;

    // If there are new images, add the URLs to the existing images
    let images = req.body.images || [];
    if (req.files && req.files.length > 0) {
      const newImageUrls = req.files.map((file) => file.path);
      images = images.concat(newImageUrls);
    }

    // Check if the category exists
    if (categoryId) {
      const category = await Category.findById(categoryId);
      if (!category) {
        return res.status(400).json({ message: 'Categoría no encontrada' });
      }
      updateData.category = categoryId;
    }

    // Check if the subcategory is valid within the category
    if (subcategory && categoryId) {
      const category = await Category.findById(categoryId);
      if (!category.subcategories.includes(subcategory)) {
        return res.status(400).json({ message: 'Subcategoría no válida para la categoría seleccionada' });
      }
      updateData.subcategory = subcategory;
    }

    // If there are images in the request, add them to the update object
    if (req.files) {
      const imageUrls = req.files.map(file => file.path);
      updateData.images = imageUrls;
    }

    // Update the product
    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    res.status(200).json(updatedProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


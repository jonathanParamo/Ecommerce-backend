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
    const {
      name,
      priceCOP,
      categoryId,
      subcategory,
      description,
      quantity,
      sizes,
      colors,
      discount,
    } = req.body;

    // Check if the category exists
    const category = await Category.findById(categoryId);

    if (!category) {
      return res.status(400).json({ message: 'Category not found' });
    }

    const discountObject = discount ? JSON.parse(discount) : {};

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
      discount: discountObject
    });

    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


export const updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    // Destructuring request body to get product details
    const {
      name,
      priceCOP,
      categoryId,
      subcategory,
      description,
      quantity,
      sizes,
      colors,
      discount
    } = req.body;

    const discountObject = discount ? JSON.parse(discount) : {};

    // Verify if the product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Combine existing images with new images
    let newImages = product.images || [];
    if (req.files && req.files.length > product.images.length) {
      const newImageUrls = req.files.map((file) => file.path);
      newImages = [...new Set([...images, ...newImageUrls])]; // Avoid duplicates
    }

    // Prepare the update data object
    const updateData = {
      name: name || product.name,
      priceCOP: priceCOP || product.priceCOP,
      category: categoryId || product.category,
      subcategory: subcategory || product.subcategory,
      description: description || product.description,
      quantity: quantity || product.quantity,
      sizes: sizes ? sizes.split(',').map(size => size.trim()) : product.sizes,
      colors: colors ? colors.split(',').map(color => color.trim()) : product.colors,
      images: newImages
    };

    if (discountObject.value || discountObject.startDate || discountObject.endDate) {
      updateData.discount = {
        value: discountObject.value || product.discount.value,
        startDate: discountObject.startDate ? new Date(discountObject.startDate) : product.discount.startDate,
        endDate: discountObject.endDate ? new Date(discountObject.endDate) : product.discount.endDate,
      };
    } else {
      updateData.discount = product.discount; // Keep existing discount if no updates provided
    }

    // Validate and update the category if present
    if (categoryId) {
      const category = await Category.findById(categoryId);
      if (!category) {
        return res.status(400).json({ message: 'Category not found' });
      }
      updateData.category = categoryId;
    }

    // Validate the subcategory if present and the category is valid
    if (subcategory && categoryId) {
      const category = await Category.findById(categoryId);
      if (!category.subcategories.includes(subcategory)) {
        return res.status(400).json({ message: 'Subcategory not valid for the selected category' });
      }
      updateData.subcategory = subcategory;
    }

    // Update the product
    const updatedProduct = await Product.findByIdAndUpdate(productId, updateData, { new: true });

    res.status(200).json(updatedProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


export const deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    // Find the product by ID
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Delete the product from the database
    await Product.findByIdAndDelete(productId);

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product', error });
  }
};


// Endpoint para obtener productos con cantidad menor a 10
export const getProductsLowStock = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    // productos con cantidad menor a 10
    const products = await Product.find({ quantity: { $lt: 10 } })
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

    // Cuenta el total de productos con stock bajo
    const totalProductsLowStock = await Product.countDocuments({ quantity: { $lt: 10 } });

    // Retorna los productos con bajo stock y el total de productos
    res.status(200).json({
      total: totalProductsLowStock,
      products: productsWithDiscounts
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const searchProducts = async (req, res) => {
  try {
    const { query, minPrice, maxPrice, page = 1, limit = 20 } = req.query;

    const filter = {
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { subcategory: { $regex: query, $options: 'i' } }
      ]
    };

    // filtros de precio si se proporcionan
    if (minPrice || maxPrice) {
      filter.priceCOP = {};
      if (minPrice) filter.priceCOP.$gte = Number(minPrice);
      if (maxPrice) filter.priceCOP.$lte = Number(maxPrice);
    }

    // Agregar filtro por descuento
    if (query === 'discounted') {
      filter['discount.value'] = { $gt: 0 };
    }

    const limitNum = parseInt(limit, 10);
    const pageNum = parseInt(page, 10);
    const skip = (pageNum - 1) * limitNum;

    const products = await Product.find(filter).limit(limitNum).skip(skip);
    const total = await Product.countDocuments(filter);

    res.status(200).json({
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      products
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al buscar productos', error });
  }
};


import Category from '../models/categoryModel.js';
import Product from '../models/productModel.js';

//create a category
export const createCategory = async (req, res) => {
  try {
    const { name, subcategories } = req.body.categoryData;
    const category = new Category({ name, subcategories });

    await category.save();
    res.status(201).json(category);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// get all categories
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// get category by id
export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.status(200).json(category);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// update category
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, subcategories } = req.body;

    // Verificar que 'subcategories' sea un array válido
    if (subcategories && !Array.isArray(subcategories)) {
      return res.status(400).json({ message: 'Subcategories should be an array' });
    }

    // Recuperar la categoría actual
    const category = await Category.findById(id);

    if (!category) return res.status(404).json({ message: 'Category not found' });

    // Editar el nombre de la categoría (si está presente en la solicitud)
    if (name) {
      category.name = name;
    }

    if (subcategories) {
      // Obtener las subcategorías actuales
      const currentSubcategories = category.subcategories;

      // Verificar si alguna subcategoría está asociada a productos
      const productsWithSubcategories = await Product.find({ subcategory: { $in: currentSubcategories } });

      const subcategoriesInUse = productsWithSubcategories.map(product => product.subcategory);

      // No permitir cambiar subcategorías asociadas a productos
      const subcategoriesToRemove = currentSubcategories.filter(subcat => !subcategories.includes(subcat));
      const cannotRemove = subcategoriesToRemove.some(subcat => subcategoriesInUse.includes(subcat));

      if (cannotRemove) {
        return res.status(400).json({
          message: 'No se puede eliminar la categoría. Hay productos asociados a esta categoría.',
        });
      }

      // Actualizar las subcategorías
      const subcategoriesToAdd = subcategories.filter(subcat => !currentSubcategories.includes(subcat));

      if (subcategoriesToAdd.length > 0) {
        await Category.findByIdAndUpdate(
          id,
          { $addToSet: { subcategories: { $each: subcategoriesToAdd } } },
          { new: true }
        );
      }

      if (subcategoriesToRemove.length > 0) {
        await Category.findByIdAndUpdate(
          id,
          { $pull: { subcategories: { $in: subcategoriesToRemove } } },
          { new: true }
        );
      }
    }

    // Guardar los cambios (incluyendo el nombre)
    const updatedCategory = await category.save();

    res.status(200).json(updatedCategory);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


// delete category
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const productsInCategory = await Product.find({ category: id });
    if (productsInCategory.length > 0) {
      return res.status(400).json({ message: 'No se puede eliminar la categoría. Hay productos asociados a esta categoría.' });
    }

    const category = await Category.findByIdAndDelete(id);
    if (!category) return res.status(404).json({ message: 'Categoría no encontrada' });
    res.json({ message: 'Categoría eliminada con éxito' })
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

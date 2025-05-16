import Category from '../models/Category.js';

export const getAllCategories = async () => {
  return await Category.find().populate('createdBy', 'name').sort({ name: 1 });
};

export const createNewCategory = async (categoryData, userId) => {
  const category = await Category.create({
    ...categoryData,
    createdBy: userId
  });
  return await Category.findById(category._id).populate('createdBy', 'name');
};

export const updateExistingCategory = async (categoryId, updates) => {
  const category = await Category.findByIdAndUpdate(
    categoryId,
    { $set: updates },
    { new: true }
  ).populate('createdBy', 'name');
  
  if (!category) {
    throw new Error('Category not found');
  }
  
  return category;
};

export const deleteExistingCategory = async (categoryId) => {
  const category = await Category.findById(categoryId);
  
  if (!category) {
    throw new Error('Category not found');
  }
  
  await category.deleteOne();
  return { message: 'Category deleted successfully' };
}; 
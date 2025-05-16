import SpecialDay from '../models/SpecialDay.js';
import { protect, admin } from '../middleware/authMiddleware.js';

// الحصول على جميع الأيام المميزة
export const getSpecialDays = async (req, res) => {
  try {
    const specialDays = await SpecialDay.find().populate('category', 'name color');
    res.json(specialDays);
  } catch (error) {
    console.error('Get special days error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// إنشاء يوم مميز جديد
export const createSpecialDay = async (req, res) => {
  try {
    const { title, description, startDate, endDate, category } = req.body;
    
    if (!title || !startDate || !endDate || !category) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const specialDay = await SpecialDay.create({
      title,
      description,
      startDate,
      endDate,
      category,
      createdBy: req.user._id
    });

    // تحميل معلومات الفئة الكاملة
    const populatedSpecialDay = await SpecialDay.findById(specialDay._id).populate('category', 'name color');
    res.status(201).json(populatedSpecialDay);
  } catch (error) {
    console.error('Create special day error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// تحديث يوم مميز
export const updateSpecialDay = async (req, res) => {
  try {
    const { title, description, startDate, endDate, category } = req.body;
    const specialDay = await SpecialDay.findById(req.params.id);

    if (!specialDay) {
      return res.status(404).json({ message: 'Special day not found' });
    }

    specialDay.title = title || specialDay.title;
    specialDay.description = description || specialDay.description;
    specialDay.startDate = startDate || specialDay.startDate;
    specialDay.endDate = endDate || specialDay.endDate;
    specialDay.category = category || specialDay.category;

    const updatedSpecialDay = await specialDay.save();
    
    // تحميل معلومات الفئة الكاملة
    const populatedSpecialDay = await SpecialDay.findById(updatedSpecialDay._id).populate('category', 'name color');
    res.json(populatedSpecialDay);
  } catch (error) {
    console.error('Update special day error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// حذف يوم مميز
export const deleteSpecialDay = async (req, res) => {
  try {
    const specialDay = await SpecialDay.findById(req.params.id);

    if (!specialDay) {
      return res.status(404).json({ message: 'Special day not found' });
    }

    await specialDay.deleteOne();
    res.json({ message: 'Special day deleted successfully' });
  } catch (error) {
    console.error('Delete special day error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 
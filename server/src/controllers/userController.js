import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// إنشاء توكن JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

// تسجيل الدخول
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt:', { email });

    // التحقق من وجود المستخدم
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found:', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    console.log('User found:', { 
      _id: user._id,
      email: user.email,
      role: user.role
    });

    // التحقق من كلمة المرور
    const isMatch = await user.matchPassword(password);
    console.log('Password match:', isMatch);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // إنشاء التوكن
    const token = generateToken(user._id);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// الحصول على معلومات المستخدم
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// إنشاء مستخدم جديد (للمالك فقط)
export const createUser = async (req, res) => {
  try {
    const { name, email, password, role, systemUsername } = req.body;

    // التحقق من وجود المستخدم
    if (email) {
      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({ message: 'البريد الإلكتروني مستخدم بالفعل' });
      }
    }

    if (systemUsername) {
      const userExists = await User.findOne({ systemUsername });
      if (userExists) {
        return res.status(400).json({ message: 'اسم المستخدم مستخدم بالفعل' });
      }
    }

    // إنشاء المستخدم
    const user = await User.create({
      name,
      email,
      password,
      systemUsername,
      role: role || 'admin'
    });

    // إرجاع البيانات بدون كلمة المرور
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      systemUsername: user.systemUsername
    };

    res.status(201).json(userResponse);
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'حدث خطأ في الخادم' });
  }
};

// تحديث معلومات المستخدم
export const updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, select: '-password' }
    );
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error in updateUser:', error);
    res.status(500).json({ message: 'Error updating user' });
  }
};

// حذف المستخدم
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error in deleteUser:', error);
    res.status(500).json({ message: 'Error deleting user' });
  }
};

// الحصول على قائمة المستخدمين
export const getUsers = async (req, res) => {
  try {
    console.log('Getting users...');
    const users = await User.find({}, '-password');
    console.log('Users found:', users.length);
    res.json(users);
  } catch (error) {
    console.error('Error in getUsers:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
}; 
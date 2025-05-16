import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: function() {
      return !this.systemUsername;
    },
    unique: true,
    sparse: true
  },
  password: {
    type: String,
    required: function() {
      return !this.systemUsername;
    }
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  systemUsername: {
    type: String,
    unique: true,
    sparse: true
  }
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function(enteredPassword) {
  if (!this.password) return true;
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('User', userSchema);
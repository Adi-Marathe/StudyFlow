const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    minlength: 3,
    maxlength: 50
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    match: [
      /^\S+@\S+\.\S+$/,
      'Please use a valid email address',
    ],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 8,
  },
  role: {
    type: String,
    enum: ['Student', 'Teacher', 'Professional'],
    default: 'Student'  // Default value, not required at signup
  },
  bio: {
    type: String,
    maxlength: 150,
    default: ''  // Empty by default, users add it later
  }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);

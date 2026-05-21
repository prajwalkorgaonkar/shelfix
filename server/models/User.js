const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['Admin', 'Student'],
      default: 'Student',
    },
    branch: {
      type: String,
      required: function() { return this.role === 'Student'; }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);

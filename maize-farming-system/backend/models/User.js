const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'farmer'], required: true },
  // If the role is 'farmer', this links their account to a specific farmerId (e.g., 'F001')
  farmerId: { type: String, default: null } 
}, { timestamps: true, collection: 'users' });

module.exports = mongoose.model('User', userSchema);
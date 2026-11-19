const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// We need a secret key for tokens. In a real app, this goes in your .env file.
const JWT_SECRET = process.env.JWT_SECRET || 'maize-super-secret-key-2024';

// REGISTER (We will use this to create the Admin and test Farmers)
exports.register = async (req, res, next) => {
  try {
    const username = (req.body.username || '').trim();
    const password = req.body.password;
    const role = (req.body.role || '').trim();
    const farmerId = (req.body.farmerId || '').trim();

    if (!username || !password || !role) {
      return res.status(400).json({ success: false, message: 'Username, password, and role are required' });
    }

    if (role === 'farmer' && !farmerId) {
      return res.status(400).json({ success: false, message: 'Farmer ID is required for farmer accounts' });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ success: false, message: 'Username already taken' });

    if (role === 'farmer') {
      const Farmer = require('../models/Farmer');
      const farmer = await Farmer.findOne({ farmerId });
      if (!farmer) {
        return res.status(400).json({ success: false, message: `Farmer ID '${farmerId}' does not exist. Register the farmer first.` });
      }

      const existingFarmerAccount = await User.findOne({ role: 'farmer', farmerId });
      if (existingFarmerAccount) {
        return res.status(400).json({ success: false, message: `This farmer already has an account.` });
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      username,
      password: hashedPassword,
      role,
      farmerId: role === 'farmer' ? farmerId : null
    });

    res.status(201).json({ success: true, message: 'User registered successfully', data: user });
  } catch (err) { next(err); }
};

// LOGIN
exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Find user
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    // Generate Token
    const token = jwt.sign(
      { id: user._id, role: user.role, farmerId: user.farmerId },
      JWT_SECRET,
      { expiresIn: '1d' } // Token lasts 1 day
    );

    res.json({
      success: true,
      token,
      user: { username: user.username, role: user.role, farmerId: user.farmerId }
    });
  } catch (err) { next(err); }
};
const mongoose = require('mongoose');

const farmerSchema = new mongoose.Schema(
  {
    farmerId:        { type: String, required: true, unique: true, trim: true },
    name:            { type: String, required: true, trim: true },
    phone:           { type: String, required: true, trim: true, match: /^\+?[0-9]{10,15}$/ },
    district:        { type: String, required: true, trim: true },
    village:         { type: String, required: true, trim: true },
    experienceYears: { type: Number, required: true, min: 0 },
    gender:          { type: String, required: true, enum: ['Male', 'Female', 'Other'] }
  },
  { timestamps: true, collection: 'farmers' }
);

module.exports = mongoose.model('Farmer', farmerSchema);
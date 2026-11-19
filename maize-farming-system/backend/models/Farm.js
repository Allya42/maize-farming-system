const mongoose = require('mongoose');

const farmSchema = new mongoose.Schema(
  {
    farmId:       { type: String, required: true, unique: true, trim: true },
    farmerId:     { type: String, required: true, trim: true, index: true },
    location:     { type: String, required: true, trim: true },
    sizeAcres:    { type: Number, required: true, min: 0.01 },
    soilType:     { type: String, required: true, trim: true },
    maizeVariety: { type: String, required: true, trim: true },
    plantingDate: { type: Date,   required: true },
    status:       { type: String, enum: ['Pending', 'Resolved', 'Rejected', 'Approved'], default: 'Pending' },
    approvedBy:   { type: String, trim: true, default: '' }
  },
  { timestamps: true, collection: 'farms' }
);

module.exports = mongoose.model('Farm', farmSchema);
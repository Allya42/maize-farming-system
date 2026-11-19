const mongoose = require('mongoose');

const harvestReportSchema = new mongoose.Schema(
  {
    harvestId:         { type: String, required: true, unique: true, trim: true },
    farmId:            { type: String, required: true, trim: true, index: true },
    season:            { type: String, required: true, trim: true },
    quantityKg:        { type: Number, required: true, min: 0.01 },
    harvestDate:       { type: Date,   required: true },
    marketPricePerKg:  { type: Number, required: true, min: 0.01 },
    totalRevenue:      { type: Number, required: true, min: 0 }
  },
  { timestamps: true, collection: 'harvestReports' }
);

// Automatically calculate total revenue before saving to the database.
// Use a safe guard so Mongoose can call this hook without a callback in some runtime paths.
harvestReportSchema.pre('save', function (next) {
  const quantityKg = Number(this.quantityKg);
  const marketPricePerKg = Number(this.marketPricePerKg);
  this.totalRevenue = Number((quantityKg * marketPricePerKg).toFixed(2));

  if (typeof next === 'function') {
    next();
  }
});

module.exports = mongoose.model('HarvestReport', harvestReportSchema);
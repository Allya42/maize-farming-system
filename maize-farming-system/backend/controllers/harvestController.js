const HarvestReport = require('../models/HarvestReport');
const Farm = require('../models/Farm');

async function generateNextAvailableId(Model, prefix, fieldName) {
  const regex = new RegExp(`^${prefix}\\d+$`, 'i');
  const records = await Model.find({ [fieldName]: regex }).sort({ [fieldName]: 1 });

  let maxNumber = 0;
  for (const record of records) {
    const match = String(record[fieldName]).match(new RegExp(`^${prefix}(\\d+)$`, 'i'));
    if (match) {
      const numericValue = Number(match[1]);
      if (!Number.isNaN(numericValue) && numericValue > maxNumber) {
        maxNumber = numericValue;
      }
    }
  }

  let nextId = `${prefix}${String(maxNumber + 1).padStart(3, '0')}`;
  let counter = maxNumber + 1;

  while (await Model.exists({ [fieldName]: nextId })) {
    counter += 1;
    nextId = `${prefix}${String(counter).padStart(3, '0')}`;
  }

  return nextId;
}

const handleControllerError = (err, res, next) => {
  if (typeof next === 'function') return next(err);
  console.error('🔥 Error:', err.message || err);
  return res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Server error'
  });
};

function computeRevenue(qty, price) {
  return Number((Number(qty) * Number(price)).toFixed(2));
}

exports.createHarvest = async (req, res, next) => {
  try {
    const requestedHarvestId = String(req.body.harvestId || '').trim();
    const finalHarvestId = requestedHarvestId && !(await HarvestReport.exists({ harvestId: requestedHarvestId }))
      ? requestedHarvestId
      : await generateNextAvailableId(HarvestReport, 'HR', 'harvestId');

    const existingHarvest = await HarvestReport.findOne({ harvestId: finalHarvestId });
    if (existingHarvest) {
      return res.status(409).json({
        success: false,
        message: `Harvest ID '${finalHarvestId}' already exists. Please use a unique ID.`
      });
    }

    const farm = await Farm.findOne({ farmId: req.body.farmId });
    if (!farm) return res.status(400).json({
      success: false, message: `Referenced farm '${req.body.farmId}' does not exist`
    });
    
    const quantityKg = Number(req.body.quantityKg);
    const marketPricePerKg = Number(req.body.marketPricePerKg);
    
    if (!(quantityKg > 0) || !(marketPricePerKg > 0)) {
      return res.status(400).json({
        success: false, message: 'Quantity and price must be positive numbers'
      });
    }

    // Create the new harvest document
    const harvest = new HarvestReport({
      harvestId: finalHarvestId,
      farmId: req.body.farmId,
      season: req.body.season,
      harvestDate: req.body.harvestDate,
      quantityKg: quantityKg,
      marketPricePerKg: marketPricePerKg,
      totalRevenue: quantityKg * marketPricePerKg
    });
    
    await harvest.save();
    
    res.status(201).json({ success: true, data: harvest });
  } catch (err) { handleControllerError(err, res, next); }
};

exports.getHarvests = async (req, res, next) => {
  try {
    const { season, farmId } = req.query;
    const filter = {};
    if (season) filter.season = season;
    if (farmId) filter.farmId = farmId;
    const harvests = await HarvestReport.find(filter).sort({ harvestDate: -1 });
    res.json({ success: true, count: harvests.length, data: harvests });
  } catch (err) { handleControllerError(err, res, next); }
};

exports.getHarvestById = async (req, res, next) => {
  try {
    const h = await HarvestReport.findOne({ harvestId: req.params.id });
    if (!h) return res.status(404).json({ success: false, message: 'Harvest not found' });
    res.json({ success: true, data: h });
  } catch (err) { handleControllerError(err, res, next); }
};

exports.updateHarvest = async (req, res, next) => {
  try {
    const existing = await HarvestReport.findOne({ harvestId: req.params.id });
    if (!existing) return res.status(404).json({ success: false, message: 'Harvest not found' });

    const nextHarvestId = req.body.harvestId ? String(req.body.harvestId).trim() : existing.harvestId;
    if (nextHarvestId && nextHarvestId !== existing.harvestId) {
      const duplicate = await HarvestReport.findOne({ harvestId: nextHarvestId });
      if (duplicate && duplicate._id.toString() !== existing._id.toString()) {
        return res.status(409).json({
          success: false,
          message: `Harvest ID '${nextHarvestId}' already exists. Please choose a different one.`
        });
      }
    }

    if (req.body.farmId && req.body.farmId !== existing.farmId) {
      const farm = await Farm.findOne({ farmId: req.body.farmId });
      if (!farm) return res.status(400).json({
        success: false, message: `Referenced farm '${req.body.farmId}' does not exist`
      });
    }

    const quantityKg = req.body.quantityKg !== undefined
      ? Number(req.body.quantityKg) : existing.quantityKg;
    const marketPricePerKg = req.body.marketPricePerKg !== undefined
      ? Number(req.body.marketPricePerKg) : existing.marketPricePerKg;

    // Update the fields directly on the document
    existing.harvestId = nextHarvestId;
    existing.farmId = req.body.farmId || existing.farmId;
    existing.season = req.body.season || existing.season;
    existing.harvestDate = req.body.harvestDate || existing.harvestDate;
    existing.quantityKg = quantityKg;
    existing.marketPricePerKg = marketPricePerKg;
    existing.totalRevenue = quantityKg * marketPricePerKg; // Recalculate

    // Save (this will trigger the pre('save') hook again for safety)
    await existing.save();

    res.json({ success: true, data: existing });
  } catch (err) { handleControllerError(err, res, next); }
};

exports.deleteHarvest = async (req, res, next) => {
  try {
    const deleted = await HarvestReport.findOneAndDelete({ harvestId: req.params.id });
    if (!deleted) return res.status(404).json({ success: false, message: 'Harvest not found' });
    res.json({ success: true, message: 'Harvest record deleted' });
  } catch (err) { handleControllerError(err, res, next); }
};
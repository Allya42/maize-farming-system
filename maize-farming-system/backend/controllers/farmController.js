const Farm = require('../models/Farm');
const Farmer = require('../models/Farmer');
const DiseaseReport = require('../models/DiseaseReport');
const HarvestReport = require('../models/HarvestReport');

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

exports.createFarm = async (req, res, next) => {
  try {
    const farmer = await Farmer.findOne({ farmerId: req.body.farmerId });
    if (!farmer) {
      return res.status(400).json({
        success: false,
        message: `Referenced farmer '${req.body.farmerId}' does not exist`
      });
    }

    const requestedFarmId = String(req.body.farmId || '').trim();
    const finalFarmId = requestedFarmId && !(await Farm.exists({ farmId: requestedFarmId }))
      ? requestedFarmId
      : await generateNextAvailableId(Farm, 'FM', 'farmId');

    const farm = await Farm.create({
      ...req.body,
      farmId: finalFarmId
    });
    res.status(201).json({ success: true, data: farm });
  } catch (err) { next(err); }
};

exports.getFarms = async (req, res, next) => {
  try {
    const { search, farmerId } = req.query;
    const filter = {};
    if (search) {
      filter.$or = [
        { farmId:       { $regex: search, $options: 'i' } },
        { location:     { $regex: search, $options: 'i' } },
        { maizeVariety: { $regex: search, $options: 'i' } }
      ];
    }
    if (farmerId) filter.farmerId = farmerId;
    const farms = await Farm.find(filter).sort({ farmId: 1 });
    res.json({ success: true, count: farms.length, data: farms });
  } catch (err) { next(err); }
};

exports.getFarmById = async (req, res, next) => {
  try {
    const farm = await Farm.findOne({ farmId: req.params.id });
    if (!farm) return res.status(404).json({ success: false, message: 'Farm not found' });
    res.json({ success: true, data: farm });
  } catch (err) { next(err); }
};

exports.updateFarm = async (req, res, next) => {
  try {
    const update = { ...req.body };
    delete update.farmId;
    if (update.farmerId) {
      const farmer = await Farmer.findOne({ farmerId: update.farmerId });
      if (!farmer) return res.status(400).json({
        success: false, message: `Referenced farmer '${update.farmerId}' does not exist`
      });
    }
    const farm = await Farm.findOneAndUpdate(
      { farmId: req.params.id }, update, { new: true, runValidators: true }
    );
    if (!farm) return res.status(404).json({ success: false, message: 'Farm not found' });
    res.json({ success: true, data: farm });
  } catch (err) { next(err); }
};

exports.deleteFarm = async (req, res, next) => {
  try {
    const farm = await Farm.findOne({ farmId: req.params.id });
    if (!farm) return res.status(404).json({ success: false, message: 'Farm not found' });

    await DiseaseReport.deleteMany({ farmId: farm.farmId });
    await HarvestReport.deleteMany({ farmId: farm.farmId });
    await farm.deleteOne();

    res.json({ success: true, message: 'Farm and related records deleted' });
  } catch (err) { next(err); }
};

exports.approveFarm = async (req, res, next) => {
  try {
    const farm = await Farm.findOne({ farmId: req.params.id });
    if (!farm) return res.status(404).json({ success: false, message: 'Farm not found' });

    farm.status = req.body.status === 'Rejected' ? 'Rejected' : 'Resolved';
    farm.approvedBy = req.body.approvedBy || 'Admin';
    await farm.save();

    res.json({ success: true, message: 'Farm resolved', data: farm });
  } catch (err) { next(err); }
};
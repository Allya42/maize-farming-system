const Farmer = require('../models/Farmer');
const Farm = require('../models/Farm');
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

// CREATE
exports.createFarmer = async (req, res, next) => {
  try {
    const requestedFarmerId = String(req.body.farmerId || '').trim();
    const finalFarmerId = requestedFarmerId && !(await Farmer.exists({ farmerId: requestedFarmerId }))
      ? requestedFarmerId
      : await generateNextAvailableId(Farmer, 'F', 'farmerId');

    const farmer = await Farmer.create({
      ...req.body,
      farmerId: finalFarmerId
    });
    res.status(201).json({ success: true, data: farmer });
  } catch (err) { next(err); }
};

// READ ALL (with search + filter)
exports.getFarmers = async (req, res, next) => {
  try {
    const { search, district } = req.query;
    const filter = {};
    if (search) {
      filter.$or = [
        { name:     { $regex: search, $options: 'i' } },
        { farmerId: { $regex: search, $options: 'i' } }
      ];
    }
    if (district) filter.district = district;
    const farmers = await Farmer.find(filter).sort({ farmerId: 1 });
    res.json({ success: true, count: farmers.length, data: farmers });
  } catch (err) { next(err); }
};

// READ ONE
exports.getFarmerById = async (req, res, next) => {
  try {
    const farmer = await Farmer.findOne({ farmerId: req.params.id });
    if (!farmer) return res.status(404).json({ success: false, message: 'Farmer not found' });
    res.json({ success: true, data: farmer });
  } catch (err) { next(err); }
};

// UPDATE
exports.updateFarmer = async (req, res, next) => {
  try {
    const update = { ...req.body };
    delete update.farmerId; // prevent changing the unique ID
    const farmer = await Farmer.findOneAndUpdate(
      { farmerId: req.params.id }, update, { new: true, runValidators: true }
    );
    if (!farmer) return res.status(404).json({ success: false, message: 'Farmer not found' });
    res.json({ success: true, data: farmer });
  } catch (err) { next(err); }
};

// DELETE (with cascade)
exports.deleteFarmer = async (req, res, next) => {
  try {
    const farmer = await Farmer.findOne({ farmerId: req.params.id });
    if (!farmer) return res.status(404).json({ success: false, message: 'Farmer not found' });

    const farms = await Farm.find({ farmerId: farmer.farmerId });
    const farmIds = farms.map(f => f.farmId);

    await DiseaseReport.deleteMany({ farmId: { $in: farmIds } });
    await HarvestReport.deleteMany({ farmId: { $in: farmIds } });
    await Farm.deleteMany({ farmerId: farmer.farmerId });
    await farmer.deleteOne();

    res.json({
      success: true,
      message: 'Farmer and all related records deleted',
      data: { deletedFarms: farms.length }
    });
  } catch (err) { next(err); }
};
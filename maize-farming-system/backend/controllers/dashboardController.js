const Farmer = require('../models/Farmer');
const Farm = require('../models/Farm');
const DiseaseReport = require('../models/DiseaseReport');
const HarvestReport = require('../models/HarvestReport');

// Dashboard summary card data
exports.getStats = async (req, res, next) => {
  try {
    const [totalFarmers, totalFarms, totalDiseases, totalHarvests, agg, avg] = await Promise.all([
      Farmer.countDocuments(),
      Farm.countDocuments(),
      DiseaseReport.countDocuments(),
      HarvestReport.countDocuments(),
      HarvestReport.aggregate([
        { $group: { _id: null, totalKg: { $sum: '$quantityKg' }, totalRevenue: { $sum: '$totalRevenue' } } }
      ]),
      HarvestReport.aggregate([
        { $group: { _id: null, avgPrice: { $avg: '$marketPricePerKg' } } }
      ])
    ]);
    const totals = agg[0] || { totalKg: 0, totalRevenue: 0 };
    res.json({
      success: true,
      data: {
        totalFarmers, totalFarms, totalDiseases, totalHarvests,
        totalQuantityKg: totals.totalKg,
        totalRevenueUGX: totals.totalRevenue,
        averagePricePerKg: avg[0]?.avgPrice || 0
      }
    });
  } catch (err) { next(err); }
};

// Total harvested kg per season
exports.getHarvestBySeason = async (req, res, next) => {
  try {
    const data = await HarvestReport.aggregate([
      {
        $group: {
          _id: '$season',
          totalKg:      { $sum: '$quantityKg' },
          totalRevenue: { $sum: '$totalRevenue' },
          count:        { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

// Disease count per severity
exports.getDiseaseBySeverity = async (req, res, next) => {
  try {
    const data = await DiseaseReport.aggregate([
      { $group: { _id: '$severity', count: { $sum: 1 } } }
    ]);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

// $lookup — farmers with their farms + totals
exports.getFarmersWithFarms = async (req, res, next) => {
  try {
    const data = await Farmer.aggregate([
      { $lookup: { from: 'farms', localField: 'farmerId', foreignField: 'farmerId', as: 'farms' } },
      { $addFields: {
          farmCount: { $size: '$farms' },
          totalAcres: { $sum: '$farms.sizeAcres' }
      }},
      { $project: { farmerId: 1, name: 1, district: 1, farmCount: 1, totalAcres: 1 } },
      { $sort: { name: 1 } }
    ]);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

// $lookup — disease reports with farm locations
exports.getDiseasesWithFarms = async (req, res, next) => {
  try {
    const data = await DiseaseReport.aggregate([
      { $lookup: { from: 'farms', localField: 'farmId', foreignField: 'farmId', as: 'farm' } },
      { $unwind: { path: '$farm', preserveNullAndEmptyArrays: true } },
      { $project: {
          reportId: 1, diseaseName: 1, severity: 1, reportDate: 1,
          'farm.farmId': 1, 'farm.location': 1
      }},
      { $sort: { reportDate: -1 } }
    ]);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

// High severity reports
exports.getHighSeverityDiseases = async (req, res, next) => {
  try {
    const data = await DiseaseReport.find({ severity: 'High' }).sort({ reportDate: -1 });
    res.json({ success: true, count: data.length, data });
  } catch (err) { next(err); }
};

// Farms larger than 5 acres
exports.getLargeFarms = async (req, res, next) => {
  try {
    const data = await Farm.find({ sizeAcres: { $gt: 5 } }).sort({ sizeAcres: -1 });
    res.json({ success: true, count: data.length, data });
  } catch (err) { next(err); }
};

// Average market price
exports.getAveragePrice = async (req, res, next) => {
  try {
    const agg = await HarvestReport.aggregate([
      { $group: { _id: null, avgPrice: { $avg: '$marketPricePerKg' } } }
    ]);
    res.json({ success: true, data: { averagePricePerKg: agg[0]?.avgPrice || 0 } });
  } catch (err) { next(err); }
};
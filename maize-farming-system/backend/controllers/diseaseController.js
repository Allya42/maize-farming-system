const DiseaseReport = require('../models/DiseaseReport');
const Farm = require('../models/Farm');

async function generateNextReportId() {
  const reports = await DiseaseReport.find(
    { reportId: /^DR\d+$/i },
    { reportId: 1 }
  ).lean();

  const nextNumber = reports.reduce((highest, report) => {
    const number = Number(String(report.reportId).replace(/^DR/i, ''));
    return Number.isInteger(number) ? Math.max(highest, number) : highest;
  }, 0) + 1;

  return `DR${String(nextNumber).padStart(3, '0')}`;
}

exports.createReport = async (req, res, next) => {
  try {
    const farm = await Farm.findOne({ farmId: req.body.farmId });
    if (!farm) return res.status(400).json({
      success: false, message: `Referenced farm '${req.body.farmId}' does not exist`
    });

    for (let attempt = 0; attempt < 5; attempt++) {
      const reportData = { ...req.body, reportId: await generateNextReportId() };
      try {
        const report = await DiseaseReport.create(reportData);
        return res.status(201).json({ success: true, data: report });
      } catch (err) {
        if (err && err.code !== 11000) throw err;
      }
    }

    throw new Error('Unable to generate a unique disease report ID');
  } catch (err) { next(err); }
};

exports.getReports = async (req, res, next) => {
  try {
    const { search, severity, from, to, farmId } = req.query;
    const filter = {};
    if (search)   filter.diseaseName = { $regex: search, $options: 'i' };
    if (severity) filter.severity = severity;
    if (farmId)   filter.farmId = farmId;
    if (from || to) {
      filter.reportDate = {};
      if (from) filter.reportDate.$gte = new Date(from);
      if (to)   filter.reportDate.$lte = new Date(`${to}T23:59:59.999Z`);
    }
    const reports = await DiseaseReport.find(filter).sort({ reportDate: -1 });
    res.json({ success: true, count: reports.length, data: reports });
  } catch (err) { next(err); }
};

exports.getReportById = async (req, res, next) => {
  try {
    const report = await DiseaseReport.findOne({ reportId: req.params.id });
    if (!report) return res.status(404).json({ success: false, message: 'Report not found' });
    res.json({ success: true, data: report });
  } catch (err) { next(err); }
};

exports.updateReport = async (req, res, next) => {
  try {
    const update = { ...req.body };
    delete update.reportId;
    if (update.farmId) {
      const farm = await Farm.findOne({ farmId: update.farmId });
      if (!farm) return res.status(400).json({
        success: false, message: `Referenced farm '${update.farmId}' does not exist`
      });
    }
    const report = await DiseaseReport.findOneAndUpdate(
      { reportId: req.params.id }, update, { new: true, runValidators: true }
    );
    if (!report) return res.status(404).json({ success: false, message: 'Report not found' });
    res.json({ success: true, data: report });
  } catch (err) { next(err); }
};

exports.deleteReport = async (req, res, next) => {
  try {
    const deleted = await DiseaseReport.findOneAndDelete({ reportId: req.params.id });
    if (!deleted) return res.status(404).json({ success: false, message: 'Report not found' });
    res.json({ success: true, message: 'Disease report deleted' });
  } catch (err) { next(err); }
};

exports.approveReport = async (req, res, next) => {
  try {
    const report = await DiseaseReport.findOne({ reportId: req.params.id });
    if (!report) return res.status(404).json({ success: false, message: 'Report not found' });

    report.status = req.body.status === 'Rejected' ? 'Rejected' : 'Resolved';
    report.approvedBy = req.body.approvedBy || 'Admin';
    await report.save();

    res.json({ success: true, message: 'Disease report resolved', data: report });
  } catch (err) { next(err); }
};
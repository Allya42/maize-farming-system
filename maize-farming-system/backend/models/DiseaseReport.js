const mongoose = require('mongoose');

const diseaseReportSchema = new mongoose.Schema(
  {
    reportId:    { type: String, required: true, unique: true, trim: true },
    farmId:      { type: String, required: true, trim: true, index: true },
    diseaseName: { type: String, required: true, trim: true },
    symptoms:    { type: String, required: true, trim: true },
    severity:    { type: String, required: true, enum: ['Low', 'Medium', 'High'] },
    reportDate:  { type: Date,   required: true },
    reportedBy:  { type: String, required: true, trim: true },
    status:      { type: String, enum: ['Pending', 'Resolved', 'Rejected', 'Approved'], default: 'Pending' },
    approvedBy:  { type: String, trim: true, default: '' }
  },
  { timestamps: true, collection: 'diseaseReports' }
);

module.exports = mongoose.model('DiseaseReport', diseaseReportSchema);
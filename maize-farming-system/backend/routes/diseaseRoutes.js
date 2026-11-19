const express = require('express');
const router = express.Router();
const c = require('../controllers/diseaseController');

router.route('/').get(c.getReports).post(c.createReport);
router.route('/:id/approve').patch(c.approveReport);
router.route('/:id').get(c.getReportById).put(c.updateReport).delete(c.deleteReport);

module.exports = router;